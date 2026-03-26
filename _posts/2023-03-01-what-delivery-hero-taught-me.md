---
layout: post
title: "What 18 Months at Delivery Hero Taught Me About Engineering at Scale"
date: 2023-03-01
categories: career engineering
permalink: /writing/what-delivery-hero-taught-me/
---

I joined Delivery Hero in October 2021 and left in April 2023. Eighteen months, eight brands, 120M+ users, 20+ countries.

Here's what actually stuck.

## Scale Changes Everything About How You Think

Before Delivery Hero, I used "scale" loosely. At Airlift, we scaled to 1M users and it felt enormous.

At Delivery Hero, 1M users was a rounding error.

When you build for 120M users, you can't test everything manually. You can't read every crash report. You can't reason about individual user behaviour — you reason about distributions. Your mental model shifts from "what will this do to a user" to "what will this do to the 95th percentile of users in P70 network conditions."

That's not a comfortable shift. It takes time. Once you make it, you never go back.

## The Organisational Lesson

DH was the first company where I understood what "engineering organisation at scale" actually means.

The Android team wasn't one team. It was multiple squads, each owning a product domain, each with its own roadmap. The platform team maintained shared infrastructure. Feature teams consumed it.

The consequence: the thing that slowed teams down most wasn't technical complexity. It was **coordination cost**. Feature A depended on a change in a shared library owned by Feature B's team. Feature B was busy. Feature A was blocked.

The engineers who were most effective weren't the ones who wrote the best code. They were the ones who understood the dependency graph — and communicated across team boundaries before blockers materialised.

I started doing that. It changed how I worked.

## The Testing Culture

82% unit test coverage. UI tests for critical flows. PR review that caught logic errors before they hit staging.

I'd worked at companies that talked about testing. DH was the first where I felt it in my daily work. New engineers got time to write tests. PRs that reduced coverage required explicit justification. Test infrastructure was treated as a product.

The payoff: we shipped features 2x faster than comparable teams at previous companies — not because we coded faster, but because we broke things less and caught problems earlier.

## The KMM Bet

I led the R&D group that evaluated KMM as DH's cross-platform strategy. That's a [separate post](/writing/kmm-evaluation/), but the meta-lesson is worth noting here:

At a company of this size, the cost of the wrong platform decision is enormous. Migration has a blast radius measured in engineering-years. So the evaluation was thorough, rigorous, and slow — deliberately.

That deliberateness was new to me. In startups, you pick a technology, try it for two weeks, and ship it. At Delivery Hero, a platform bet had to survive a 12-month evaluation. I used to find that frustrating. Now I think it's right.

## What I Wish I'd Done Differently

I spent too much time at DH on execution and not enough on influence.

I shipped features. I got things done. But I was less effective than I could have been at the higher-leverage work: advocating for architectural changes, building alignment across teams, writing the docs that would have helped engineers beyond my immediate squad.

The engineers who made the biggest impact at DH weren't the highest-output coders. They were the ones who made everyone around them more effective.

I learned that lesson at DH. I started applying it at Tamara. I'm still applying it now.
