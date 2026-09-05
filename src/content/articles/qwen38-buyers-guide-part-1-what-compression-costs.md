---
title: "The Qwen3.8-27B Buyer's Guide, Part 1: What Compression Actually Costs"
slug: "qwen38-buyers-guide-part-1-what-compression-costs"
date: 2026-09-04
summary: "Everyone recommends Qwen3.8-27B as a first local model, and nobody says which one. Fourteen packagings of the identical weights have been through this bench, spanning 15 GB to 30 GB on disk. Part 1 answers the quality question — does squeezing it smaller make it worse? — and is deliberately silent on speed, because our speed numbers are not yet comparable to each other. Part 2 fixes that."
draft: false
tags: [qwen, quantization, buyers-guide, local-llm, series]
---

**TLDR:** Compressing this model harder did not make it worse. From 8-bit down
to 4-bit, across every test we could score, the quality spread was 0.33 points
on a 20-point scale — noise. The 30 GB build scored *below* the 15 GB one. If
you are choosing a Qwen3.8-27B today, pick on the size that fits your RAM, not
on the quant.

**ELI5:** A big AI model gets squeezed to fit on your computer, and there are
several squeeze settings. Everyone assumes squeezing harder makes it dumber. We
tested that on fourteen versions of the same model and it mostly isn't true —
the small squeezed one answered our questions about as well as the big one. This
part covers *how smart* each version is. How *fast* each one is turns out to be
a harder question to answer honestly, so it gets its own article.

---

## Why this model gets a series

Qwen3.8-27B is the model most often handed to someone setting up their first
local LLM, and the recommendation almost never says *which* Qwen3.8-27B. There
are at least fourteen distinct packagings of these same weights. On this bench
they have ranged from 15 GB to 30 GB on disk — a 2x spread in what you download
and in how much memory you give up — for a model that, as you will see, answers
about the same either way.

Every number here came off one machine: a MacBook Pro M5 Max with 128 GB of
unified memory, running the same prompts through the same judge.

A note on what "the same model" means. All of these share one set of trained
weights. What differs is *packaging*: the file format (GGUF or MLX), how
aggressively the numbers inside were rounded off to save space (the quant), and
who did the rounding. Nobody retrained anything. That is what makes this a fair
test of compression specifically.

---

## The builds

| Build | Format / quant | On disk | 1A score | Coverage | 1B score |
|---|---|---|---|---|---|
| **Q6_K GGUF** | GGUF Q6_K | 23.4 GB | **19.8** | 13/13 | 19.2 |
| **MLX 4-bit** | MLX 4bit | **15.0 GB** | 19.5 | 11/13 | **20.0** |
| MLX 5-bit | MLX 5bit | 19.0 GB | 19.4 | 10/13 | 20.0 |
| Q4_K_M GGUF | GGUF Q4_K_M | 17.7 GB | 19.1 | 13/13 | 20.0 |
| UD-Q6_K_XL (Unsloth, on Ollama) | GGUF Q6_K_XL | 25.3 GB | 19.1 | 13/13 | 20.0 |
| Q8_0 GGUF | GGUF Q8_0 | 30.0 GB | 18.8 | 13/13 | 19.1 |
| nvfp4 MLX (on Ollama) | MLX nvfp4 | 16.5 GB | 17.4 | 13/13 | 20.0 |
| MLX 6-bit | MLX 6bit | 21.0 GB | *withheld* | 9/13 | 20.0 |
| MLX 8-bit | MLX 8bit | 28.0 GB | *withheld* | 9/13 | 20.0 |
| Uncensored Q5_K_P | GGUF Q5_K_P | 18.8 GB | *withheld* | 3/13 | — |
| Uncensored Q6_K_P | GGUF Q6_K_P | 24.1 GB | *no score* | 0/13 | — |

Scores are out of 20, judged against a fixed rubric. **Coverage** is how many of
suite 1A's 13 tests actually produced an answer to judge. A build under 75%
coverage gets no published score, because an average over a handful of tests is
not a score, it is an anecdote. Three builds are in that state and are shown
here as *withheld* rather than quietly dropped.

---

## Finding 1: the quant ladder is flat

This is the headline, and it was not the expected result.

Five builds were raced head-to-head on one night, on one engine, over an
identical subset of tests — the only way to compare them without confounds. The
scores:

| MLX 8-bit | MLX 6-bit | MLX 5-bit | MLX 4-bit | Q6_K GGUF |
|---|---|---|---|---|
| 19.50 | 19.67 | 19.33 | **19.67** | 19.67 |

A 0.33-point spread on a 20-point scale. That is one judge point on one
question. There is no ladder here — halving the file from 8-bit to 4-bit cost
nothing we could measure, and the 4-bit build tied the reference exactly.

