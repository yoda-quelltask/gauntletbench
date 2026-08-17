---
title: "The Knob That Wasn't Attached: Sideloaded MLX Models Silently Lose Their Effort Controls"
slug: "sideloaded-mlx-drop"
date: 2026-08-15
summary: "Two MLX builds of the same model kept stalling at settings that worked fine on their GGUF siblings. The reason: LM Studio accepts the reasoning-effort parameter for sideloaded MLX models at the API — then silently discards it."
suite: "1A/1B"
models: [qwen3.8-27b-q6-k-gguf, qwen3.8-27b-q4-k-m-gguf, qwen3.8-27b-q8-0-gguf]
---

This one is a lab-controls story more than a leaderboard story. It's about the gap between a setting being *accepted* and a setting being *applied* — and how easily that gap can corrupt a benchmark without throwing a single error.

## The setup

Our Qwen3.8-27B quant ladder ([full round here](/rounds/quant-ladder)) had five rungs: three GGUF quants pulled through the LM Studio catalog, plus two MLX conversions sideloaded from Hugging Face — a community 8-bit build and a 4-bit repack (multi-token-prediction head inert under this runtime, vision stripped). All five were configured identically, including the setting that matters most on this model: reasoning effort at medium, since the shipped xhigh default is actively harmful ([that story](/rounds/xhigh-minus-39)).

The GGUF trio ran clean. Both MLX builds stalled on a trivial scripting task *at medium* — 16,227 and 10,476 reasoning tokens respectively, zero-token answers. The exact signature medium is supposed to prevent.

## Pinning it down

The stalls smelled like the effort setting wasn't landing, so we tested that hypothesis directly rather than assuming it. On LM Studio 0.4.16, for MLX models sideloaded from Hugging Face (i.e., anything without a catalog manifest):

- **`reasoning_effort` is validated at the API, then silently discarded.** Send an invalid value and you get an error — the parameter is real to the request parser. But at temperature 0, responses came back *byte-identical* at medium and xhigh. The knob turns; nothing is attached to it.
- **`chat_template_kwargs` is ignored** the same way.
- **The repo's own chat template isn't rendered.** The template file that defines what the effort levels inject never runs. Asked to echo back its system prompt at xhigh, the model reported none — the injected effort line simply doesn't exist in what the model sees.
- **Plain system messages do get through** — verified with a respond-in-French probe — but an explicit brevity instruction delivered that way was blown through anyway on the stall-prone tasks. A system-prompt workaround is not a substitute for the template's control line.

The GGUF builds are controllable for one reason only: catalog models carry per-model custom-field wiring that maps the API parameter into the template. Sideloaded MLX models don't get that wiring, and nothing in the API surface tells you so.

## Why this is the dangerous kind of bug

If we had scored those two MLX rungs as-is, the public conclusion would have been "MLX conversions of this model are dramatically worse than GGUF" — a clean, plausible, completely wrong finding. The models were probably fine; the experiment wasn't. Every request confirmed the setting was "set," every response was deterministic and reproducible, and the whole thing would have replicated perfectly. Silent control-loss produces *stable* wrong answers, which is exactly what makes it worse than a crash.

Both MLX artifacts are shelved as blocked rather than scored, and we'll rerun them if official catalog MLX variants of the model appear with proper wiring.

## The takeaway for your own setup

If you sideload MLX models into LM Studio and you rely on any template-level control — reasoning effort, thinking toggles, template kwargs — verify the control end-to-end before trusting it. The cheap test is the one that caught this: run the same prompt at temperature 0 with the setting at two different values. If the outputs are byte-identical, your knob isn't attached. An API that accepts a parameter is making you a promise about parsing, not about behavior.

For benchmarking specifically: settings verification is now a required pre-run stage here, and "the parameter was accepted" no longer counts as evidence of anything.

## Method note

All suite scores referenced are LLM-judged on a 0–20 scale per test against fixed private rubrics, at temperature 0 on an M5 Max MacBook Pro with 128 GB unified memory running LM Studio 0.4.16. The two sideloaded MLX builds were shelved unscored once control-loss was confirmed. Rubrics and gold answers are kept private to prevent benchmark contamination.
