---
layout: post
title: "The feature flag framework we shipped at Cashia"
date: 2025-09-10
categories: android development engineering
permalink: /writing/feature-flags-android/
---

Feature flags are one of those things every team says they want and few implement well.

At Cashia, I built a feature flag framework from scratch, presented it at a company-wide tech demo, and drove adoption across all squads. Every critical feature now ships behind a flag.

## Why Feature Flags Matter

The obvious use case: hide an incomplete feature during development. But that's not the main reason to invest in a proper framework.

**Gradual rollouts.** Ship to 1% of users. Watch crash rates and error logs. If nothing breaks, roll to 10%, then 50%, then 100%. If something breaks, flip a flag — not a hotfix.

**Kill switches.** If a payment flow has a critical bug in production, you need to disable it in seconds without a deployment.

**A/B testing.** The mechanism for testing two versions of a UI.

At a pre-launch startup: the kill switch matters most. Launch day is when you discover the things testing didn't find.

## The Design

Four properties I wanted:

1. **Simple API** — adding a new flag touches one file
2. **Testable** — flag-dependent code is unit-testable without mocking remote config
3. **Safe defaults** — if remote config is unavailable, behave conservatively
4. **Observable** — flag changes are reactive, UI responds without restart

```kotlin
// One file for all flag definitions
object FeatureFlags {
    val CARD_TOP_UP = Flag("card_top_up", defaultValue = false)
    val NEW_ONBOARDING_FLOW = Flag("new_onboarding_flow", defaultValue = false)
    val MPESA_CASHOUT = Flag("mpesa_cashout", defaultValue = false)
    val UNIFIED_TRANSACTION_HISTORY = Flag("unified_tx_history", defaultValue = true)
}

data class Flag(val key: String, val defaultValue: Boolean)
```

The `FlagManager` interface provides runtime values:

```kotlin
interface FlagManager {
    fun isEnabled(flag: Flag): Boolean
    fun observe(flag: Flag): Flow<Boolean>
}

class RemoteFlagManager(
    private val remoteConfig: FirebaseRemoteConfig
) : FlagManager {

    override fun isEnabled(flag: Flag): Boolean = try {
        remoteConfig.getBoolean(flag.key)
    } catch (e: Exception) {
        flag.defaultValue // Safe fallback
    }

    override fun observe(flag: Flag): Flow<Boolean> = callbackFlow {
        val listener = remoteConfig.addOnConfigUpdateListener { update, error ->
            if (error == null && update.updatedKeys.contains(flag.key)) {
                trySend(isEnabled(flag))
            }
        }
        awaitClose { listener.remove() }
    }
}
```

For testing:

```kotlin
class TestFlagManager(
    private val overrides: Map<Flag, Boolean> = emptyMap()
) : FlagManager {
    override fun isEnabled(flag: Flag) = overrides[flag] ?: flag.defaultValue
    override fun observe(flag: Flag) = flowOf(isEnabled(flag))
}
```

Any class depending on `FlagManager` (the interface) is testable without touching Firebase:

```kotlin
@Test
fun `card top up button visible when flag is enabled`() {
    val flagManager = TestFlagManager(overrides = mapOf(FeatureFlags.CARD_TOP_UP to true))
    val viewModel = CardViewModel(flagManager, ...)
    // Assert button visibility
}
```

## The Startup Race Condition

Remote flags are fetched from the network. Your app starts. You check a flag. The network call hasn't completed. What do you return?

The naive answer — the default value — introduces measurement error in gradual rollouts. Users who hit the default in the first seconds get counted as "not in treatment" even if they should be.

Our solution: fetch with a timeout at startup, then proceed.

```kotlin
suspend fun fetchFlagsWithFallback() {
    try {
        withTimeout(2_000) {
            remoteConfig.fetchAndActivate().await()
        }
    } catch (e: TimeoutCancellationException) {
        // Use cached values from last successful fetch — don't block startup
    }
}
```

Firebase Remote Config persists the last successful fetch. Two seconds is enough on reasonable connections without meaningfully delaying startup.

## Getting Other Squads to Adopt It

The framework worked well for the Android team. Getting other squads to adopt the same flag infrastructure was the more interesting challenge.

I presented at a company-wide tech demo. The pitch: consistent kill-switch behaviour across mobile and web. The kill switch story landed better than the A/B testing story — because the kill switch is what saves your launch.

Good technical decisions don't sell themselves. You have to show people why they care.
