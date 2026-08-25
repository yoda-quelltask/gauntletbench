---
title: "Dense vs. Mixture-of-Experts: How a 26B Model Runs Like a 4B"
slug: "dense-vs-mixture-of-experts"
cluster: "concepts"
order: 4
summary: "MoE models activate only a slice of their parameters per token — which is why a 26B can generate five times faster than a 27B on the same machine. What the A-number means, and the memory catch."
updated: 2026-08-25
---

Look at two neighboring entries on our leaderboard: a 27B **dense** model generating at 13.2 tokens per second, and a 26B **mixture-of-experts** model generating at 66.2 — five times faster, same host, nearly the same parameter count. That gap isn't quantization or engine magic. It's architecture, and it's the single most useful concept for predicting how a model will feel to use.

## Dense: everyone works every token

A dense model is the default design: every parameter participates in producing every token. A 27B dense model does 27 billion parameters' worth of work for each token it emits. On memory-bandwidth-bound hardware — which is what a laptop is during generation — that work rate maps almost directly onto speed. Big dense models are thorough and slow.

## MoE: a specialist committee with a router

A **mixture-of-experts (MoE)** model replaces some of its layers with many parallel "expert" sub-networks and a small router that picks which few experts handle each token. All the parameters exist, but only a fraction *activate* per token.

The naming convention tells you both numbers: **26B-A4B** means 26 billion total parameters, about 4 billion **active** per token. That active number is what your hardware actually computes per token — which is why the 26B-A4B above runs like a much smaller model. Per-token compute follows the A-number; knowledge capacity follows the total.

Real rows from our board, all on the same M5 Max MacBook Pro running LM Studio:

| Model | Total / active | File size | Mean tok/s |
|---|---|---|---|
| 27B dense (Q6_K) | 27B / 27B | 23.4 GB | 13.2 |
| 26B-A4B MoE (8bit) | 26B / 4B | 28.0 GB | 66.2 |
| 35B-A3B MoE (4bit) | 35B / 3B | 20.4 GB | 89.4 |
| 122B-A10B MoE (4bit) | 122B / 10B | 69.6 GB | 39.4 |
| 118B-A8B MoE (Q4_K_M) | 118B / 8B | 71.2 GB | 53.3 |

That last pair is the part that rearranges intuitions: 118-billion- and 122-billion-parameter models generating at 39–53 tok/s on a laptop — three to four times faster than the 27B dense model a third their size.

## The catch: memory doesn't get the discount

Only *compute* is sparse. The router might call on any expert for the next token, so **all** the parameters must sit in RAM. A 26B MoE needs 26B worth of memory, same as a 26B dense model. MoE trades memory for speed; it does not make big models small. If RAM is your constraint, the A-number does nothing for you — the total is your bill.

## Does the speed cost quality?

Less than you'd guess, but not nothing. In our browser-artifact round, the 35B-A3B MoE finished 4 points behind the leading 27B dense model on static scoring — at roughly six times its generation speed — and actually won the in-browser evaluation of the arcade-game task ([that round](/rounds/browser-verification)). Meanwhile the top of our overall Generalist axis is still held by a dense 27B at 99/100, with the best MoEs clustered at 92–95. The current honest summary from our data: dense still holds the quality ceiling; MoE gets you 90-plus percent of the way there at a multiple of the speed. For agentic and interactive use, that trade is very often correct.

## A note on hybrids

Architecture keeps moving under this dichotomy. Several newer models mix standard attention layers with **linear-attention** or Mamba-style state-space layers (one entry on our board is explicitly a hybrid Mamba-2/attention MoE). These hybrids have different compute patterns again, and inference engines optimize them unevenly — a real, separate variable when the same model behaves differently across runtimes, distinct from quant or architecture class. We flag it where we see it.

## How to use this

When you're sizing up a model card, read three numbers, not one: total parameters (memory bill and knowledge ceiling), active parameters (speed), and quant (fidelity — [previous article](/education/model-size-and-quantization/)). A "35B-A3B at 4bit" and a "27B dense at Q6" are not bigger-vs-smaller; they're fast-and-broad vs. slow-and-deep, and which one you want depends on whether you're chatting or waiting on an agent loop.

**Next:** there's a way to make models faster without changing the architecture at all — [speculative decoding and MTP](/education/speculative-decoding-and-mtp/).
