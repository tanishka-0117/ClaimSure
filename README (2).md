# ClaimSure - "Smarter Insurance, Faster Relief" 

> **DEVTrails 2026 University Hackathon | Guidewire | Seed. Scale. Soar.**

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Core Architecture](#core-architecture)
- [How It Works](#how-it-works)
- [Adversarial Defense & Anti-Spoofing Strategy](#adversarial-defense--anti-spoofing-strategy)
- [Tech Stack](#tech-stack)


---

## Overview

VeraShield is a parametric insurance platform built for gig economy delivery workers. It provides **automatic, real-time payouts** when severe weather conditions strand workers — no paperwork, no adjuster, no delay.

When a verified red-alert weather event is detected at a worker's confirmed location, the payout is triggered automatically within minutes.

---

## The Problem

Delivery workers face every storm, flood, and heatwave with zero financial protection. Traditional insurance is too slow, too complex, and too expensive for gig workers with variable incomes.

Parametric insurance solves this by tying payouts to **verifiable external triggers** like weather data. But it has one critical weakness — it is only as trustworthy as its location verification.

A coordinated syndicate of 500 delivery workers recently exploited a competing beta platform using GPS-spoofing apps and Telegram-coordinated timing attacks, draining the liquidity pool through mass fraudulent payouts. **Simple GPS verification is officially obsolete.**

---

## Our Solution

Two engines running in parallel — one to protect workers, one to protect the platform.

### Engine 1 — The Insurance Engine

A delivery worker opts into coverage before a shift. The platform monitors live weather feeds continuously via the OpenWeatherMap API. The moment a red-alert event hits the worker's verified location, a payout fires automatically — no claim form, no waiting.

### Engine 2 — The Fraud Detection Engine

Instead of trusting GPS alone, the system builds a **Composite Presence Score (CPS)** from multiple independent signals. A genuine stranded worker produces a coherent pattern across all signals. A fraudster at home cannot fake all of them simultaneously — their phone is still, indoors, idle, and on home cell towers regardless of what the GPS reports.

---

## Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Worker App (PWA)                        │
│              GPS · Network · Activity Signals               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Node.js / FastAPI)               │
│            Signal Ingestion · Scoring · Decision            │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
┌──────────────────┐         ┌──────────────────────┐
│  Weather Engine  │         │  CPS Scoring Engine  │
│  (OpenWeatherMap)│         │  (Rule-based Fraud   │
│  (Tomorrow.io)   │         │   Detection)         │
└──────────┬───────┘         └──────────┬───────────┘
           │                            │
           └──────────────┬─────────────┘
                          ▼
            ┌──────────────────────────┐
            │   Claims Decision Engine │
            │   Auto-Pay / Flag / Deny │
            └──────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │   Live Dashboard (React) │
            │   Map · Claims · Alerts  │
            └──────────────────────────┘
```

---

## How It Works

1. Worker taps "Start Shift" on the PWA — coverage begins
2. Backend monitors their city zone against live weather feeds
3. Red-alert threshold crossed → multi-signal CPS verification runs
4. CPS passes → payout auto-triggered, worker notified instantly
5. CPS flagged → tiered review workflow initiated silently

---

## Adversarial Defense & Anti-Spoofing Strategy

### 1. The Differentiation — Genuine Worker vs. Bad Actor

The **Composite Presence Score (CPS)** is a 0–100 confidence score derived from four independently verifiable signals. A real worker scores high naturally. A spoofer cannot fake all four at once.

**GPS trace pattern** — Genuine workers show micro-movement and route-consistent drift. Spoofed GPS is unnaturally static or perfectly smooth.

**IP Geolocation cross-check** — The worker's IP address is checked against their claimed GPS city via the ipinfo.io API. A city mismatch is an instant red flag and costs nothing to implement.

**App activity telemetry** — A genuine worker has active in-app interactions (accepting orders, navigating). A spoofer has an idle, inactive session.

**Device integrity check** — The system detects whether mock location APIs are enabled on the device, a direct indicator of spoofing intent.

---

### 2. The Data — Detecting a Coordinated Fraud Ring

**Temporal Clustering** — A real weather event strands workers across hours. A Telegram-coordinated syndicate triggers simultaneously. Any cluster of more than 10 claims from the same zone within a 5-minute window raises a Ring Alert.

**2-Source Weather Consensus** — A claim is only auto-approved if both OpenWeatherMap and Tomorrow.io confirm a red-alert at the worker's coordinates. Faking a GPS location to a storm zone doesn't help if that location shows clear skies on both feeds.

**Historical City Baseline** — Each worker has a home city derived from their registration and past activity. Any claim originating from a different city is automatically escalated for review.

---

### 3. The UX Balance — Flagged Claims Without Penalizing Honest Workers

> **Core Principle: The cost of missing fraud is financial. The cost of wrongly blocking a real claim is human. The system is calibrated to favour the worker.**

**Tier 1 — Auto-Approve (CPS ≥ 75)**
Payout fires instantly. Worker gets notified: *"We've got you covered. Your payout is on its way."*

**Tier 2 — Soft Verification (CPS 50–74)**
One non-intrusive prompt, framed as a network issue — never an accusation: *"We're having trouble confirming your location due to network conditions. Can you share a quick photo of your surroundings?"* If the worker is unreachable (dead battery, no signal), the claim auto-approves after 24 hours.

**Tier 3 — Review Queue (CPS < 50 or Ring Alert)**
Claim is silently paused. Worker sees: *"Your claim is being processed. We'll notify you within 2 hours."* A reviewer checks the signal bundle. Genuine workers are paid with an apology. The false-flag retrains the model.

---

## Tech Stack

**Frontend** — React, Tailwind CSS, Leaflet.js, Recharts

**Backend** — Node.js with Express

**Weather APIs** — OpenWeatherMap (free tier), Tomorrow.io

**Location Verification** — Browser Geolocation API + ipinfo.io

**Database** — Firebase (real-time, zero config)

**Mock Payouts** — Firebase field update + push notification




> DEVTrails 2026 — Phase 1 Submission

---

