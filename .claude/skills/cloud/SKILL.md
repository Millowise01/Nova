---
name: cloud
description: Cloud infrastructure practices - IaC, resource sizing, cost awareness, cloud security basics. Load for AWS/Azure/GCP provisioning or architecture work.
---

# Cloud

## When to use this skill

- Provisioning or changing cloud infrastructure, or making cloud architecture decisions.

## Checklist / best practices

- Use infrastructure-as-code rather than manual console changes wherever the project already does.
- Apply least-privilege IAM policies, avoiding wildcard permissions.
- Right-size resources for actual load rather than over-provisioning by default.
- Encrypt sensitive data at rest and in transit.
- Tag resources consistently with the project's existing convention (for cost/ownership tracking).
- Restrict network exposure (security groups/firewalls) to what's actually required.
- Plan for the resource's failure mode (multi-AZ, backups) proportional to its criticality.

## Common pitfalls

- Publicly exposed storage/databases by default.
- Unbounded auto-scaling without cost guardrails.
- Manual console changes that drift from the IaC definition.
- Over-provisioning 'just in case' without a cost/benefit check.

## Standards & references

- Cloud provider's own security/well-architected baseline as a starting checklist.
