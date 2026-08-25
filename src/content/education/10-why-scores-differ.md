---
title: "Why Scores Differ Day to Day: A Field Guide to Confounds"
slug: "why-scores-differ-day-to-day"
cluster: "methodology"
order: 10
summary: "Same model, same suite, different number — how quants, engine versions, effort settings, prompt design, and run order each move benchmark results, and what we do about each one."
updated: 2026-08-25
---

Run the same benchmark twice and get two numbers, and most people conclude the benchmark is noise. The truth is more useful: nearly every "mystery" difference traces to a nameable variable that changed between runs. This closing article is our field guide to those variables — the confounds we've caught in our own results, in roughly the order they bite.

## 1. It wasn't the same model

The most common confound in all local-model comparison: two artifacts that share a name but not a precision. Our own cross-runtime pilot produced a dramatic "engine A is 2x faster" finding that partially dissolved on inspection — engine A was serving a ~4-bit build while our baseline ran 8-bit. A lower-bit build should be faster on any engine; part of the gap was precision, not runtime. (The rest was an architecture-specific fast path — see point 3.) We now hold a **matched-quant rule**: no cross-runtime speed claim unless both sides run the same bit-depth. And remember that even at identical settings, different quants of one model are slightly different minds that can diverge at temperature 0 ([the quant ladder](/rounds/quant-ladder)).

## 2. The engine changed under you

The inference engine inside your serving app — the llama.cpp or MLX runtime build — updates on its own schedule, independent of the app version, and by default silently. An engine update can change kernels, memory behavior, and speed; if one lands between your Monday and Friday runs, you benchmarked two different stacks and labeled them one. This one is insidious precisely because nothing in your workflow visibly changed. Our response: runtime auto-update is off on the test host, the exact engine build is recorded with every run, and a pending engine update is treated as an event to document — what changed, what it might touch — before it's applied, never a background bump. Expect engine-version tracking to become a recurring Lab theme here, because almost nobody's published numbers include it.

## 3. The speedup was architecture-specific

The same pilot's second lesson: one model got a genuine engine-side boost from multi-token prediction — a fast path that exists for that architecture only ([the MTP article](/education/speculative-decoding-and-mtp/)). A dense model on the same engine, at *lower* precision, came out slower than baseline. "Runtime X is faster" is now a per-model claim, and any comparison that doesn't say which models it holds for is underspecified.

## 4. The knobs weren't where you left them

Serving-time settings move scores as much as any hardware change. The measured example: one model's shipped reasoning-effort default cost it 39 points out of 260 against the neutral setting — 218 vs. 257, at 5.2x the token spend ([full round](/rounds/xhigh-minus-39)). Worse, settings can silently fail to apply at all: we found sideloaded MLX builds where the effort parameter was accepted by the API and then discarded ([that investigation](/rounds/sideloaded-mlx-drop)). Every run here logs its effective settings, and "the knob turned" is verified, not assumed.

## 5. Some prompts are volatile by design

Variance isn't spread evenly across a suite. In our analysis of 87 scored runs, a handful of tests account for a disproportionate share of score movement — led by three tasks that share a trait: they force the model to commit under genuine ambiguity (an open-ended judgment call atop exact arithmetic; a diagnosis whose honest answer is "unknowable from the given evidence"; a debugging task with a deliberately misleading error message). These reliably produce both brilliant answers and outright stalls from the *same class* of strong models ([why](/education/reasoning-models-and-thinking/)). A one-point suite difference that traces entirely to one volatile test is a different fact than a uniform one-point drift.

## 6. The confound we can't rule out yet

Full disclosure of an open item: our suites always run tests in the same fixed order, and the two most stall-prone tasks happen to sit late in their sequences — one 9th of 13, one dead last of 8. That means "this prompt is intrinsically hard" and "something about being the 9th consecutive request makes late tests worse" are currently indistinguishable in our data. The experiment that separates them — reversed and randomized-order passes, plus running the volatile tests standalone — is queued for an upcoming round. Until it runs, we say "confounded" rather than pretending to know.

There's a longer tail — thermal state, background load, memory pressure (our primary runner records per-test memory telemetry so it can be ruled in or out after the fact) — but the six above explain most real-world score movement we've seen.

The meta-point, and the right note to end the series on: a benchmark isn't trustworthy because its numbers never move. It's trustworthy when whoever runs it can tell you *why* they moved. That's the standard this site is trying to hold — and now you have the full toolkit to hold us to it. Start with [the leaderboard](/), and read the [rounds](/rounds/) with new eyes.
