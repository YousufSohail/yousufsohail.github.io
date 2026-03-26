---
layout: post
title: "We Adopted Jetpack Compose Early at Delivery Hero. Here's What Happened."
date: 2022-06-20
categories: android development jetpack-compose
permalink: /writing/jetpack-compose-early-adoption/
---

Jetpack Compose 1.0 was released in July 2021. By September, I was writing a proposal to adopt it in production at Delivery Hero.

By the time I left in April 2023, we had measurably faster UI development, a happier Android team, and a few scars to show for it.

## Why We Did It

Delivery Hero runs eight food delivery brands across 20+ countries. The Android team maintains a shared codebase for foodpanda, foodora, Yemeksepeti, and more. At 120M+ users, we couldn't move slowly — but we also couldn't afford a botched migration.

The case for Compose came down to three things:

**1.** The XML View system was showing its age. Custom views, complex state management across fragments, `notifyDataSetChanged()` everywhere — UI code was our hardest code to maintain.

**2.** Compose's declarative model matched how we already thought. We were using reactive streams (RxJava, then Flow) for state. Composables were the natural UI complement.

**3.** The 200% faster claim wasn't marketing. I had data from side projects. The development loop — change code, see preview update in real time, no need to deploy — genuinely was faster.

## How We Started

Not a big-bang migration. Never do a big-bang migration.

We started with a single new screen: a simple promotional modal during checkout. Pure Compose, wrapped in a `ComposeView` inside our existing XML layout. Completely isolated. If it broke, we could revert in minutes.

```kotlin
class PromoModalFragment : Fragment() {
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return ComposeView(requireContext()).apply {
            setContent {
                MaterialTheme {
                    PromoModalContent(
                        promo = viewModel.promo.collectAsState().value,
                        onDismiss = { viewModel.onDismiss() }
                    )
                }
            }
        }
    }
}
```

It shipped. No incidents. We expanded scope.

## What Actually Got Faster

**New screens:** Building from scratch in Compose is dramatically faster. No XML file, no binding inflation, no adapter boilerplate.

**UI iteration:** The live preview cut the "change, build, deploy, verify" loop by 60–70%.

**State management:** Compose's `State` and `remember` made it obvious where state lived. We stopped having bugs where Views showed stale data.

**What didn't get faster:** Complex shared element transitions. The Compose animation API is powerful but steep. Our first Compose animations took longer than equivalent XML animations.

## The Challenges Nobody Warned Us About

**Tooling was immature.** Layout Inspector barely worked with Compose in late 2021. Crash reports from composables were harder to trace. Some of this improved, but it was real pain in 2022.

**Not every engineer picked it up at the same speed.** Senior engineers who'd been doing Android for a decade found Compose a fundamentally different mental model. We ran internal workshops and pair-programming sessions — not optional.

**Third-party gaps.** Custom chart and map libraries had no Compose support. We kept those screens in XML. Accepted divergence.

## The Results

By Q1 2023:
- ~40% of new UI code written in Compose
- New screen development time down ~200% for UI-heavy screens
- UI-related bug counts in Compose screens measurably lower than XML equivalents
- Team consistently rated Compose as the improvement most improving daily work

## What I'd Tell a Team Starting Today

Start new. Don't migrate existing screens unless they need significant rework anyway. Build all new features in Compose.

Invest in education upfront. Two days of proper Compose training per engineer pays back in weeks.

Don't fight the model. If you're recreating XML View System patterns in Compose — imperative state updates, `notifyDataSetChanged()` equivalents — stop. You're doing it wrong.

The migration will take longer than you think. That's fine. Incremental progress is real progress.
