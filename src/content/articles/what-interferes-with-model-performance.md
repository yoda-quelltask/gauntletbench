---
title: "What On Your Mac Is Actually Interfering With Model Performance?"
slug: "what-interferes-with-model-performance"
date: 2026-08-30
summary: "OUTLINE — not yet written. The same model file, the same Mac, the same prompt, and wildly different results. This piece catalogues every confound this bench has caught red-handed, ranked by how much damage it did before we noticed."
draft: true
tags: [methodology, performance, confounds]
---

> **This is an outline for Dave's review, not a draft.** Nothing below is prose.
> Each section lists the claim, the evidence already on hand, and what still
> needs measuring before the claim can be made in public. Prose starts after
> approval.

## The hook

The intuition everyone brings: a model is a file, the file is deterministic at
temperature 0, so the same file on the same machine gives the same answer.

This bench has now broken that assumption four separate ways on one laptop.

## Section 1 — The runtime is a variable, not plumbing

**Claim:** which program serves the model changes whether the model works at all.

**Evidence in hand (strongest we have — lead with it):**

- MO3, 2026-08-29. Byte-identical GGUF weights, same Mac, same prompts.
  LM Studio: roughly half of first attempts died with "Response ended
  prematurely." Ollama: 0 stream failures in 21 attempts, 1A 247/260,
  1B 160/160.
- Ruled out beforehand, across weeks: the engine build, the quantisation, the
  model family, the file itself. Every one of those was A/B'd and cleared.

**Still needed:** none. This section can be written today.

## Section 2 — The engine build underneath the runtime

**Claim:** the inference engine updates itself silently, and a silent update
between two rounds invalidates the comparison between them.

**Evidence in hand:**

- LM Studio ships runtime extension packs that auto-update by default. This
  project turned that off on 2026-08-22 specifically so round-over-round
  comparisons survive.
- Worse: `developer.autoDeleteExtensionPacks` deletes superseded packs, so an
  old result may be *unreproducible* — you cannot reinstall the engine that
  produced it.

**Still needed:** a clean statement of whether any published score straddles an
engine change. Check `env_telemetry` capture dates against pack versions.

## Section 3 — Quantisation is not a dimmer switch

**Claim:** more bits does not mean more quality, and the gap is not noise.

**Evidence in hand:** the 5-quant ladder (already published as a round). Q6_K
took the roster record; Q8_0, twelve gigabytes heavier than Q4, bought zero
extra points.

**Still needed:** nothing new — this section summarises and links the round.

## Section 4 — The confounds we have NOT yet isolated

Honest section. The piece is more credible for having one.

- **Thermal / power state.** Never controlled for. A benchmark run at 01:00 on a
  cold idle laptop is not the same machine as one run at 14:00 under load.
  No measurement yet.
- **Other processes competing for unified memory.** A 30 GB model on a 128 GB
  box leaves room, but Chrome, Docker and a language server do not ask
  permission. The client-isolation experiment is queued and unrun.
- **Neural Accelerator engagement.** Time-to-first-token gets a 3-4x lift;
  sustained tokens/second only ~1.2x. Open question whether the MLX runtime
  engages it at all.

## Section 5 — What to do about it

The practical takeaway, aimed at someone running models on their own machine:

1. Record the runtime and its version with every result, not just the model.
2. Turn off runtime auto-update if you ever intend to compare two dates.
3. Never turn a single failed generation into a verdict — measure the
   first-attempt failure rate of your box first.
4. Prefer the quant that scored, not the quant that is biggest.

## Open questions for Dave before this is written

1. **Does this name LM Studio directly?** The MO3 result is unambiguous and the
   project has not filed an upstream bug report yet. Publishing before reporting
   is a defensible choice but it is a choice — and it is the opposite order from
   what the ops notes currently recommend.
2. **Audience.** Written for someone who already runs local models, or for
   someone deciding whether to? Changes roughly half the vocabulary.
3. **Length.** The four-confound version is ~1,800 words. Cutting Section 4
   makes it ~1,100 and considerably less honest.
