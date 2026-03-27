---
layout: post
title: "Kotlin is my answer. Here's why it's still not everyone's."
date: 2025-12-01
categories: development android
permalink: /writing/why-kotlin/
---

I've been writing Kotlin since 2017. Before it was the default. Before Google recommended it. Before every Android tutorial assumed it.

Eight years later, it's still the language I reach for first. But not because it won.

## The argument everyone makes

"Kotlin is more concise." "Kotlin has null safety." "Kotlin has coroutines."

All true. All boring reasons.

Conciseness is nice. Null safety catches bugs. Coroutines are powerful. But if these were the only reasons, Kotlin would be a minor upgrade — Java with better syntax.

The real reason I use Kotlin is different.

## Kotlin fits how I think

When I model a domain — a payment flow, a feature flag, a user session — Kotlin lets me express the constraints in the type system.

A sealed class for payment states means the compiler tells me when I've missed a case. A data class for a transaction means equality works without boilerplate. An extension function on a domain type means the behavior lives next to the thing it describes.

These aren't features. They're design tools. They let me encode intent in a way that Java never did.

```kotlin
sealed interface PaymentState {
    data object Idle : PaymentState
    data class Processing(val transactionId: String) : PaymentState
    data class Completed(val receipt: Receipt) : PaymentState
    data class Failed(val reason: FailureReason) : PaymentState
}

// The compiler enforces exhaustive handling.
// Miss a state and the build fails.
// That's not convenience. That's correctness.
```

## The KMM factor

At Cashia, we run Kotlin Multiplatform. One codebase for business logic, shared across Android and iOS. I wrote about this in detail [here](/writing/kmm-in-production/).

KMM is the strongest argument for Kotlin that has nothing to do with syntax. If you write your domain layer in Kotlin, you can share it. That's not a language feature — it's a platform play.

## What about Flutter? What about Swift?

Flutter is excellent for certain products. Cross-platform UI with a single codebase. If I were building a content app or a utility, I'd consider it seriously.

But for fintech — where platform-native behavior matters, where you need deep access to payment SDKs, where the user's trust depends on the app feeling native — Flutter adds friction I don't want.

Swift is a great language. If I were iOS-only, I'd use it. But I'm not iOS-only, and KMM means I don't have to choose between platforms and code sharing.

## The honest downsides

Kotlin's build times are worse than Java's. The tooling, while improving, still has rough edges — especially for multiplatform. And the learning curve for coroutines is steeper than most tutorials admit.

I also see teams adopt Kotlin and write Java with Kotlin syntax. That's worse than writing Java. Kotlin rewards idiomatic usage. If you're not going to learn the idioms, don't switch.

## Why it's still not universal

Kotlin won Android. But it didn't win everything.

Backend teams that are happy with Java 21 don't need Kotlin. iOS teams have Swift. Web teams have TypeScript. Each language has a context where it's the natural choice.

Kotlin is mine because my context — mobile, multiplatform, fintech, type safety as a requirement — aligns perfectly with what it does well.

That's not a universal truth. It's a local one.

---

*The best language is the one that fits how you think and what you're building. For me, that's been Kotlin for eight years. Ask me again in eight more.*
