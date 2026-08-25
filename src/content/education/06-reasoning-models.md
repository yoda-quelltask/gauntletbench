---
title: "Reasoning Models: Chain-of-Thought, Effort Knobs, and the Stall"
slug: "reasoning-models-and-thinking"
cluster: "concepts"
order: 6
summary: "Thinking models write a private scratchpad before answering — usually helpful, sometimes catastrophic. What reasoning_effort actually does, and the failure mode where a model burns 16,000 tokens and says nothing."
updated: 2026-08-25
---

Some models answer immediately. Others first produce a stream of private deliberation — working through the problem, second-guessing, backtracking — and only then commit to an answer. That deliberation is **chain-of-thought (CoT)** reasoning, and models built around it now dominate the top of most benchmarks, ours included.

Mechanically, a reasoning model's output has two channels: the reasoning stream (the scratchpad — in API terms, `reasoning_content`) and the final answer (`content`). The scratchpad genuinely helps on hard problems; it's also pure cost on easy ones — every reasoning token takes as long to generate as an answer token, and you're waiting either way.

One field note before anything else: **whether a model reasons is a property of its chat template, not its marketing.** We classify models by inspecting the actual template that formats their prompts, because names lie in both directions — models advertised as reasoners that never emit a scratchpad, and models with no "thinking" branding that quietly do.

## The effort knob

Some reasoning models expose a **reasoning_effort** control (levels like low / medium / xhigh) governing how hard the model is pushed to deliberate. It's worth understanding how mundane the mechanism is: on the model we've studied most closely, `xhigh` simply injects a "think carefully" line into the system prompt, `medium` injects nothing, and `low` injects a brevity line. A sentence of prompt text, dressed up as a parameter.

A sentence can be expensive. We benchmarked that model's shipped default (`xhigh`) against `medium`, head-to-head across our full 13-test general suite with a generous 49K-token budget ([full writeup](/rounds/xhigh-minus-39)). The default scored **218/260 against medium's 257/260** — it spent 5.2x the reasoning tokens and 3.5x the wall time to lose 39 points. On one trivial scripting task, xhigh deliberated for 31,137 tokens over 34 minutes and was docked for rambling; medium did the same task in about 3,000 tokens and three minutes, perfectly. Vendors tune defaults for something, and that something is not necessarily your results. If your model has an effort knob, benchmark it — don't trust it.

## The stall

The failure mode that motivated an entire scoring axis: sometimes a reasoning model burns its whole token budget in the scratchpad and **never emits an answer at all**. We call this a **stall** — reasoning channel full, answer channel empty, score zero. In its purest observed form: 16,383 reasoning tokens (the entire cap), zero answer tokens, on a task the same model normally aces.

Stalls aren't random. Across our archived runs, three triggers account for most of them:

- **Ambiguity with no convergence point.** Prompts requiring the model to commit under genuine uncertainty — an open-ended judgment call, or a question whose honest answer is "unknowable from what you've given me" — are the most reliable stall-magnets in our suites. A model trained to reason until it's *sure* has nothing to converge on, and some runs circle until the budget dies. The pattern is documented well beyond our lab ([a practitioner's guide to it](https://www.sitepoint.com/deepseek-r1-troubleshooting-guide-common-issues-and-solutions-2026/)), and the empty-answer signature shows up cross-vendor ([a runtime bug report of the same shape](https://github.com/lmstudio-ai/lmstudio-bug-tracker/issues/1602)).
- **Effort settings.** The xhigh default above induced stalls on *trivial* tasks — the injected think-harder line alone pushed the model past its cap.
- **Prompt-invited deliberation.** A community coding prompt containing "think it through... simulate everything before you write a line of code" stalled a model *at medium* for 24,575 tokens and 22.7 minutes; rerun at low effort, it answered well in a fraction of that ([that round](/rounds/browser-verification)).

For agentic use this is the difference between a slow model and a broken one — a stalled turn returns nothing to the calling harness. It's why our leaderboard's Thinking axis is a **stall census**: across every archived run (1,000+ per-test results), we count stalls per tests observed. Current spread: our leader stalled 3 times in 86 observed tests (3.5%); another top-five model, 10 in 83 (12%). Same leaderboard neighborhood, very different reliability under load. The [methodology page](/gauntlet#axis-t) has the formal scoring.

The practical rules: cap reasoning budgets where your stack allows; benchmark effort levels; and be careful what your prompts invite — "think deeply" is an instruction some models will follow right off a cliff.

**Next:** this concludes the concepts cluster. The methodology cluster starts with [the eight axes explained](/education/the-eight-axes-explained/).
