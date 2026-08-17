---
title: "The Shipped Default Cost 39 Points: When \"Think Harder\" Makes a Model Worse"
slug: "xhigh-minus-39"
date: 2026-08-15
summary: "Qwen3.8-27B ships with reasoning effort set to xhigh. Head-to-head at a 49K token budget, xhigh scored 218/260 against medium's 257/260 — 5.2x the reasoning tokens, 3.5x the wall time, for a net minus-39."
suite: "1A"
models: [qwen3.8-27b-q6-k-gguf]
---

Qwen3.8-27B is the first model on our roster to expose a reasoning-effort control in its chat template: `xhigh`, `medium`, or `low` (there is no "high" — the template hard-validates the three values). It ships with xhigh as the default. This is the story of measuring what that default actually does.

## The first red flag

Under our standard 16K completion cap, xhigh hit a failure mode we've catalogued before on other models: on a trivial bash scripting task, the model burned 16,383 reasoning tokens — the entire cap — and emitted a zero-token answer. All thinking, no output, score zero. We'd previously only seen this stall triggered by ambiguous prompts; this was a new trigger, induced purely by the effort setting on a task the model can otherwise do in its sleep.

The mechanism is visible in the chat template itself. `xhigh` injects a "think carefully" system line into the prompt. `medium` injects nothing — it's the neutral baseline. `low` injects a brevity line. Remove the xhigh line by hand and the same task drops from 16K reasoning tokens to about 3K.

## The fair fight: 49K budget

A fair objection: real deployments don't run 16K caps, so maybe xhigh just needs room. We reran the full 13-test 1A suite on the Q6_K build at a 49,152-token budget to find out what xhigh buys when it isn't starved.

**Result: xhigh 218/260 (83.8%) vs medium 257/260 (98.8%). A 39-point loss for the shipped default.**

The breakdown:

- **Two tests zeroed anyway.** Even with headroom available, two tests ran their per-test caps to 16,377 and 16,383 reasoning tokens and produced zero-token answers — tests medium had aced with room to spare.
- **The trivial task finished, expensively, and scored worse.** The bash task that stalled at 16K completed at xhigh after 31,137 reasoning tokens and 34.3 minutes — versus about 3.1K tokens and ~3 minutes at medium — and was judged 18/20 instead of 20/20, docked for rambling.
- **Where xhigh helped at all:** three tests picked up the single point medium had dropped on each, 19→20. Total upside across the entire suite: +3 points, best case.
- **The bill:** 115,039 reasoning tokens and 124 minutes of wall time at xhigh, versus 21,946 tokens and ~35 minutes at medium. That's 5.2× the tokens and 3.5× the time for a net −39 under realistic budgets — and at best +1 under an infinite one.

## Why this matters beyond one model

Vendors tune shipped defaults for something — demo impressiveness, leaderboard style, worst-case coverage — and that something is not necessarily your throughput or your score. If your local model exposes an effort knob, the default deserves a benchmark, not trust.

It also isn't as simple as "medium is safe." In a follow-up round ([browser-verification](/rounds/browser-verification)), the same model stalled *at medium* when the user prompt itself said to think deeply before answering — prompt-invited deliberation can trip the same spiral the template line does. The systemic fix is a hard reasoning-token budget; llama.cpp's `--reasoning-budget` flag family is the right shape for this, though LM Studio (0.4.16, our serving stack on an M5 Max MacBook Pro with 128 GB unified memory) doesn't yet expose a passthrough for it. Until then, the template-level medium setting is the working equivalent, and it's our production configuration for this model, full stop.

## What to take away

If you run Qwen3.8-27B locally: set reasoning effort to medium. You will get a materially smarter-scoring, 3.5× faster model than the one that comes out of the box. And if you run any reasoning model with an effort control, spend one evening benchmarking the levels against each other — the default cost this model 39 points out of 260.

## Method note

All scores are LLM-judged on a 0–20 scale per test against fixed private rubrics. Both arms ran the identical 13-test suite at temperature 0 on identical hardware; the xhigh arm used a 49,152-token budget (per-test caps applied where the task file defines them). Rubrics and gold answers are kept private to prevent benchmark contamination.
