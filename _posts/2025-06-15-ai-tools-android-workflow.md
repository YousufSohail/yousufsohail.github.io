---
layout: post
title: "Which AI tools survived a year in my workflow"
date: 2025-06-15
categories: android ai productivity
permalink: /writing/ai-tools-android-workflow/
---

A year ago, I started deliberately integrating AI tools into my Android engineering workflow. Not to stay current, not because it was trendy — because I was curious whether any of it would actually change how fast I ship.

Here's what stayed and what didn't.

## The Honest Starting Point

I was sceptical. I'd used GitHub Copilot. It autocompleted boilerplate acceptably and occasionally suggested something subtly wrong in a way that was worse than nothing. My prior experience: useful for CRUD, unreliable for anything nuanced.

That was 2023. A lot changed.

## What Actually Stayed

### LLMs for Architecture Decisions

I use Claude as a rubber duck for architecture discussions. Not to generate code — to think through problems.

When I was designing the feature flag framework at Cashia, I described the constraints: Android + KMM, needs remote and local override, engineers should add a new flag in one file. I asked Claude to identify failure modes in my proposed design.

It surfaced two things I'd missed: a race condition during startup where remote config might not have loaded and a flag returns a stale default; and a missing test interface that would couple unit tests to the remote config SDK unnecessarily.

I fixed both before writing production code.

The pattern: describe the problem and constraints, propose your solution, ask "what are the failure modes and what am I missing?" Different from "write my code" — it's using LLMs for what they're actually good at.

### Pre-Review Before Human Review

I use AI to pre-review my own PRs before requesting human review. I paste the diff, ask for: (1) logic errors, (2) things a reviewer will flag, (3) whether the change matches the commit message.

In practice, it catches roughly 60% of what human reviewers would flag — mostly missing null checks, inconsistent error handling, tests that don't cover the unhappy path.

The other 40% — contextual knowledge, product implications, cross-team dependencies — it misses completely. That's why humans still review. But arriving at review with the obvious issues already addressed makes reviews faster and more substantive.

### Boilerplate Generation

`RecyclerView` adapters, `DiffUtil` implementations, ViewModel boilerplate, Room setup — deterministic enough that the output is usually right, tedious enough that generating manually is pure waste.

The rule: I read every line of AI-generated boilerplate before committing it. I've caught three incorrect suggestions in twelve months. None catastrophic. All would have caused bugs.

## What Didn't Work

**AI for business logic.** This is where subtle errors live. The code looks correct, compiles, passes the happy path test, and fails in production under edge conditions requiring domain knowledge to anticipate. I've stopped using AI to generate business logic directly.

**IDE-integrated autocomplete for Kotlin.** Too low-signal. Android Studio's built-in completion is already quite good, and AI overlay consistently offered plausible-looking alternatives wrong for my context. Turned it off after six weeks.

**AI for debugging.** I expected this to be useful. "Why is this crash happening?" In practice, AI doesn't have your full context — database state, network responses, navigation back stack. It gives generic suggestions already in your checklist.

## The Honest Assessment

AI tools have made me roughly 15–20% faster on uninteresting work — boilerplate, documentation, pre-review. They've made me more rigorous about architecture because having a tool that surfaces failure modes changes how carefully you describe systems.

They haven't replaced the hard parts. Understanding the Android threading model deeply enough to avoid ANRs, knowing when not to use a ViewModel, reading battery and memory profiles — these require accumulated experience that AI tools don't have.

Use the tools. Don't trust them blindly. Know what they're actually good at.
