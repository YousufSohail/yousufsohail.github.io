---
layout: post
title: "KMM for 120 million users: an honest assessment"
date: 2022-12-10
categories: android development kotlin kmm
permalink: /writing/kmm-evaluation/
---

In late 2022, I led an R&D special interest group at Delivery Hero to evaluate Kotlin Multiplatform Mobile (KMM) as the company's next cross-platform strategy.

We had 120M+ users, eight brands, Android and iOS codebases that diverged constantly, and a business that couldn't afford mobile features shipping on one platform before the other.

Here's what we found.

## Why KMM, Why Now

Cross-platform mobile has a graveyard of failed bets. Xamarin. Cordova. React Native got closer. Flutter is genuinely good but requires a full rewrite and gives up native UI.

KMM is different in one important way: it doesn't try to replace your UI layer. You write shared Kotlin code for business logic, data, and domain — and keep native UI on both platforms. You don't rewrite your apps. You share the parts that make sense to share.

At Delivery Hero, the business logic layer was where Android/iOS divergence hurt most. Feature parity bugs — where Android and iOS implementations had subtle behavioural differences — were a consistent source of incidents. Sharing that layer was the pitch.

## How We Evaluated It

We picked three representative areas:
1. A networking layer (API client + response models)
2. A cart calculation module (business logic)
3. A local persistence utility (data layer)

We built each in KMM, shipped to Android first (easy — it's just Kotlin), then integrated the iOS side via the generated framework.

## What Worked

**Shared data models** were a clear win. Defining API response models, domain models, and mapping logic once — and having them work identically on both platforms — eliminates an entire class of parity bugs.

**Business logic sharing** worked well for deterministic, pure functions. Discount calculations, cart totals, validation rules. The kind of code business stakeholders describe once and you implement twice. Not anymore.

**Coroutines and Flow** worked in shared code. The iOS integration was clunky but functional. By the end of 2022, the story was improving fast.

## What Didn't Work (Yet)

**iOS integration friction.** Adding a KMM module to an existing iOS project was not plug-and-play. The generated framework had limitations around generics and null safety representation in Swift. Your iOS engineers need to understand what they're dealing with.

**Debugging across platforms.** When something went wrong in shared code, the debugging experience on iOS was significantly worse. Stack traces from the native side pointed into the compiled framework, not the Kotlin source.

**The ecosystem was still maturing.** `kotlinx.serialization` was solid. Ktor was solid. Beyond that, you were sometimes on your own.

## Our Verdict

KMM was not ready to be our primary cross-platform strategy in 2022 — but the direction was clearly right.

Our written recommendation: adopt KMM for new shared-logic modules going forward, don't attempt to migrate existing code, and revisit the full strategy in 12–18 months.

That's what happened. I left before the 18-month checkpoint, but the foundation was in place.

If you're evaluating KMM today, the landscape has improved significantly. JetBrains has been investing heavily. The tooling is better. The iOS story is cleaner.

The fundamental value proposition — share logic, keep native UI — remains the most sensible cross-platform approach I've seen. It respects the platforms instead of fighting them.

## One Unpopular Opinion

Most cross-platform mobile problems are not technical problems. They're organisational problems.

Android and iOS teams that share a product spec, share a design system, and talk daily don't have a parity problem — even with completely separate codebases.

KMM is a useful tool. It's not a substitute for a well-organised mobile team.
