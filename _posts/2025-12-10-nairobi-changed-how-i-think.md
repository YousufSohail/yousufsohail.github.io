---
layout: post
title: "Nairobi changed how I think about the code I write"
date: 2025-12-10
categories: life career
permalink: /writing/nairobi-changed-how-i-think/
---

I booked the flight to Nairobi six weeks into my role at Cashia. Not because I was asked. Because I wanted to understand where the product lived.

I'd been writing code for five months against a Kenyan market — APIs for M-PESA transactions, payment flows built around Kenyan mobile money patterns, a consumer app for users who interact with money differently than I do. But I'd been doing it from Dubai, in a coworking space, on a MacBook.

The code worked. But I was building abstractions of a place I'd never been.

So I went.

## What I Expected

I expected Nairobi to be "a city." I'd been to many cities. I thought I knew what that meant.

The matatus — minibuses with bold graphics and bolder horns — navigate the roads with a logic you understand after a few days but can't describe in rules. The city moves with an energy that doesn't match the "developing market" framing I'd encountered in product meetings.

The engineers I worked with had the same arguments engineers have everywhere. Which state management pattern is better. Whether to abstract early or wait for duplication. How much technical debt is acceptable in a pre-launch sprint.

The same arguments. The same craft. Different context.

## The M-PESA Moment

I sat with one of the Kenyan engineers and we walked through the M-PESA cash-out flow I'd built from Dubai.

He pointed out something I'd never have caught remotely.

In Kenya, M-PESA transactions have a cultural rhythm. Users check their M-PESA balance frequently — more than a bank balance — because M-PESA is the primary account for many people, not a secondary wallet. The transaction status screen I'd built was technically correct but behaviourally wrong: it showed "processing" without prominently surfacing the updated balance. In a market where the balance confirmation is the meaningful signal, not the processing indicator, the screen was optimised for the wrong thing.

Fifteen minutes of conversation. The insight came from being in the same room.

I went back and redesigned the confirmation screen that week.

## Nairobi National Park

On the weekend, I went to Nairobi National Park.

There are giraffes in Nairobi National Park. And beyond them, visible through the trees, is the Nairobi city skyline.

I took a photo I've thought about more than any other photo I've taken. The giraffe. The city. The same frame.

What I remember more than the photo is what I was thinking when I took it.

I was thinking: the people in those buildings are the users. Not "users" as an abstraction in a product spec. Actual people, in actual buildings, using an app I'm building to do actual transactions that matter to their daily lives.

The abstraction collapsed.

I flew back to Dubai. The code didn't change. My relationship to it did.

## Why I'm Writing This

Software engineers spend a lot of time optimising for things they can measure. Performance benchmarks. Test coverage. Delivery velocity.

Those things matter. But there's a category of understanding that doesn't show up in metrics — the contextual understanding of why the product you're building matters to the people it serves.

That understanding changes what you build. It changes what you think is worth arguing about. It changes how you feel when a feature ships.

If you're building a product for a market you've never been to, and you have any opportunity to go there: go.

It costs a week. It pays back for years.

## What Changed Concretely

After Nairobi:
- I started asking "what does this look like on 4G with intermittent drops" before "what does this look like on my MacBook on WiFi"
- I started treating transaction feedback UI as first-class, not nice-to-have
- I started thinking about who the user is before I think about what the feature is

Small shifts. They compound.

Seven months after that trip, I became Engineering Manager for the squad that owns the experience those users have every day.

I don't think that's a coincidence.
