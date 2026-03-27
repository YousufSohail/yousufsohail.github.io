---
layout: post
title: "Force-update your app without making users hate you"
date: 2025-10-20
categories: android development product
permalink: /writing/forced-app-updates/
---

Forced app updates are one of those features nobody asks for, nobody notices when they work, and everybody notices when they're missing.

I built a forced update mechanism at Cashia before our first public launch. It's been running in production since day one.

## The Problem Without Forced Updates

You ship v1.0. Three months later, you ship v1.3 with a critical security fix. You push it to the Play Store.

Now what?

Some users update immediately. Some eventually. Some have auto-update disabled and won't update for months. Six months on, you still have users on v1.0.

In a social app, this is manageable. In a payments app, users on a version with an unpatched security vulnerability is a liability. In a regulated fintech, it may be a compliance problem.

More practically: every API version you ship must stay compatible with every app version still in the wild. If 5% of users are on v1.0, your backend cannot remove any endpoint that v1.0 uses. The tail of old versions compounds into technical debt.

Forced updates give you a clean mechanism to say: below this version, we require an update to proceed.

## The Two Types

**Flexible update**: "A new version is available. Update when convenient." User can dismiss. Good for feature releases.

**Forced update**: "You must update before you can use the app." User cannot dismiss. For security fixes, critical bugs, API deprecations.

## The Server-Side Approach

Google Play's in-app update API works well but requires Google Play Services. For Cashia — where we needed a solution that worked across distribution channels — we implemented server-side version checking.

```kotlin
data class VersionCheckResponse(
    val minimumVersion: String,
    val recommendedVersion: String,
    val forceUpdateMessage: String?,
    val storeUrl: String
)

class VersionCheckUseCase(
    private val api: VersionApi,
    private val currentVersion: String
) {
    suspend fun check(): VersionCheckResult {
        val response = api.checkVersion(currentVersion)
        return when {
            currentVersion.isOlderThan(response.minimumVersion) ->
                VersionCheckResult.ForceUpdate(
                    message = response.forceUpdateMessage ?: "Please update to continue.",
                    storeUrl = response.storeUrl
                )
            currentVersion.isOlderThan(response.recommendedVersion) ->
                VersionCheckResult.OptionalUpdate(response.storeUrl)
            else ->
                VersionCheckResult.UpToDate
        }
    }
}

sealed class VersionCheckResult {
    data class ForceUpdate(val message: String, val storeUrl: String) : VersionCheckResult()
    data class OptionalUpdate(val storeUrl: String) : VersionCheckResult()
    object UpToDate : VersionCheckResult()
}
```

The version check fires on every app foreground. A `ForceUpdate` result shows a non-dismissable dialog with a single "Update Now" action.

## What People Get Wrong

**Blocking on network.** Don't make the app unusable while the version check is pending. Run it in the background on startup. Show the dialog only when you have a confirmed response. A slow network should not block the user from opening the app.

**Not communicating why.** "Please update to continue" is bad UX. "We've improved the security of your payments — please update to continue" is better. Users are more likely to update when they understand the reason.

**Using forced updates too often.** If you force-update for every release, users learn to resent it. Reserve forced updates for security fixes and API-breaking changes. Use recommended updates for everything else.

## The Launch Day Payoff

We shipped the forced update mechanism in v1.0 — the very first public release.

Three months later, we had our first critical bug. The fix was in v1.1. We set the minimum version to v1.1 and pushed the force update configuration.

Within 24 hours, adoption of the fix was essentially complete. No support tickets from users on the broken version. No backend compatibility maintenance.

Build it before you need it. The cost of not having it lands at the worst possible time.
