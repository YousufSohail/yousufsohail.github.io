---
layout: post
title: "Building a Payment Card Feature on Android: Architecture Deep Dive"
date: 2024-03-20
categories: android fintech architecture
permalink: /writing/tamara-card-architecture/
---

In 2023, I built the Tamara Card feature on Android from scratch. Full ownership: architecture, implementation, vendor integration, launch.

The Tamara Card is a payment card for BNPL. Users issue a virtual card, add it to Google Pay, and pay anywhere Visa is accepted. In 2023, it was one of the first BNPL cards in Saudi Arabia.

Here's the architecture I landed on and what I learned building it.

## The Complexity You Don't See

From the outside, a card feature looks simple. Show the card. Allow the user to view details.

From the inside:
- Card data (PAN, CVV, expiry) is among the most sensitive data a mobile app can handle. Display it wrong and you're in breach of PCI compliance.
- Card issuance involves a third-party vendor (Network International), their SDK, and their authentication flows. You don't control the happy path.
- Adding to Google Pay involves the Issuer API, tokenisation, and Google's Push Provisioning flow — with its own failure modes.
- The UI state machine for "not issued → issuing → issued → locked" is more complex than it looks.

## The Architecture

A layered Clean Architecture with a dedicated `CardRepository` abstraction owning all card state.

```kotlin
// Domain layer — pure Kotlin, no Android dependencies
data class PaymentCard(
    val id: String,
    val maskedPan: String, // Last 4 digits only — never store full PAN
    val expiryMonth: Int,
    val expiryYear: Int,
    val status: CardStatus,
    val isGooglePayEligible: Boolean
)

enum class CardStatus {
    NOT_ISSUED, ISSUING, ACTIVE, LOCKED, EXPIRED
}

interface CardRepository {
    fun getCard(): Flow<Result<PaymentCard?>>
    suspend fun issueCard(): Result<PaymentCard>
    suspend fun lockCard(cardId: String): Result<Unit>
    suspend fun getSecureDetails(cardId: String): Result<CardSecureDetails>
}

// Fetched on demand, never persisted or cached
data class CardSecureDetails(
    val pan: String,
    val cvv: String,
    val expiryDate: String
)
```

The ViewModel coordinates the state machine:

```kotlin
class CardViewModel(
    private val cardRepository: CardRepository,
    private val googlePayRepository: GooglePayRepository
) : ViewModel() {

    val cardState: StateFlow<CardUiState> = cardRepository
        .getCard()
        .map { result ->
            result.fold(
                onSuccess = { card -> card?.toUiState() ?: CardUiState.NotIssued },
                onFailure = { CardUiState.Error(it.message) }
            )
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), CardUiState.Loading)
}
```

## The PCI Problem

Card numbers cannot be stored, logged, or included in crash reports. This sounds obvious until you see how many standard practices violate it:

**Crash reporting SDKs capture screen state.** If the PAN is on screen when a crash occurs, it goes to your crash backend. Disable screenshot capture in your crash reporter for card screens.

**Logging.** `Log.d("Card", card.toString())` — if `toString()` includes the PAN, you've logged sensitive data. Override `toString()` on any class containing card data to exclude sensitive fields.

**Navigation arguments.** Passing card details through navigation means they may appear in the back stack or logs. Never pass sensitive card data through navigation — fetch on demand.

## The Google Pay Integration

The "Add to Google Pay" flow is controlled by Google after your app initiates it:

```kotlin
suspend fun initiateGooglePayProvisioning(cardId: String): Result<Unit> {
    val token = issuerApi.getProvisioningToken(cardId).getOrElse {
        return Result.failure(it)
    }

    val request = PushProvisioningRequest.Builder()
        .setOpaquePaymentCard(token.opaquePaymentCard)
        .setNetwork(WalletConstants.CARD_NETWORK_VISA)
        .setTokenServiceProvider(WalletConstants.TOKEN_PROVIDER_VISA)
        .setDisplayName(token.cardholderName)
        .setLastFourDigits(token.lastFour)
        .build()

    return tapAndPayClient
        .pushProvision(activity, request, REQUEST_CREATE_WALLET)
        .toResult()
}
```

`pushProvision` launches an Activity owned by Google. Your app resumes in `onActivityResult`. Handle failure modes from both the issuer API and the Google flow — they fail in different ways.

## What I'd Do Differently

I built card details reveal as a bottom sheet dialog with a 30-second auto-dismiss. Secure, but annoying — users wanted to copy their PAN while making a purchase and the timer kept hiding it.

The better solution: show the PAN inline with copy buttons, but apply `WindowManager.LayoutParams.FLAG_SECURE` to the window. This prevents screenshotting and screen recording while the sensitive data is visible. You get usability without sacrificing the security property.

I shipped the bottom sheet. If I were building it today, I'd ship the inline view with `FLAG_SECURE`.

Build things. Ship things. Learn things.
