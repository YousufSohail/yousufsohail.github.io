---
layout: post
title: "From first commit to a million users"
date: 2021-08-10
categories: android development career
permalink: /writing/building-airlift-consumer-app/
---

In February 2020, I joined Airlift Technologies as one of the early mobile engineers. There was no consumer Android app. Just a design mockup, a backend still being built, and a launch deadline.

Eighteen months later, the app was live in multiple cities with over a million users.

## Starting from Scratch Is a Privilege

Most engineers inherit code. You spend the first weeks understanding someone else's decisions, working around their technical debt, wondering why `UserManager2.kt` exists.

I didn't have that problem. Every file was new. Every architectural decision was mine to make — and mine to live with.

It felt like freedom. It was also terrifying.

## The Architectural Decisions That Mattered

MVVM and Clean Architecture from day one. By 2020, this was table stakes for any Android app expecting to scale. The separation of concerns paid dividends almost immediately — we could unit test ViewModels before the UI was connected, and swap data sources without touching business logic.

The module structure I wish I'd gotten right from the start: feature modules. I built a feature-based structure, but not strict enough. As the team grew, the boundaries blurred. Stricter module isolation from week one would have saved weeks of refactoring later.

One thing I got right: Hilt for DI. Every new engineer was productive within a day because the wiring was explicit.

## The On-Device ETA Engine

The feature I'm most technically proud of: an on-device ETA calculation for the driver app.

The problem: in Pakistan's mobile networks, API calls were unreliable during high-traffic periods. The driver app needed to show a passenger ETA even when the network was degraded.

The solution: do the calculation on-device using Google Maps' Distance Matrix for initial route data, then update locally based on the driver's GPS position as they moved.

```kotlin
class LocalEtaCalculator(
    private val routePoints: List<LatLng>,
    private val estimatedSpeedKmh: Double = 25.0
) {
    fun estimateRemainingMinutes(currentLocation: LatLng): Int {
        val remainingDistanceKm = calculateRemainingDistance(currentLocation)
        return ((remainingDistanceKm / estimatedSpeedKmh) * 60).toInt().coerceAtLeast(1)
    }

    private fun calculateRemainingDistance(currentLocation: LatLng): Double {
        val nearestPointIndex = findNearestRoutePoint(currentLocation)
        return routePoints
            .drop(nearestPointIndex)
            .zipWithNext { a, b -> SphericalUtil.computeDistanceBetween(a, b) }
            .sum() / 1000.0
    }

    private fun findNearestRoutePoint(location: LatLng): Int {
        return routePoints.indices.minByOrNull { i ->
            SphericalUtil.computeDistanceBetween(location, routePoints[i])
        } ?: 0
    }
}
```

Not perfect — road conditions change — but 90% accurate and never showed "loading" to a frustrated passenger.

## Scaling From 0 to 1M Users

The problems at 100 users are different from the problems at 10,000. Different again at 100,000. At 1M, different once more.

**Profile before optimising.** At 10,000 users, we had a hunch that map rendering was slow. I spent two days optimising it. At 100,000 users, crash reports showed the real bottleneck was in analytics batching. The two days were wasted.

**Handle offline first.** In Pakistan, spotty connectivity wasn't an edge case. We added local caching for critical screens and the experience improvement was dramatic.

**RecyclerView is not free.** Improper `DiffUtil` implementations turned scrolling into a janky mess at scale. Get this right early.

## What Startup Speed Does to Your Code

We shipped fast. Sometimes too fast. There are ViewModels in the Airlift codebase doing too much. There are classes named "Helper" because I didn't have time to think harder.

I don't regret any of it. The app launched on time. Users loved it. The foundation held.

But if I were doing it again: one extra week at the start drawing better module boundaries. That week would have saved a month of untangling later.

## The Best Part

I was in the room for every decision. When millions of users opened that app, every architecture call, every performance fix, every pixel — I knew exactly who made it and why.

That kind of ownership doesn't happen often. I'm still grateful for it.
