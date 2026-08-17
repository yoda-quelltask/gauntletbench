# GAUNTLET Bench

**Local models, run through the gauntlet.** Real-workload, runtime-verified
benchmarks on Apple Silicon — live at **[gauntletbench.com](https://gauntletbench.com)**.

> Proving local agents before they act.

## What this is

GAUNTLET Bench runs local models through real workloads — agentic, live,
verified — and publishes the evidence. Every model is scored on eight axes
that spell the name:

| | Axis | What it measures |
|---|---|---|
| **G** | Generalist | 13-task real-workload capability suite |
| **A** | Agentic | Tool-calling & protocol adherence |
| **U** | Understanding | Doc/OCR vision, including a real-degraded tier |
| **N** | Needle | Long-context retrieval, incl. multi-needle MRCR |
| **T** | Thinking | Reasoning-budget behavior: the stall census |
| **L** | Live | Runtime-verified builds + production replay (with a truthfulness check) |
| **E** | Engineering | Coding depth |
| **T** | Throughput | Measured tok/s, not judged |

Two things set it apart:

- **Runtime verification.** Static LLM-judge scores overstate reality — we
  quantified it. A near-perfect 79/80 build produced a cloth sim that won't
  respond to the mouse. Live-axis artifacts are loaded in a real browser and
  [published playable](https://gauntletbench.com/arena), next to their scores.
- **The T-check.** The production-replay suite scores whether a model *lies
  about the work it did* — claimed counts vs. actual output, checked
  arithmetically. [One model claimed 63 escalations and delivered 2.](https://gauntletbench.com/rounds/production-replay)

## How it's built

Every page derives from the data pipeline or it doesn't exist. A private
test harness (registry, versioned suites, immutable runs, temperature-0
LLM judging against fixed rubrics) exports an allowlisted, leak-scanned
`gauntlet-data.json`; this Astro site renders it statically. One operator,
one controlled host (Apple M5 Max, 128 GB unified memory, LM Studio), so
numbers are comparable.

**Contamination policy, stated up front:** live test prompts, gold answers,
and judge rubrics stay private so models can't train on them. Retired suite
versions become public worked examples when superseded. Details:
[gauntletbench.com/gauntlet](https://gauntletbench.com/gauntlet).

## Contributing

Right now (Phase 1): open an issue with a **test idea** or a **model
request** — templates provided. Community-proposed test designs (we run
them, you get credit) are next; community-submitted *results* may come
later and would be badged separately, never mixed into the verified
leaderboard. See [gauntletbench.com/contribute](https://gauntletbench.com/contribute).

## Running locally

```bash
npm install
npm run dev      # local dev server
npm run build    # static build to dist/
```

## License

Code is MIT (see LICENSE). Benchmark scores and round write-ups are
© GAUNTLET Bench, shared for reading and citation with attribution —
please link the site.
