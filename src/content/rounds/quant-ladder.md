---
title: "More Bits Isn't More Brain: A 5-Quant Ladder Where Q6_K Beat Q8_0"
slug: "quant-ladder"
date: 2026-08-15
summary: "We ran the same 27B model at five quantization levels through the same 21-test gauntlet at temp 0. Quality was not monotonic with bits: Q6_K took the all-time roster record while Q8_0 — 12 GB heavier than Q4 — bought exactly zero extra points."
suite: "1A/1B"
models: [qwen3.8-27b-q6-k-gguf, qwen3.8-27b-q4-k-m-gguf, qwen3.8-27b-q8-0-gguf]
---

The default mental model of quantization is a dimmer switch: more bits, more quality, smoothly. When Qwen3.8-27B landed, we ran a ladder to test that directly — five artifacts of the same model on the same hardware (an M5 Max MacBook Pro with 128 GB unified memory running LM Studio), same prompts, temperature 0, reasoning effort at medium.

The ladder: Q4_K_M (17.7 GB), Q6_K (23.4 GB), and Q8_0 (30.0 GB) GGUF builds, plus two sideloaded MLX conversions. The MLX pair got disqualified before the finish line for a runtime-controls problem worth its own write-up ([separate story](/rounds/sideloaded-mlx-drop)), so the scored ladder is the GGUF trio.

## The board

Two suites: 1A, a 13-test general-capability suite (dev/ops scripting, document processing, content production, 260 points max), and 1B, an 8-test agentic tool-calling suite (160 max).

| Variant | Size | 1A /260 | 1B /160 | Total /420 | tok/s |
|---|---|---|---|---|---|
| Q6_K | 23.4 GB | 257 (98.8%) | 160/160 | **417** | 18.2 |
| Q4_K_M | 17.7 GB | 246 (94.6%) | 159 | 405 | 22.0 |
| Q8_0 | 30.0 GB | 246 (94.6%) | 159 | 405 | 23.2 |

Two roster records fell. Q6_K posted the first perfect 1B score any model has managed here, and its 1A per-test average of 19.8/20 beat the previous best (18.6, held by Qwen3.6-35B-A3B 4bit MLX). Every rung of this ladder — including Q4 — would have topped the leaderboard as it stood before this round.

## The non-monotonic part

Q6 > Q8 = Q4. That's the headline. The clearest single data point is a code-diagnosis test where the model has to spot a subtle string-handling bug: Q4_K_M scored 8/20, Q8_0 scored 10/20, and Q6_K scored a clean 20/20.

At temperature 0 that isn't sampling luck. The same weights rounded three different ways produced three different reasoning trajectories, and the middle rounding happened to land the best one. Quantization isn't a dimmer on a fixed mind — it's a slightly different mind at every rung.

Two caveats we hold ourselves to. First, this is n=1 per rung; our standing rule is that a surprising result gets a repeat-run pass before it hardens into "Q6 is smarter than Q8." Second, "non-monotonic" here means on this suite, this model, this backend — it's a documented existence proof, not a universal law.

One more pattern worth noting: Q6_K also *reasoned less*. It spent 21,946 reasoning tokens across the 1A suite versus roughly 32,000 for each of its siblings — about a third less thinking for a higher score. Whatever the rounding did, it didn't just preserve quality; it produced shorter, cleaner reasoning paths.

## What this means if you're picking a quant

- **Q8_0 is a bad deal for this model.** Its extra 12 GB over Q4_K_M bought zero points and its extra 6.6 GB over Q6_K bought minus 12. If you're memory-constrained, that's the slot to reclaim.
- **Don't assume the top quant is the safe choice.** Test the middle of the ladder. Q6_K-class quants have a reputation on r/LocalLLaMA as the sweet spot; here that reputation was earned with a record, not a rounding error.
- **Q4_K_M is genuinely usable** — 94.6% on a hard suite at 17.7 GB — but it and Q8 both stumbled on the same diagnosis-style test that Q6 aced, so the failure modes cluster on the hardest reasoning items, not spread evenly.

## Method note

All scores are LLM-judged on a 0–20 scale per test against fixed private rubrics. Runs at temperature 0, reasoning effort medium, n=1 per variant on identical hardware. Rubrics and gold answers are kept private to prevent benchmark contamination.
