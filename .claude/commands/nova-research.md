---
description: Research a technical, business, or market question for Nova with cited sources
argument-hint: <the question to research>
---

Research the following question: $ARGUMENTS

Use `researcher` for general and technical questions. Load the `research` skill for methodology. Use `technical-product-engineer` to translate findings into Nova product implications, and `software-architect` if the answer feeds an architecture decision.

Nova context: a Sierra Leone-focused e-commerce platform - mobile-first, secure payments, variable connectivity. Check local relevance (regulation, payment providers, infrastructure) rather than assuming Western defaults.

Requirements:

- Inspect the repo first if the question concerns existing code or dependencies (manifests, current usage).
- Use credible, ideally primary sources; cross-check non-trivial claims.
- Separate established fact from estimate or opinion. Never fabricate a citation, statistic or source.
- Before recommending a new dependency, apply the CLAUDE.md dependency rules: existing capability, compatibility, maintenance and security, and why it is necessary.

Summarize findings with sources, state remaining uncertainty, and give a recommendation.
