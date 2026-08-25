---
title: "Inside a Test Suite: What We Ask, How We Judge, What Stays Private"
slug: "inside-a-test-suite"
cluster: "methodology"
order: 8
summary: "A walk through an actual GAUNTLET test using the two public community prompts we run verbatim — plus how 0–20 judging works, why temperature 0, and the contamination policy in plain words."
updated: 2026-08-25
---

Every score on this site starts as one model, one prompt, one 0–20 grade. This article walks through that unit of work — using the only prompts we can show you in full, and being explicit about why the rest stay hidden.

## What a test looks like

A test is three fixed artifacts: a **prompt** (the task), a **rubric** (what the judge rewards and penalizes, point by point), and for closed-form tasks a **gold answer** (the known-correct result). The prompts aren't puzzle-book material — they're versions of real work: write this script, extract these fields, draft this document, diagnose this failure. A suite is a themed bundle: the Generalist suite is 13 such tests (max 260 points); the agentic suite is 8 (max 160).

Two prompts in our browser-artifact suite are public property, taken from the local-model community and run **verbatim** — grammar quirks and all — precisely so our results stay comparable with everyone else's runs of the same prompts ([the round](/rounds/browser-verification)):

- **The parallax car**: build a single-file animated scene of a car driving through a parallax landscape — day/night cycle, moving scenery, layered depth. It probes whether a model can hold a dozen soft requirements in one coherent artifact. (Fun fact from our field: two of four models drew the car facing backwards.)
- **The verlet cloth sim**: an r/LocalLLaMA favorite — simulate hanging cloth on a canvas, draggable and tearable with the mouse. It's beloved because it stacks physics, rendering, and the single hardest thing in the genre: interaction handling. Every model in our first field failed the mouse interaction, each differently.

That's the flavor of the whole gauntlet: concrete deliverables with many ways to be subtly wrong.

## How judging works

Each response is graded by a fixed LLM judge against the test's rubric, on a **0–20 scale**, at **temperature 0**. Three deliberate choices there:

- **A rubric, not vibes.** The judge doesn't freestyle an opinion; it applies written criteria — did the script handle the edge case, did the extraction match the gold fields, did the draft flag the ambiguity it was supposed to flag. Same rubric for every model, forever, so scores are comparable across rounds.
- **0–20, not pass/fail.** Real work is partially correct all the time. A granular scale is what lets a 246 and a 257 mean different things ([why that matters](/education/reading-a-score/)).
- **Temperature 0 everywhere** — for both the model under test and the judge — so runs are reproducible rather than sampled. When something surprising happens at temperature 0, it will happen again, which is exactly what you want in an instrument.

The judge is an instrument, and instruments break: we've disclosed a parser bug that zeroed out correct answers, and runtime verification exists because judges reading code overstate reality. The next article covers both failure modes honestly.

## Why you can't see the other prompts

Everything except the two community prompts — every other prompt, every rubric, every gold answer — stays private. Not as secret sauce; as **contamination control**.

The plain-words version: models train on the public internet. The moment a benchmark's questions and answers are published, they start leaking into training data, and from then on the benchmark measures *memorization of itself* rather than capability. It's the reason famous public benchmarks decay. Our tests only work as an instrument if no model has ever seen them — so publishing them would spend the instrument to decorate a webpage. We hold the same line internally: suite content is eval-only, permanently excluded from any training or fine-tuning dataset connected to this project, and any model fine-tuned on suite material would be disqualified from being scored on it. The [contamination policy](/gauntlet#contamination) is the formal statement.

What we publish instead: every score, per-test breakdowns on model pages, the full methodology, round writeups with receipts — and the two community prompts above, which were already public and therefore already burned.

**Next:** you now know how a score is made. [How to read one](/education/reading-a-score/) — including when a zero doesn't mean what you think.
