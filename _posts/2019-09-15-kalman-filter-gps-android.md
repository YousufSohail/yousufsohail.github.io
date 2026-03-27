---
layout: post
title: "I used a Kalman filter to fix GPS on cheap phones"
date: 2019-09-15
categories: android development
permalink: /writing/kalman-filter-gps-android/
---

GPS on cheap Android phones is a mess. If your app relies on location and you've never tested it on a budget device with a 2015 chipset, you're going to get support tickets.

At Bykea, location was everything. Riders track their route. Passengers watch the bike approach. The whole product depends on the map being accurate. But a significant chunk of our user base — drivers especially — was on budget hardware. And the GPS readings we were getting were creative.

## The Problem

A location reading every second. The rider is clearly going straight down a road. But on screen, the dot is zigzagging left and right, occasionally teleporting half a kilometre. The GPS module in a cheap phone picks up signal interference, multipath errors, atmospheric noise. You get accuracy readings that say ±50m when the real uncertainty is ±150m.

Location-related complaints were running high. "The app says I'm in the wrong place." "My passenger can't find me." "My route shows me going through a building."

Complaining about hardware quality wasn't an option. We had to fix it in software.

## Enter the Kalman Filter

The Kalman filter is a mathematical algorithm that estimates the state of a system over time, accounting for uncertainty in both measurements and the model. It was developed in the 1960s for aerospace navigation. It's now in your GPS unit, your phone's sensor fusion layer, and — after a few hours of research — Bykea's Android app.

The core idea: instead of blindly trusting each new GPS reading, you maintain an estimate of current position plus a confidence value. When a new reading arrives, you weight it against your existing estimate based on how confident you are in each.

```kotlin
class KalmanLatLongFilter(
    private val accuracyMetresPerSecond: Float = 3f
) {
    private var minAccuracy = 1f
    private var timestampMs: Long = 0
    private var lat = 0.0
    private var lng = 0.0
    private var variance = -1f // negative means uninitialised

    fun process(
        newLat: Double,
        newLng: Double,
        accuracy: Float,
        timestampMs: Long
    ) {
        val acc = if (accuracy < minAccuracy) minAccuracy else accuracy

        if (variance < 0) {
            this.timestampMs = timestampMs
            lat = newLat
            lng = newLng
            variance = acc * acc
            return
        }

        val timeIncMs = timestampMs - this.timestampMs
        if (timeIncMs > 0) {
            variance += timeIncMs.toFloat() * accuracyMetresPerSecond * accuracyMetresPerSecond / 1000
            this.timestampMs = timestampMs
        }

        // Kalman gain: how much to trust the new measurement vs our estimate
        val k = variance / (variance + acc * acc)
        lat += k * (newLat - lat)
        lng += k * (newLng - lng)
        variance = (1 - k) * variance
    }

    fun lat(): Double = lat
    fun lng(): Double = lng
    fun accuracy(): Float = Math.sqrt(variance.toDouble()).toFloat()
}
```

Usage in your `LocationCallback`:

```kotlin
val kalmanFilter = KalmanLatLongFilter(accuracyMetresPerSecond = 3f)

override fun onLocationResult(result: LocationResult) {
    val location = result.lastLocation ?: return
    kalmanFilter.process(
        newLat = location.latitude,
        newLng = location.longitude,
        accuracy = location.accuracy,
        timestampMs = location.time
    )
    updateMap(kalmanFilter.lat(), kalmanFilter.lng())
}
```

The `accuracyMetresPerSecond` parameter controls how much uncertainty grows between readings — essentially how fast you expect the user to move. For a motorbike, 3 m/s was a good default.

## What Changed

The zigzagging stopped. Dots moved smoothly down streets. Location accuracy improved visibly without any hardware change.

We measured: location-related support complaints dropped by roughly 30% in the three months after shipping this.

## What I Learned

Two things.

First: problems that feel like hardware problems can often be solved in software. Budget devices aren't going away. Writing off a class of users because "their phone is bad" is bad product thinking and bad engineering.

Second: the 1960s had good algorithms. The Kalman filter predates GPS by two decades and outperforms most modern "smart" smoothing approaches for this specific problem. Before you reach for a neural network, check whether someone already solved this in 1960.
