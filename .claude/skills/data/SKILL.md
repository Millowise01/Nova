---
name: data
description: Data engineering and analytics practices - pipeline reliability, data quality, modeling. Load for data pipeline, analytics, or data-modeling work.
---

# Data

## When to use this skill

- Building a data pipeline, analytics data model, or doing data analysis.

## Checklist / best practices

- Design pipelines to be idempotent and safely re-runnable.
- Validate data quality at pipeline boundaries, not only at the very end.
- Handle schema evolution without silently breaking downstream consumers.
- Document each table/model's grain and intended use.
- State assumptions and data-quality caveats alongside any analysis result.
- Add monitoring/alerting for pipeline failures and data anomalies.
- Avoid duplicating business logic across multiple models/pipelines.

## Common pitfalls

- Silent schema drift breaking a downstream dashboard.
- Presenting a correlation as causation without checking confounders.
- A pipeline that isn't safe to re-run after a partial failure.
- Vanity metrics standing in for the metric that actually answers the question.

## Standards & references

- Data quality checks should sit at pipeline boundaries, not just be assumed.
