---
title: "What Is a Local LLM, and Why Would You Run One?"
slug: "what-is-a-local-llm"
cluster: "concepts"
order: 1
summary: "A local model is a file on your disk and math on your own silicon. What that buys you — privacy, zero marginal cost, and total version control — and what it actually takes to run one."
updated: 2026-08-25
---

A large language model, at rest, is just a very large file of numbers — billions of learned **weights** (also called **parameters**) that turn your prompt into a response, one token at a time. When you use a hosted service, that file lives in someone else's datacenter and your prompt travels to it. A **local LLM** flips that: the weights sit on your own disk, and every token is computed on your own hardware. Your prompt never leaves the machine.

That one architectural difference buys three things.

## Privacy

Whatever you feed a local model — contracts, medical records, source code, a diary — stays on your hardware. There is no API log, no retention policy to read, no third party to trust. This isn't paranoia positioning; it's simply the default consequence of where the computation happens. For anyone processing documents they aren't allowed (or don't want) to upload, local is not a preference, it's the requirement.

## Cost

Hosted models bill by the token. A local model's marginal cost is electricity. If your workload is heavy and continuous — an agent making hundreds of calls a night, bulk document processing, iterative coding sessions — the economics invert fast. You pay once for hardware you probably already own, then run as much as you like.

## Control

Hosted models change underneath you: silent updates, deprecations, behavior drift. A local model is a pinned artifact — the exact same file produces the exact same behavior next month as today. That's precisely why this site can exist: our whole methodology depends on rerunning identical prompts at **temperature 0** (the setting that makes a model's output deterministic rather than sampled) and getting comparable results. You can't benchmark a moving target. You can benchmark a file.

There's a fourth, quieter benefit: it works on a plane, in a dead zone, and during an outage.

## What it actually takes

The binding constraint is **memory**, not raw compute. The whole model must fit in RAM (on Apple Silicon, **unified memory** that the GPU and CPU share) with room left for the working state of your conversation. The models on our leaderboard range from a 0.74 GB file (a 1-billion-parameter model) up to a 75 GB one (a 70-billion-parameter model at 8-bit precision) — all run on the same test host, an M5 Max MacBook Pro with 128 GB unified memory running LM Studio. A machine with 16–32 GB can run genuinely useful models in the 4B–14B range; the 20–35 GB files that dominate the top of our board want 48 GB or more.

Speed varies as much as size. On our host, measured **tokens per second** (how fast text streams out once generation starts) spans 5.7 tok/s for that 70B model up to 239 tok/s for the 1B — a 40x spread on identical hardware. Architecture matters as much as size here, which is its own article ([dense vs. mixture-of-experts](/education/dense-vs-mixture-of-experts/)).

## Are they actually good?

Better than their reputation, with a huge spread. The current leader on our board scores 99/100 on the Generalist axis — a 13-task suite of real dev/ops, document, and writing work — and posted a perfect run on the agentic tool-calling suite. The bottom of the board scores 27.5/100 on the same tasks. "Local models" is not one quality tier; it's a range wider than most people assume in both directions, and the whole point of this site is mapping it.

## Where they come from

Nearly every open model is published on Hugging Face, then repackaged into runnable formats by the community ([that story here](/education/file-formats-gguf-mlx-safetensors/)). Desktop apps like LM Studio and Ollama handle downloading and serve the model through an OpenAI-compatible local API, so tools built for hosted models work against your own machine with a one-line URL change.

**Next:** the first thing you'll hit when downloading a model is a wall of cryptic suffixes — Q4_K_M, 8bit, MXFP4. That's [quantization](/education/model-size-and-quantization/), and it's less scary than it looks.
