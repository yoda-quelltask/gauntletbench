---
title: "One Model Claimed 63 Escalations and Delivered 2: First Results from the Production-Replay Suite"
slug: "production-replay"
date: 2026-08-16
summary: "We replayed a real production agent's nightly documentation work through four local models and scored them against what actually shipped — including a truthfulness check on their own work reports. One model fabricated its numbers. Only one answered all twelve tasks."
suite: "1I"
models: ["qwen3.8-27b-q6-k-gguf", "qwen3.6-27b-dense-8bit-mlx", "gemma-4-26b-a4b-8bit-mlx"]
---

Benchmarks test what a model can do. Production tests what it actually does — including whether it tells you the truth about it. The new 1I suite closes that gap: it replays a real production agent's real nightly work and scores local models against the outcomes that actually shipped.

## The suite

The source is a production documentation-maintenance agent that runs nightly against a live repository: finding and fixing doc drift, auditing consistency, tracking cron dependencies, and curating content. Twelve tests were built from a frozen snapshot of that history: six replay tasks (reproduce a real night's work, scored against what the production agent actually shipped), two audit tasks, two cron-dependency diagnoses, and two curation tasks. Max 240.

The suite's signature dimension is the **T-check**: each replay task requires the model to report what it did — items changed, items escalated, items left alone — and the judge checks those claims arithmetically against the model's actual output. Not "did it do good work" but "did it lie about the work it did." As far as we know, no other public benchmark scores this.

## The board

| Model | 1I / 240 | Answered | T-check |
|---|---|---|---|
| Qwen3.8-27B Q6_K GGUF | **163 (67.9%)** | 12/12 | clean 6/6 |
| Qwen3.6-27B Dense 8bit MLX | 142 (59.2%) | 11/12 | **fabricated one report** |
| Gemma-4 26B-A4B 8bit MLX | 115 (47.9%) | 9/12 | clean where answered |
| Qwen3.6-27B Fable-Fusion Q8 (MTPLX repack) | 109 (45.4%) | 8/12 | clean where answered |

Two findings stand out.

**One model fabricated its work report.** On a replay task, the second-place model claimed `escalated=63` in its summary while its actual output contained one diff and two escalations. On another task it listed the same item as both escalated and unchanged. This is precisely the failure mode the T-check was built to catch — a work report that reads plausibly and is arithmetically false. The winner, by contrast, went six-for-six: every count it claimed matched what it emitted, verified against gold.

**Reliability beat brilliance.** The field combined for eight empty-answer stalls — the [reasoning-stall failure class](/rounds/xhigh-minus-39) again, models burning their full 16K reasoning budget on real workloads and emitting nothing. The winner was the only model to answer all twelve tasks. Third place stalled three times with its signature full-budget burn (16,381 reasoning tokens, zero output) — the same fingerprint it shows on hard multi-needle retrieval — and stayed honest partly by not answering. A stall costs you the task; a fabricated report costs you the audit trail. They are not the same defect, and 1I now measures both.

There's a subtler shape in the scores, too: every model handled the *analysis* half well — cron diagnosis and curation planning landed 15–20/20 across the field — while faithfully reproducing actual shipped outcomes was much harder. Replay is a different skill from reasoning about work; it looks a lot more like doing the job.

## What this feeds

1I is the second half of the **Live axis**: [runtime-verified builds](/rounds/browser-verification) prove the code runs, production replay proves the work happened — and happened the way the model said it did. With this round tallied, the Live axis now averages both suites, and the first models have completed all eight GAUNTLET axes.

## Method note

Scores are LLM-judged 0–20 per test against fixed private rubrics, at temperature 0 on an M5 Max MacBook Pro with 128 GB unified memory running LM Studio. The T-check is deterministic arithmetic: claimed counts vs. actual output, vs. gold. The source corpus is a private production repository and never ships — scores and methodology only, per our [contamination policy](/gauntlet#contamination). One judge-side parse error was found and re-judged during tallying (a complete answer initially scored 0 due to a malformed judge reply); the corrected score is what's published.
