---
layout: post
title: "What the Google Pay docs don't tell you"
date: 2024-08-05
categories: android fintech development
permalink: /writing/google-pay-integration/
---

At Tamara, I integrated Google Pay twice in the same year. First as tap-to-pay. Then as card provisioning.

The documentation for both is thorough, accurate, and somehow still insufficient for what you encounter in production.

## The Two Different Integrations

"Google Pay integration" sounds like one thing. It isn't.

**The Payment Sheet** (`google.android.gms.wallet`) is what most apps implement. User taps "Pay with Google Pay," a sheet appears, they authenticate, you get a token, you charge it.

**Push Provisioning** is what you need when your app issues cards. The user wants to add *your* card to Google Wallet for tap-to-pay at physical terminals. This requires an issuer agreement with Google, an agreement with the card network, and passes through your payment processor.

If you're building a payment card product: you probably need both. They are different integrations.

## The Certification Gauntlet

Before you can ship either in production, you go through Google's certification process:
- Submit a test APK
- Google tests against a UX and data handling checklist
- They send feedback
- You fix and resubmit

This process took six weeks. Not because we were slow — but because feedback items appeared sequentially. You fix item one, and item two becomes visible. It's not parallelisable.

**Start certification early.** Don't set a release date before you've been through at least one review cycle.

## The Button Rules Are Enforced

Google has strict guidelines for how the Pay and Add to Google Pay buttons must look. Size, padding, placement, colour, allowed text.

These are not suggestions. Certification checks them explicitly.

```kotlin
// Use the Google Pay button API — don't draw your own
val buttonOptions = ButtonOptions.newBuilder()
    .setButtonType(ButtonType.PAY)
    .setButtonTheme(ButtonTheme.DARK)
    .setCornerRadius(50)
    .build()

val googlePayButton = PayButton(context).apply {
    initialize(buttonOptions)
    setOnClickListener { launchGooglePay() }
}
```

The `PayButton` API handles compliance. A custom button that looks like the Google Pay button will fail certification.

## The Eligibility Check

Show the button only if the device supports it:

```kotlin
private fun checkGooglePayEligibility() {
    val request = IsReadyToPayRequest.newBuilder()
        .addAllowedPaymentMethod(PaymentMethod.CARD)
        .addAllowedCardNetwork(CardNetwork.VISA)
        .addAllowedCardNetwork(CardNetwork.MASTERCARD)
        .build()

    paymentsClient.isReadyToPay(request)
        .addOnCompleteListener { task ->
            if (task.isSuccessful && task.result == true) {
                showGooglePayButton()
            } else {
                hideGooglePayButton()
            }
        }
}
```

Not all devices support Google Pay. Not all accounts have saved payment methods. Don't assume.

## The Environment Confusion

Google Pay has `TEST` and `PRODUCTION` environments. Test returns fake tokens. Production returns real ones.

What's less obvious: your backend needs a *different* processing path for test tokens. The token structure looks the same. The downstream handling is completely different.

We spent two days debugging why staging was rejecting Google Pay tokens. Answer: staging backend was configured for test tokens but the app had accidentally switched to PRODUCTION in a config file.

```kotlin
sealed class GooglePayEnvironment {
    object Test : GooglePayEnvironment()
    object Production : GooglePayEnvironment()

    val walletConstant: Int get() = when (this) {
        is Test -> WalletConstants.ENVIRONMENT_TEST
        is Production -> WalletConstants.ENVIRONMENT_PRODUCTION
    }
}
```

Treat environment configuration as first-class. Not an afterthought in `BuildConfig`.

## The Token Lifetime

Provisioning tokens expire. For push provisioning, there's a window between fetching the token from your issuer and handing it to Google. Under load, if your issuer API is slow, the token can expire before you use it.

We saw this during high-load periods. The fix: fetch the provisioning token immediately when the user taps the button — not ahead of time, never cached.

## What Actually Went Well

The payment sheet integration, once certified, was rock solid. Google Pay payments had a lower failure rate than our direct card input flow.

The tap-to-pay experience, once provisioned, was seamless. Worth the certification pain.

Start the certification process early. Read the brand guidelines before designing a single pixel of UI. Treat environment configuration like production config — because it is.
