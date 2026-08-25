---
title: "The Eight Axes, Explained Like You're New Here"
slug: "the-eight-axes-explained"
cluster: "methodology"
order: 7
summary: "G-A-U-N-T-L-E-T: eight letters, eight different questions about a model. A beginner's tour of what each axis measures, why one is counted rather than judged, and how to read a radar chart honestly."
updated: 2026-08-25
---

A single leaderboard number tells you almost nothing useful about a local model, because "good" isn't one thing — a model can write beautiful prose and fail every tool call, or ace algorithms and hallucinate its way through a scanned invoice. So this site scores eight things, one per letter of GAUNTLET, and shows them as a radar per model. This is the plain-language tour; the [methodology page](/gauntlet) has the formal rules and suite inventories.

Every judged axis works the same way: fixed test suites, each test scored 0–20 by an LLM judge against a fixed rubric, at temperature 0. An axis score is points earned divided by points possible, on a 0–100 scale — and unrun tests count as zero, so a model can't inflate an axis by running only its best events.

**G — Generalist.** The baseline: 13 tasks drawn from what a daily-driver model actually gets handed — dev/ops scripting, document processing, professional writing. If a model can't hold up here, the rest is academic. Current board spread: 27.5 to 99.0.

**A — Agentic.** Can the model behave inside an agent harness? Tool-call formatting, protocol adherence, staying coherent when state gets messy. This axis is pass-or-fail-flavored in practice: a model that free-styles its tool-call JSON is useless to an agent no matter how smart its prose. Two models currently hold perfect 100s here.

**U — Understanding.** Vision-grounded document work: transcription, field and checkbox extraction, table reasoning — including a deliberately nasty tier of degraded scans and handwriting, because demo-grade OCR and usable OCR are different products.

**N — Needle.** Long-context retrieval under adversarial conditions: needles in haystacks, distractors, log reasoning, faithful summarization. A marketing context window and a *usable* context window are routinely different numbers; this axis measures the second one.

**T — Thinking.** The odd one out: not judged, *counted*. It's a census of reasoning-failure behavior — chiefly the **stall**, where a model burns its reasoning budget and returns no answer ([the full story](/education/reasoning-models-and-thinking/)). We scan every archived run (1,000+ per-test results) and score 100 × (1 − failures/tests observed), with a 15-test minimum before a model gets a number at all. A model that thinks for sixteen thousand tokens and says nothing is a dead turn to any agent — this axis is where that shows up.

**L — Live.** One-shot front-end builds that must actually *run*. Output isn't just read by a judge — it's opened in a real browser and verified at runtime, because we measured the gap between code that reads well and code that works, and it was worth several points per artifact ([the round that created this axis](/rounds/browser-verification)). Live scores run conspicuously lower than static axes; that's the point.

**E — Engineering.** Coding depth beyond scripting: concurrency, algorithms, security review, performance work, refactoring under constraint, test writing. Whether a model can engineer, not just autocomplete.

**T — Throughput.** The second T, and the other unjudged axis: measured mean generation speed in tokens per second across every suite a model runs on our fixed host, normalized against the fastest model tested. Speed is evidence, not garnish — a 40x spread exists on our board.

## Reading a radar honestly

Three habits keep you out of trouble. First, **check which axes are filled in** — a model that's only run the Generalist suite has one real number and seven blanks, and blanks are not zeros or hundreds; they're absence of evidence. Second, **read shape before size**: the interesting stories are the lopsided ones, like the fast MoE that scores 95.5 Generalist and 27.7 Throughput-normalized speed but only 88 on Thinking (a 12% stall rate) — brilliant and flaky is a real profile, and so is modest and bulletproof. Third, **match axes to your workload**: an agent-harness user should weight A, T (Thinking), and Throughput; a document shop cares about U and N; a coding assistant lives on E and L. The board deliberately refuses to collapse these into one rank, because your use case is the missing weighting function.

**Next:** what one of those 0–20 tests actually looks like from the inside — prompts, rubrics, judges, and why most of it stays private: [inside a test suite](/education/inside-a-test-suite/).
