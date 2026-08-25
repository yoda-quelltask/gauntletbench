---
title: "Speculative Decoding and MTP: Faster Without Getting Dumber"
slug: "speculative-decoding-and-mtp"
cluster: "concepts"
order: 5
summary: "Draft-and-verify generation can nearly double a model's speed with identical output quality — but only when the model and engine both support it. Why 'which runtime is faster' has become a per-model question."
updated: 2026-08-25
---

Every speed trick covered so far — smaller quants, fewer active parameters — buys speed by changing the model. **Speculative decoding** is different: it makes the *same* model faster, with provably identical output. It's also the reason "which runtime is fastest" no longer has a single answer.

## The bottleneck it attacks

Language models generate **autoregressively** — one token at a time, each requiring a full pass through the weights. On local hardware that pass is dominated by reading billions of parameters out of memory, so generation speed is essentially memory bandwidth divided by model size. The model's actual math is often idle by comparison. One token per full read is a wasteful way to spend all that bandwidth.

## Draft, then verify

Speculative decoding spends the idle capacity on a bet. A small, fast **draft model** proposes the next several tokens in a burst. The big model then checks the whole proposed run in a *single* pass — verifying multiple tokens for the memory cost of generating one. Proposals the big model agrees with are accepted wholesale; the first disagreement is corrected and drafting resumes from there.

The elegant part: the verification step accepts only tokens the big model would have produced itself. The output is exactly what the big model alone would have written — this is a pure speed optimization, not a quality trade. When the draft guesses well (boilerplate, code, structured output), throughput multiplies; when it guesses badly, you fall back toward normal speed. The classic setup's cost is operational: you must find, load, and keep in memory a second, compatible model.

## MTP: the draft model moves in

**Multi-token prediction (MTP)** removes that hassle by baking small draft "heads" directly into the main model's weights — extra prediction layers, trained with the model, that propose the next few tokens natively. No second model to choose or load; the drafter literally ships inside the same file, and an engine that recognizes it lights it up automatically.

The catch — and this is the load-bearing fact — is that **MTP is a property of a specific model plus a specific engine**, not a general runtime feature. The current concrete example: Google shipped Gemma 4 with MTP drafter weights, and Ollama's MLX engine added a Gemma-4-specific fast path to exploit them, measuring up to ~90% faster on coding benchmarks ([their announcement](https://ollama.com/blog/faster-gemma-4-mlx-mtp), [the implementation PR](https://github.com/ollama/ollama/pull/15980)). A dense model with no drafter heads gets none of that on the same engine, because there's nothing to invoke.

## Why this scrambles runtime comparisons

We learned this the honest way. An early cross-runtime pilot of ours appeared to show one engine dramatically faster for a Gemma-4-class MoE — until we decomposed the result: the faster side was running both a lower-precision quant *and* the MTP fast path, stacked. Meanwhile a dense model on that same "faster" engine came out *slower* than our LM Studio baseline, despite also running fewer bits. Independent head-to-heads tell the same story: engine-vs-engine gaps on Apple Silicon have narrowed to near-noise for ordinary models ([one such test](https://pub.towardsai.net/i-tested-ollama-vs-lm-studio-on-the-same-mac-one-quietly-doubled-its-speed-ad8dcb6a89f7)) — but an architecture-specific path like MTP blows the comparison open for exactly the models that have it.

So the question "is engine A faster than engine B?" now decomposes into three: same quant on both sides? Does this architecture have a speculative path on either engine? And is that path actually engaged? Skip any of the three and you'll confidently measure the wrong thing — which is why our own speed numbers always name the exact artifact and runtime, and why we treat speed findings as non-transferable between runtimes ([more on confounds](/education/why-scores-differ-day-to-day/)).

## What to do with this

If you're picking a daily driver, check whether your model-and-engine pair has a speculative path — it can be the difference between 15 and 28 tok/s at identical quality, effectively free. If you're comparing runtimes yourself, match quants and know whether MTP is in play before you crown a winner. And expect this landscape to shift fast: MTP heads are appearing in more releases, and engine support is following model by model.

**Next:** speed is one axis of model behavior; the other is how much a model *thinks* before it speaks — and what happens when it can't stop. [Reasoning models and the stall](/education/reasoning-models-and-thinking/).
