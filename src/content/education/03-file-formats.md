---
title: "GGUF, MLX, Safetensors: Why One Model Ships in a Dozen Packages"
slug: "file-formats-gguf-mlx-safetensors"
cluster: "concepts"
order: 3
summary: "The same model gets converted, quantized, and repacked by different hands for different engines — and the packaging can change behavior, not just speed. What each format is and why provenance matters."
updated: 2026-08-25
---

Search for any popular model on Hugging Face and you'll find dozens of repositories claiming to be it: the original, plus GGUF conversions at eight quant levels from three different uploaders, plus MLX builds, plus exotic 4-bit floats. They are all "the same model" in the sense that they descend from the same trained weights — and meaningfully different artifacts in every way that matters for running one. Here's the map.

## The three formats you'll actually meet

**Safetensors** is the publication format. When a lab releases a model, the weights almost always land on Hugging Face as safetensors files — a deliberately simple tensor container designed so that loading a file can never execute arbitrary code (its predecessor, Python pickles, could). Full-precision safetensors are the source material everything else is made from; you rarely run them directly on a laptop, because they're the big, uncompressed version.

**GGUF** is the llama.cpp ecosystem's format — used by LM Studio's GGUF path and most of the tooling the local-model community grew up on. Its defining trait is self-containment: one file holds the quantized weights, the tokenizer, the chat template, and metadata. The quant level is baked into the filename (Q4_K_M, Q6_K, Q8_0 — see the [quantization guide](/education/model-size-and-quantization/)).

**MLX** is Apple's machine-learning framework, built for Apple Silicon's unified memory. An MLX model isn't a single file — it ships as quantized safetensors plus config files. Both LM Studio and Ollama can run models through MLX instead of llama.cpp, which is why a Mac user often faces a genuine GGUF-or-MLX choice for the same model at the same bit-depth.

A useful subtlety: formats travel further than the hardware they were designed for. NVFP4, a 4-bit format built around NVIDIA Blackwell's tensor cores, isn't hardware-locked — on older NVIDIA GPUs engines run it by dequantizing in software ([SGLang discussion](https://github.com/sgl-project/sglang/issues/22459)), while on Apple Silicon Ollama's MLX engine implements it as a real native kernel ([their writeup](https://ollama.com/blog/mlx-performance)). The numbers on disk are portable; only the execution speed changes.

## Who actually made the file you downloaded

This is the part beginners skip and regret. For any given artifact, three different organizations may be involved: the **base org** that trained the weights, a **fine-tuner** that adapted them, and a **quantizer** that did the conversion and compression. That last step is not a mechanical formality — conversion choices, calibration data, and simple care vary between quantizers, and the result is that two files with identical names-and-bits from different uploaders are not interchangeable.

Our leaderboard treats them accordingly: every entry records its format, quant, *and* source, and near-identical artifacts from different packagers get separate rows — because they earn different scores.

## When the package changes the behavior

The sharpest example from our own testing: we ran a quant ladder that included two community MLX conversions of a model whose GGUF builds we knew well. Both MLX builds kept stalling — burning thousands of reasoning tokens and returning empty answers — at settings that worked fine on their GGUF siblings. The cause wasn't the weights. It was the packaging path: for models sideloaded outside the app's catalog, the runtime accepted the reasoning-effort control at the API and then silently discarded it, so the model's own chat template never ran ([the full investigation](/rounds/sideloaded-mlx-drop)).

You can see the fallout on the leaderboard: the Q6_K GGUF build of that model scores 99/100 on our Generalist axis; a community 8-bit MLX build of the same model — nominally *higher* precision — sits at 60.5, dragged down by stalls its GGUF sibling doesn't have. Same weights, different package, different model in practice.

## The takeaway

When you download a model, you're choosing four things at once: the weights, the bit-depth, the container format, and the hands that packed it. The first is what the model card advertises; the other three are on you. Prefer catalog or first-party builds where they exist, note the quantizer's name, and if a build misbehaves in ways the model's reputation doesn't predict — suspect the package before you blame the mind.

**Next:** two models can be the same size on disk and differ 5x in speed. That's architecture: [dense vs. mixture-of-experts](/education/dense-vs-mixture-of-experts/).
