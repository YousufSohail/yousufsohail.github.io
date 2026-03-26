---
layout: post
title: "KMM in Production: 6 Months of Real Lessons"
date: 2026-01-15
categories: android development kotlin kmm
permalink: /writing/kmm-in-production/
---

I evaluated KMM at Delivery Hero in late 2022. Verdict: promising direction, not yet ready for full adoption. [Read that post here.](/writing/kmm-evaluation/)

At Cashia, I joined a team already running KMM in production. Six months in, here's the updated picture.

## What Changed Between 2022 and Now

A lot.

`SKIE` (Swift/Kotlin Interface Enhancer) has transformed the iOS integration story. In 2022, getting Kotlin flows and coroutines to work ergonomically from Swift required manual wrappers and ceremony. SKIE generates idiomatic Swift interfaces automatically. Our iOS engineers use shared KMM code in ways that feel native — not like wrapping a foreign library.

The plugin ecosystem has matured. `kotlinx.serialization`, `Ktor`, `SQLDelight` all have solid KMM support and we use all three in production.

Debugging has improved. Breakpoints in shared KMM code work from both Android Studio and Xcode for common cases.

## The Architecture at Cashia

The shared module owns:
- Domain models and business logic
- API clients and serialization (Ktor + kotlinx.serialization)
- Local persistence (SQLDelight)
- Repository interfaces and implementations
- UseCases

Platform-specific code owns:
- ViewModels (Android) and ObservableObjects (iOS)
- UI (Compose on Android, SwiftUI on iOS)
- Platform API wrappers (biometrics, notifications, deep links)

This boundary has held well. Friction lives at the edges — anything crossing from shared to platform code — but the core is clean.

## What's Actually Shared vs What Isn't

**Shared (works well):**
- API models and serialization
- Network error handling and retry logic
- Business logic — validations, calculations, state machines
- Repository implementations
- Flow-based data streams

**Platform-specific:**
- ViewModels / ObservableObjects — lifecycle semantics differ too much
- File system operations — path handling is platform-specific
- Cryptography — we use platform keystores (Android Keystore, iOS Secure Enclave)
- Push notification handling
- Biometric authentication

**The grey zone:**
- SQLDelight — driver is platform-specific, queries and schema are shared. Solution: define schema in shared, provide platform driver via DI. Works well.
- Image loading — no good cross-platform story. Coil on Android, AsyncImage on iOS. Accepted divergence.

## The ViewModel Boundary

The most common KMM architecture mistake: sharing ViewModels.

Tempting — you've already shared repositories and use cases. Why not go further?

Because ViewModels on Android are lifecycle-aware. On iOS, the equivalent is `ObservableObject` with SwiftUI's `@StateObject`. Lifecycle semantics differ. State management primitives differ. Observable state differs.

Sharing ViewModels means writing the lowest-common-denominator — losing platform-specific behaviour — or adding platform abstractions that make the shared ViewModel as complex as just writing two separate ones.

Write separate ViewModels. Have them call the same use cases. This is the right boundary.

```kotlin
// shared module
class GetTransactionHistoryUseCase(
    private val repository: TransactionRepository
) {
    operator fun invoke(): Flow<List<Transaction>> = repository.getTransactions()
}

// androidMain
class TransactionViewModel(
    private val getHistory: GetTransactionHistoryUseCase
) : ViewModel() {
    val transactions = getHistory()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}
```

```swift
// iOS — Swift
class TransactionViewModel: ObservableObject {
    @Published var transactions: [Transaction] = []
    private let getHistory: GetTransactionHistoryUseCase

    init(getHistory: GetTransactionHistoryUseCase) {
        self.getHistory = getHistory
        getHistory().watch { [weak self] result in
            self?.transactions = result
        }
    }
}
```

## The Architecture Migration

Cashia started with a layer-based structure: `data`, `domain`, `presentation` as top-level layers with features spread across them. The problem at scale: adding a feature means touching all three layers, and boundaries blur as the team grows.

We're migrating to feature-module structure: each feature owns its data, domain, and presentation internally. In KMM, each feature module exposes a clean public API, hiding internals from the Android and iOS apps.

Ongoing. One feature at a time, never mid-sprint. The pattern is right.

## Should You Use KMM?

2022: "promising, not yet."

2026: "yes, for the right cases."

**Right cases:** You have Android and iOS teams with genuine parity problems. Your business logic is complex enough that maintaining it twice is costly. Your iOS team knows Swift. You're willing to invest in the shared module architecture upfront.

**Wrong cases:** Very small team — just pick one platform. UI-heavy app with minimal business logic — nothing to share. Team without strong Kotlin expertise — the shared module is always Kotlin.

KMM is ready. The question is whether your problem warrants it.
