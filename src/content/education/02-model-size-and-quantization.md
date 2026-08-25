---
title: "Model Size and Quantization: Why Smaller Isn't Always Worse"
slug: "model-size-and-quantization"
cluster: "concepts"
order: 2
summary: "What parameters and bit-depths actually mean, how to read Q4_K_M vs Q6_K vs 8bit, and the round where a mid-size quant beat the biggest one outright."
updated: 2026-08-25
---

Two numbers define every model file you'll download: how many **parameters** it has, and how many **bits** each parameter is stored in. Multiply them and you have, roughly, the file size — and the RAM bill.

Parameters are the learned weights — the "B" in a model's name is billions of them. A 27B model has 27 billion. As originally trained, each weight is typically stored in 16-bit floating point (**BF16** or FP16, "full precision"), so a 27B model is about 54 GB before anyone touches it.

**Quantization** is the compression step: re-encoding those weights in fewer bits each, trading a little fidelity for a much smaller file and faster inference. It's how a 27B model becomes something a laptop runs. The naming schemes:

- **GGUF quants** (the llama.cpp world) use labels like **Q4_K_M**, **Q6_K**, **Q8_0** — read the digit as the approximate bits per weight. On our board, the same 27B model ships at 17.7 GB (Q4_K_M), 23.4 GB (Q6_K), and 30.0 GB (Q8_0).
- **MLX quants** (Apple's framework) use plain **4bit**, **6bit**, **8bit**.
- **4-bit float formats** are the newer generation: **MXFP4** (an open, vendor-neutral microscaling standard — 32-element blocks of FP4 values sharing a scale) and **NVFP4** (NVIDIA's variant with finer 16-element blocks and FP8 scales). These hold noticeably more accuracy at the same bit-depth than older integer schemes — Ollama's own measurement is that NVFP4 "roughly halves the quality loss" of 4-bit quantization versus unquantized BF16, while running about 20% faster than Q4_K_M on their engine ([their writeup](https://ollama.com/blog/mlx-performance); a format comparison [here](https://www.spheron.network/blog/nvfp4-vs-mxfp4-gpu-cloud-4bit-quantization-guide/)). The open GPT-OSS models on our board ship natively in MXFP4.

The intuition most people carry is a dimmer switch: more bits, more quality, smoothly. Reasonable — and measurably wrong.

## The ladder where the middle rung won

We ran the same 27B model at three GGUF quant levels through our full 21-test gauntlet at temperature 0, on identical hardware ([full writeup](/rounds/quant-ladder)). The result:

| Quant | Size | Total /420 |
|---|---|---|
| Q6_K | 23.4 GB | **417** |
| Q4_K_M | 17.7 GB | 405 |
| Q8_0 | 30.0 GB | 405 |

Q6 beat Q8. Not by noise — the clearest single data point was a code-diagnosis test where Q4_K_M scored 8/20, Q8_0 scored 10/20, and Q6_K scored a clean 20/20. At temperature 0, that isn't sampling luck. The same weights, rounded three different ways, took three different reasoning paths — and the middle rounding happened to land the best one. Q6_K also *thought less*: about 22,000 reasoning tokens across the suite versus roughly 32,000 for each sibling, for a higher score.

The honest framing: quantization isn't a dimmer on a fixed mind. It's a slightly different mind at every rung. Usually the differences are small; occasionally they're not, and they don't have to point the direction you'd expect. (Standard caveats apply — that was one run per rung, on one model, one suite, one backend; we treat it as a documented existence proof, not a law.)

## What this means when you're choosing a file

**Smaller ≠ worse, in two distinct ways.** First, within one model, a lower quant can genuinely match or beat a higher one — Q8_0's extra 12 GB over Q4_K_M bought zero points in that ladder. Second, across models, a well-quantized larger model at 4-bit routinely outperforms a smaller model at 8-bit while using comparable memory: a 35B mixture-of-experts at 4bit (20.4 GB) sits near the top of our leaderboard, above several 24–27B models running at 8-bit in files 8–9 GB larger.

Practical defaults, from our data and consistent with community experience: Q4-class quants are genuinely usable (94.6% on our hardest general suite, in that ladder); Q6-class is the repeatedly-earned sweet spot; Q8 is rarely worth its memory on a constrained machine. And if a result surprises you — in either direction — rerun it before you believe it.

**Next:** the same model at the same bit-depth still comes in multiple packages — GGUF, MLX, safetensors. [Why, and why it matters](/education/file-formats-gguf-mlx-safetensors/).