The going assumption in local-LLM communities is that quantization is a dial
trading quality for size, and that you should stay as high as you can afford. On
this model, in this size class, on these tests, that dial does nothing until at
least 4-bit. **Stop agonising over the quant.** Pick what fits comfortably in
RAM and spend the attention elsewhere.

## Finding 2: the biggest file is not the best model

The Q8_0 GGUF is the largest build here at 30 GB, and it scored **18.8** — below
the 23 GB Q6_K (19.8), below the 17.7 GB Q4_K_M (19.1), and below the 15 GB MLX
4-bit (19.5). All four have full or near-full coverage, so this is not a
measurement artifact.

"Download the biggest one you can fit" is common advice. Here it costs you 15 GB
and buys you nothing.

## Finding 3: which program runs the model matters more than the quant

This is the finding that generalises past Qwen, and it is the reason Part 2
exists.

Take the Unsloth UD-Q6_K_XL build. The *identical file* — byte-for-byte, same
checksum — was served by two different programs. Under LM Studio it completed
**zero of thirteen** tests; every attempt died mid-stream. Under Ollama it
completed **all thirteen** cleanly and scored 19.1.

Same weights, same laptop, same prompts. The only variable was the software
doing the serving. If a local model seems broken to you, the runtime is a more
likely culprit than the file — and it is far easier to swap.

That result reframes the whole exercise. If the serving program can take a model
from *unusable* to *19.1*, then it is not a neutral pipe, and any number that
depends on it — above all throughput — has to be measured with the program held
fixed. Which brings us to what this article deliberately does not tell you.

---

## What Part 1 will not tell you: speed

You may have noticed there is no tokens-per-second column above. That is
deliberate, and it is worth explaining rather than hiding.

We have speed numbers for every build on that table. They are not comparable to
each other. The GGUF builds were last timed in mid-August; the MLX builds were
timed in early September, after the underlying inference engines had been
updated. Engine builds change throughput on their own — that is most of what
they are *for* — so a table ranking August GGUF numbers against September MLX
numbers would be measuring the calendar as much as the model.

We know precisely how bad this is, because the one thing we did measure cleanly
shows the size of the effect: in the five-build race above, run on a single
night on a single engine, throughput ranged from 9.1 to 22.9 tokens per second —
a **2.5x spread** across builds of the same model. An effect that large cannot
be reported from mixed-era measurements and called a finding.

Worse, the August runs are unattributable in a specific way: their run manifests
record **no engine version at all**, because they predate the instrumentation
that captures it. It is not that we know they ran on an old engine and want a
newer one. It is that those numbers cannot be assigned to any engine, so they
can never be honestly ranked against numbers that can.

This bench has a standing rule against publishing comparisons that span
measurement eras without a crosswalk run to join them. Part 1 obeys it by saying
nothing about speed.

## What Part 2 will do

Part 2 is the crosswalk, and it is already queued.

**The run.** Five builds — the surviving GGUF rung (Q6_K) and all four MLX rungs
(4, 5, 6 and 8-bit) — re-run on suite 1A in one pass, on one engine, on one
night. Same prompts, same judge, same machine, nothing else moving. That
produces five throughput figures that can legitimately sit in one column, plus
first-token latency, which behaves differently from throughput and matters more
than people expect for chat-style use.

**Two gaps it closes on the way.** The MLX 6-bit and 8-bit builds are the two
*withheld* rows above, sitting at 9 of 13 tests; a full re-run restores them to
the quality table as well. And the MLX 4-bit build — the one Part 1 recommends
on quality — is scored on 11 of 13, where the two missing tests are a Python
debugging task and a multi-step arithmetic task. Those are precisely the two
most likely to expose damage from aggressive rounding, and they failed for
serving-layer reasons rather than model ones. So "4-bit costs nothing" is
currently established on the easy and medium questions and **untested on the
hardest two**. Part 2 answers that too.

**One gap it cannot close.** The Q4_K_M and Q8_0 GGUF builds cannot be re-timed,
because their weights are no longer on this machine — only Q6_K survives in that
directory. Their quality scores in the table above stand, since those were
full-coverage runs and quality is far less engine-sensitive than speed. But they
will carry no comparable speed figure unless they are downloaded again, and that
is a deliberate decision rather than something to do by reflex.

So: Part 1 is the quality answer, and it is a real one. Part 2 is the speed
answer, and it will be worth having precisely because we refused to fake it
here.

---

*All figures from the GAUNTLET bench: MacBook Pro M5 Max, 128 GB. Suite 1A is a
13-test general-capability set; 1B is an 8-test agentic set. Judge scores are
Claude at temperature 0 against a fixed rubric (v2). Transient stream failures
are recorded as did-not-finish and excluded from averages rather than counted as
zeros — a distinction that changed several previously published numbers. See the
methodology pages for why.*
