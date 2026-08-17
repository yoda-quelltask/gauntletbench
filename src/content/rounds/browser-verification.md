---
title: "79/80 on Paper, Cloth Won't Pull in the Browser: Why We Now Run Every Front-End Artifact"
slug: "browser-verification"
date: 2026-08-15
summary: "A new browser-artifact suite produced a near-perfect 79/80 static score — then a human loaded the artifacts. The cloth sim doesn't respond to the mouse, the car is drawn backwards, and all four models in the field failed the same interaction the same way."
suite: "1H"
models: [qwen3.8-27b-q6-k-gguf, qwen3.6-27b-dense-8bit-mlx, qwen3.6-35b-a3b-4bit-mlx, gemma-4-26b-a4b-8bit-mlx]
---

Most local-LLM coding scores — ours included, until this round — are static: a judge reads the code and grades it. This is the round where we quantified how much that overstates, and changed the benchmark because of it.

## The suite

1H is four front-end tests, 20 points each: a canvas arcade game, a verlet cloth simulation (an r/LocalLLaMA favorite), a community parallax-car prompt run *verbatim* — grammar quirks and all, for public comparability — and a static-site pricing component. First field: Qwen3.8-27B Q6_K plus three anchors.

| Model | 1H /80 | tok/s |
|---|---|---|
| Qwen3.8-27B Q6_K GGUF | **79** | 17–24 |
| Qwen3.6-27B Dense 8bit MLX | 77 | 13–14 |
| Qwen3.6-35B-A3B 4bit MLX | 75 | 101–121 |
| Gemma-4 26B-A4B 8bit MLX | 67 | 73–79 |

Q6_K's 79/80 included three perfect 20s on static review. The 35B MoE is worth a note: 4 points back at six times the speed.

## Then a human opened the files

Loading Q6_K's near-perfect artifacts in an actual browser:

- **The game plays great.** Static score and reality agree.
- **The cloth sim's interaction fails.** The cloth renders and hangs beautifully — but it won't pull with the mouse, and tearing behaves oddly. Likely a mouse-coordinate/device-pixel-ratio mapping bug, which is precisely the pitfall the community gist's own reasoning warns about.
- **The car is drawn backwards.** The parallax scene scrolls correctly, but the car body faces left while motion and headlights point right.

The anchors got the same treatment. The pattern held and got worse: the cloth interaction failed **0-for-4 across the entire field** (worst case: the cloth disappears on click), and two of the four models drew the car backwards. The browser also reshuffled the podium — the game's in-browser winner was the 35B MoE, not the static leader, and the car's overall pick was Gemma-4 despite its mirrored body and missing headlights, because the rest of its scene held together best.

Static review grades what code *says*; the browser grades what it *does*. The gap between them was worth several points per artifact, and it was invisible from the transcripts. Browser verification is now a required scoring stage for this suite — static scores alone overstate, and we'll publish both.

## A judge bug we're disclosing while we're at it

Same round, same spirit of "verify the instrument": on complex code answers our judge model sometimes prefixes prose analysis before its JSON verdict. The old parser fed that prose to the JSON loader and returned zeros — on complete, correct answers. It falsely scored the 35B MoE at 39/80 before we caught it. Deterministic at temperature 0, so it would have replicated forever: a silent, leaderboard-corrupting failure class. The parser now extracts the last fenced block, and every run in this article was judged under the fix.

## The stall, one more time

A fifth test used the community's *loose* cloth prompt verbatim — "think it through... simulate everything before you write a line of code" — a design-judgment axis instead of a spec axis. Field: Qwen3.6-27B Dense 18/20, Qwen3.8 Q6_K 17, Gemma-4 15, the 35B MoE 14. But the Q6_K score has an asterisk: at its production medium reasoning effort it **stalled outright** — 24,575 reasoning tokens, 22.7 minutes, zero-token answer, an endless self-review loop. The prompt's own think-deeply instruction overrode the neutral effort setting ([background on that failure class](/rounds/xhigh-minus-39)). Rerun at low effort: 17/20 in 5.5 minutes on 2,802 reasoning tokens. If your prompts invite deep deliberation, that's a stall hazard on this model at any effort level.

## What to take from this round

If a benchmark shows you a front-end coding score and nobody ever ran the artifact, treat it as an upper bound. Interaction handlers — mouse mapping, DPR, event wiring — are where every model in this field quietly failed, and where static judging can't see.

## Method note

Static scores are LLM-judged on a 0–20 scale per test against fixed private rubrics, at temperature 0 on an M5 Max MacBook Pro with 128 GB unified memory running LM Studio. Browser verification is a human pass over the rendered artifacts, logged per test. The car and cloth prompts are public community prompts, run verbatim; our other prompts, rubrics, and gold answers stay private to prevent contamination.
