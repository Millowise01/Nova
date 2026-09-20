---
name: ai-ml
description: Practices for building AI and ML features - evaluation, data handling, prompt/RAG design, model deployment. Load for AI-powered feature or ML model work.
---

# AI/ML

## When to use this skill

- Building an AI-powered feature, training/deploying an ML model, or designing an LLM/RAG/agent system.

## Checklist / best practices

- Define a concrete evaluation metric and test set before building.
- Handle model failures, timeouts, and low-confidence outputs explicitly in application logic.
- Guard against data leakage between train/validation/test sets.
- Version data, prompts, and model config alongside code for reproducibility.
- Evaluate on data representative of real production inputs, not just clean examples.
- Consider cost/latency trade-offs explicitly, not just accuracy.
- Add monitoring for model/agent output quality in production, not just uptime.

## Common pitfalls

- Shipping based on a handful of manually-checked examples instead of a real eval set.
- Free-form prompting where structured tool-use/function-calling would be far more reliable.
- No fallback behavior when the model fails or times out.
- Ignoring the context-window/cost impact of retrieved context in RAG systems.

## Standards & references

- Every AI feature should have a repeatable evaluation harness, even a lightweight one.
