---
layout: post
title: "A/B testing at the scale where it breaks"
date: 2023-01-15
categories: android development product
permalink: /writing/ab-testing-at-scale/
---

At Delivery Hero, we ran A/B tests across eight food delivery brands, 20+ countries, and over 120 million users.

Not all at once. Not always cleanly. But we learned a lot about what works and what doesn't when your "small" test is still reaching millions of people.

## The Scale Problem

At a small company, A/B testing is straightforward. Define a flag, split users randomly, measure the outcome, ship the winner. Tools like Firebase Remote Config handle this out of the box.

At Delivery Hero's scale, the challenge wasn't the testing — it was the targeting. A test for foodpanda Singapore might be irrelevant for Yemeksepeti Turkey. A pricing experiment that works in Germany could cause regulatory issues elsewhere. Country. Brand. User segment. Platform version. The combinations multiply fast.

## How We Built It

Experiment configuration lived on a server, not in the binary. The app fetched definitions at startup and cached locally.

```kotlin
data class Experiment(
    val key: String,
    val variant: String,
    val metadata: Map<String, String> = emptyMap()
)

class ExperimentManager(
    private val configProvider: RemoteConfigProvider,
    private val userContext: UserContext
) {
    fun getExperiment(key: String): Experiment {
        val config = configProvider.getExperimentConfig(key)
        val variant = assignVariant(config, userContext)
        trackExposure(key, variant) // Always track when you assign
        return Experiment(key = key, variant = variant)
    }

    private fun assignVariant(config: ExperimentConfig, context: UserContext): String {
        // Deterministic: same user always gets same variant
        val hash = (context.userId + config.key).hashCode().toLong().and(0xFFFFFFFFL)
        val bucket = hash % 100

        var cumulative = 0L
        for ((variant, percentage) in config.variants) {
            cumulative += percentage
            if (bucket < cumulative) return variant
        }
        return config.defaultVariant
    }
}
```

The deterministic assignment is critical. If a user sees variant A on session one and variant B on session two, your data is meaningless.

## The Instrumentation Problem

You can run the most perfectly designed experiment in history and measure the wrong thing.

The most common mistake: instrument the interaction ("button taps"), declare a winner, then wonder why revenue didn't move.

Before any experiment, we defined:
1. **Primary metric** — what the experiment is designed to move (checkout conversion)
2. **Guardrail metrics** — things you can't afford to hurt (crash rate, cancellation rate)
3. **Secondary metrics** — leading indicators explaining why the primary moved

If you haven't written these down before launch, you don't have an A/B test. You have a feature launch with ambiguous success criteria.

## The Sample Size Math People Skip

The single most common mistake in A/B testing at any scale: running tests for an arbitrary amount of time, then "checking if it looks good."

Pre-calculate your required sample size. Decide your minimum detectable effect upfront. If you want to detect a 1% improvement in a 20% baseline conversion rate, you need substantially more users than for a 5% improvement.

At 120M users, the temptation to peek mid-test is enormous. Don't.

## What Scale Teaches You

Two things surprised me.

First, **small effects are real effects**. A 0.5% conversion improvement doesn't sound like much. At Delivery Hero's order volume, it meant millions of additional orders per year. The math changes what's worth testing.

Second, **the best experiments are boring**. Big redesigns with dramatic hypotheses consistently showed null or negative results. Small changes — button copy, error message wording, loading state improvements — consistently moved the needle. Users care about clarity and speed, not creativity.

The most impactful A/B test I ran at Delivery Hero was a change to an error message. Three words changed. Checkout completion went up. That change is still in production.
