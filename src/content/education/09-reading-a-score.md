---
title: "Reading a Score: What a Zero Means, and When It Doesn't"
slug: "reading-a-score"
cluster: "methodology"
order: 9
summary: "A 0/20 can be a failed model, a stalled model, or a broken judge — and we've published examples of all three. How to read GAUNTLET numbers with the right amount of trust."
updated: 2026-08-25
---

Benchmark numbers invite more confidence than they deserve. This article is the calibration layer: what our scores are made of, the three very different things a zero can mean, and how much a single run should move your beliefs.

## The anatomy of a number

Every axis score decomposes into per-test grades of 0–20 ([how those are produced](/education/inside-a-test-suite/)). So a Generalist score of 94.6% is 246 points out of 260 across 13 tests — and the *distribution* matters more than the total. A model that scores 19 everywhere and a model that scores 20s with one catastrophic 0 can land on similar totals while being completely different tools. Model pages show per-suite breakdowns for exactly this reason: always look one level below the number you're about to quote.

## The three faces of zero

A 0/20 is the most ambiguous grade on the board. In our archived runs it has three distinct causes, and they say opposite things about the model.

**1. The model genuinely failed.** Wrong answer, broken code, fabricated fields. The boring case, and the one every zero gets assumed to be.

**2. The model stalled.** A reasoning model burned its entire token budget deliberating and returned an empty answer — 16,383 reasoning tokens, zero answer tokens is the canonical signature ([the full stall story](/education/reasoning-models-and-thinking/)). This is a real failure — an agent harness gets nothing either way — but it's a different *kind* of failure: several stalls on our board were induced by an effort setting or an ambiguity-loaded prompt, and vanished on a rerun at different settings ([example](/rounds/xhigh-minus-39)). A stalled 0 tells you about the model's reasoning control, not its competence at the task. Our data marks these distinctly, and the Thinking axis exists to aggregate them.

**3. The instrument broke.** The one nobody's leaderboard likes to admit. Our disclosed example: on complex code answers, our judge sometimes prefixed prose analysis before its JSON verdict; the old parser fed the prose to the JSON loader, failed, and recorded zeros — on complete, correct answers. It falsely scored one strong model 39/80 on a suite before we caught it. And because everything runs at temperature 0, the error was perfectly reproducible — determinism preserves mistakes as faithfully as results. The parser was fixed, affected runs re-judged, and the incident published ([here](/rounds/browser-verification)) — a judged benchmark that has never found a judge bug hasn't looked.

So when you see a zero: check whether it's flagged as a stall, check whether it's one weird zero in an otherwise strong row (instrument-smell), and only then read it as incompetence.

## What one run can and can't tell you

Most GAUNTLET results are **n=1 per test** — one deterministic run per model per test, disclosed in every method note. Temperature 0 makes that run *reproducible*, which is not the same as *representative*: change the quant, the runtime, or a sentence of the prompt and you may get a different trajectory ([the confound catalog](/education/why-scores-differ-day-to-day/)). Our standing rule is that a surprising result gets a repeat-run pass before we treat it as real — it's how the "Q6 beat Q8" finding graduated from anomaly to published claim ([that round](/rounds/quant-ladder)).

Variance across tests also isn't uniform, and isn't all bad. Analyzing score spread across our 87 scored runs splits the high-variance tests into two clean groups. Open-ended creative tasks — outline this deck, draft this document — show wide spreads with almost no zeros: that's *healthy* variance, real differences in judgment and thoroughness on subjectively-judged work. A small set of ambiguity-trap tasks shows wide spreads *with* clusters of hard zeros across many otherwise-strong models: that's the stall-magnet signature, a property of the prompt as much as the model. Two identical standard deviations, opposite meanings.

The honest posture, which we try to model: a leaderboard is a map of evidence, not a verdict. Strong claims need the score, the breakdown, and the failure mode — and we publish all three.

**Next, and last:** the same model, same suite, can score differently next month — [why scores differ day to day](/education/why-scores-differ-day-to-day/).
