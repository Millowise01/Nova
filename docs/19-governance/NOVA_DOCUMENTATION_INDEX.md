# Nova --- Documentation Index

This is the central map of Nova documentation.

## Status and authoritative sources

Most documents listed below are stubs. A stub starts with a `STATUS: STUB — NOT SOURCE OF TRUTH` notice, defines no rules, and links to the real specification when one exists. List them with `grep -rl "nova-stub-notice" docs`. A stub is populated, and its notice removed, in the same change that implements or reviews its area. Do not treat a stub as authoritative.

The documents that are authoritative today are:

- [`NOVA_UI_UX_DESIGN_SYSTEM.md`](../02-uiux-brand/NOVA_UI_UX_DESIGN_SYSTEM.md) — canonical UI/UX specification
- [`docs/frontend/`](../frontend/) — frontend conventions (`00`–`07`)
- [`backend/docs/`](../../backend/docs/) — backend design, API standards, database conventions, security baseline, payments and logistics design (`00`–`10`)
- [`NOVA_IMPLEMENTATION_AUDIT_2026-09-20.md`](NOVA_IMPLEMENTATION_AUDIT_2026-09-20.md) — repository audit
- This index

Operating documents are at the repository root (`README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`) and in `.claude/CLAUDE.md`.

## Documentation Hierarchy

1.  Product and business define what Nova is and what it should achieve.
2.  UI/UX and brand define the experience and visual system.
3.  Architecture defines how the system is structured.
4.  Engineering standards define how code is written and maintained.
5.  Domain documents define marketplace and operational behavior.
6.  Security, legal, infrastructure, and quality define production
    constraints.
7.  Governance controls change, decisions, and documentation quality.

## 1. 01 Product Business

- [`NOVA_PRODUCT_VISION.md`](../01-product-business/NOVA_PRODUCT_VISION.md)
- [`NOVA_PRODUCT_REQUIREMENTS.md`](../01-product-business/NOVA_PRODUCT_REQUIREMENTS.md)
- [`NOVA_BUSINESS_MODEL.md`](../01-product-business/NOVA_BUSINESS_MODEL.md)
- [`NOVA_MARKETPLACE_MODEL.md`](../01-product-business/NOVA_MARKETPLACE_MODEL.md)
- [`NOVA_USER_PERSONAS.md`](../01-product-business/NOVA_USER_PERSONAS.md)
- [`NOVA_USER_JOURNEYS.md`](../01-product-business/NOVA_USER_JOURNEYS.md)
- [`NOVA_FEATURE_ROADMAP.md`](../01-product-business/NOVA_FEATURE_ROADMAP.md)
- [`NOVA_MVP_SCOPE.md`](../01-product-business/NOVA_MVP_SCOPE.md)
- [`NOVA_PHASES_AND_MILESTONES.md`](../01-product-business/NOVA_PHASES_AND_MILESTONES.md)
- [`NOVA_SUCCESS_METRICS.md`](../01-product-business/NOVA_SUCCESS_METRICS.md)

## 2. 02 Uiux Brand

- [`NOVA_UI_UX_DESIGN_SYSTEM.md`](../02-uiux-brand/NOVA_UI_UX_DESIGN_SYSTEM.md)
- [`NOVA_BRAND_GUIDELINES.md`](../02-uiux-brand/NOVA_BRAND_GUIDELINES.md)
- [`NOVA_DESIGN_TOKENS.md`](../02-uiux-brand/NOVA_DESIGN_TOKENS.md)
- [`NOVA_COMPONENT_SPECIFICATION.md`](../02-uiux-brand/NOVA_COMPONENT_SPECIFICATION.md)
- [`NOVA_PAGE_SPECIFICATIONS.md`](../02-uiux-brand/NOVA_PAGE_SPECIFICATIONS.md)
- [`NOVA_RESPONSIVE_DESIGN.md`](../02-uiux-brand/NOVA_RESPONSIVE_DESIGN.md)
- [`NOVA_ACCESSIBILITY_GUIDELINES.md`](../02-uiux-brand/NOVA_ACCESSIBILITY_GUIDELINES.md)
- [`NOVA_CONTENT_DESIGN.md`](../02-uiux-brand/NOVA_CONTENT_DESIGN.md)
- [`NOVA_MOTION_GUIDELINES.md`](../02-uiux-brand/NOVA_MOTION_GUIDELINES.md)
- [`NOVA_FIGMA_GUIDELINES.md`](../02-uiux-brand/NOVA_FIGMA_GUIDELINES.md)

## 3. 03 Architecture

- [`NOVA_SYSTEM_ARCHITECTURE.md`](../03-architecture/NOVA_SYSTEM_ARCHITECTURE.md)
- [`NOVA_FRONTEND_ARCHITECTURE.md`](../03-architecture/NOVA_FRONTEND_ARCHITECTURE.md)
- [`NOVA_BACKEND_ARCHITECTURE.md`](../03-architecture/NOVA_BACKEND_ARCHITECTURE.md)
- [`NOVA_MONOREPO_ARCHITECTURE.md`](../03-architecture/NOVA_MONOREPO_ARCHITECTURE.md)
- [`NOVA_DATABASE_ARCHITECTURE.md`](../03-architecture/NOVA_DATABASE_ARCHITECTURE.md)
- [`NOVA_API_ARCHITECTURE.md`](../03-architecture/NOVA_API_ARCHITECTURE.md)
- [`NOVA_AUTHENTICATION_ARCHITECTURE.md`](../03-architecture/NOVA_AUTHENTICATION_ARCHITECTURE.md)
- [`NOVA_AUTHORIZATION_ARCHITECTURE.md`](../03-architecture/NOVA_AUTHORIZATION_ARCHITECTURE.md)
- [`NOVA_FILE_STORAGE_ARCHITECTURE.md`](../03-architecture/NOVA_FILE_STORAGE_ARCHITECTURE.md)
- [`NOVA_SEARCH_ARCHITECTURE.md`](../03-architecture/NOVA_SEARCH_ARCHITECTURE.md)
- [`NOVA_NOTIFICATION_ARCHITECTURE.md`](../03-architecture/NOVA_NOTIFICATION_ARCHITECTURE.md)
- [`NOVA_PAYMENT_ARCHITECTURE.md`](../03-architecture/NOVA_PAYMENT_ARCHITECTURE.md)
- [`NOVA_LOGISTICS_ARCHITECTURE.md`](../03-architecture/NOVA_LOGISTICS_ARCHITECTURE.md)

## 4. 04 Engineering Standards

- [`NOVA_ENGINEERING_STANDARDS.md`](../04-engineering-standards/NOVA_ENGINEERING_STANDARDS.md)
- [`NOVA_CODING_STANDARDS.md`](../04-engineering-standards/NOVA_CODING_STANDARDS.md)
- [`NOVA_TYPESCRIPT_GUIDELINES.md`](../04-engineering-standards/NOVA_TYPESCRIPT_GUIDELINES.md)
- [`NOVA_NEXTJS_GUIDELINES.md`](../04-engineering-standards/NOVA_NEXTJS_GUIDELINES.md)
- [`NOVA_REACT_GUIDELINES.md`](../04-engineering-standards/NOVA_REACT_GUIDELINES.md)
- [`NOVA_API_DEVELOPMENT_GUIDELINES.md`](../04-engineering-standards/NOVA_API_DEVELOPMENT_GUIDELINES.md)
- [`NOVA_DATABASE_GUIDELINES.md`](../04-engineering-standards/NOVA_DATABASE_GUIDELINES.md)
- [`NOVA_ERROR_HANDLING.md`](../04-engineering-standards/NOVA_ERROR_HANDLING.md)
- [`NOVA_LOGGING_STANDARDS.md`](../04-engineering-standards/NOVA_LOGGING_STANDARDS.md)
- [`NOVA_TESTING_STRATEGY.md`](../04-engineering-standards/NOVA_TESTING_STRATEGY.md)
- [`NOVA_CODE_REVIEW_GUIDELINES.md`](../04-engineering-standards/NOVA_CODE_REVIEW_GUIDELINES.md)
- [`NOVA_GIT_WORKFLOW.md`](../04-engineering-standards/NOVA_GIT_WORKFLOW.md)
- [`NOVA_BRANCHING_STRATEGY.md`](../04-engineering-standards/NOVA_BRANCHING_STRATEGY.md)

## 5. 05 Database

- [`NOVA_DATABASE_SCHEMA.md`](../05-database/NOVA_DATABASE_SCHEMA.md)
- [`NOVA_DATA_MODEL.md`](../05-database/NOVA_DATA_MODEL.md)
- [`NOVA_DATABASE_RELATIONSHIPS.md`](../05-database/NOVA_DATABASE_RELATIONSHIPS.md)
- [`NOVA_DATABASE_INDEXING.md`](../05-database/NOVA_DATABASE_INDEXING.md)
- [`NOVA_DATABASE_MIGRATIONS.md`](../05-database/NOVA_DATABASE_MIGRATIONS.md)
- [`NOVA_DATABASE_SEEDING.md`](../05-database/NOVA_DATABASE_SEEDING.md)
- [`NOVA_DATA_RETENTION.md`](../05-database/NOVA_DATA_RETENTION.md)

## 6. 06 Api

- [`NOVA_API_SPECIFICATION.md`](../06-api/NOVA_API_SPECIFICATION.md)
- [`NOVA_API_CONVENTIONS.md`](../06-api/NOVA_API_CONVENTIONS.md)
- [`NOVA_API_VERSIONING.md`](../06-api/NOVA_API_VERSIONING.md)
- [`NOVA_API_AUTHENTICATION.md`](../06-api/NOVA_API_AUTHENTICATION.md)
- [`NOVA_API_ERRORS.md`](../06-api/NOVA_API_ERRORS.md)
- [`NOVA_API_PAGINATION.md`](../06-api/NOVA_API_PAGINATION.md)
- [`NOVA_API_FILTERING.md`](../06-api/NOVA_API_FILTERING.md)
- [`NOVA_API_RATE_LIMITING.md`](../06-api/NOVA_API_RATE_LIMITING.md)
- [`NOVA_API_ENDPOINTS.md`](../06-api/NOVA_API_ENDPOINTS.md)

## 7. 07 Marketplace

- [`NOVA_MARKETPLACE_RULES.md`](../07-marketplace/NOVA_MARKETPLACE_RULES.md)
- [`NOVA_PRODUCT_RULES.md`](../07-marketplace/NOVA_PRODUCT_RULES.md)
- [`NOVA_SELLER_RULES.md`](../07-marketplace/NOVA_SELLER_RULES.md)
- [`NOVA_STORE_RULES.md`](../07-marketplace/NOVA_STORE_RULES.md)
- [`NOVA_INVENTORY_RULES.md`](../07-marketplace/NOVA_INVENTORY_RULES.md)
- [`NOVA_PRICING_RULES.md`](../07-marketplace/NOVA_PRICING_RULES.md)
- [`NOVA_NEGOTIATION_RULES.md`](../07-marketplace/NOVA_NEGOTIATION_RULES.md)
- [`NOVA_ORDER_RULES.md`](../07-marketplace/NOVA_ORDER_RULES.md)
- [`NOVA_RETURN_RULES.md`](../07-marketplace/NOVA_RETURN_RULES.md)
- [`NOVA_REFUND_RULES.md`](../07-marketplace/NOVA_REFUND_RULES.md)
- [`NOVA_REVIEW_RULES.md`](../07-marketplace/NOVA_REVIEW_RULES.md)
- [`NOVA_DISPUTE_RULES.md`](../07-marketplace/NOVA_DISPUTE_RULES.md)
- [`NOVA_COUPON_RULES.md`](../07-marketplace/NOVA_COUPON_RULES.md)
- [`NOVA_CUSTOM_PRODUCT_RULES.md`](../07-marketplace/NOVA_CUSTOM_PRODUCT_RULES.md)

## 8. 08 Seller

- [`NOVA_SELLER_PLATFORM.md`](../08-seller/NOVA_SELLER_PLATFORM.md)
- [`NOVA_SELLER_ONBOARDING.md`](../08-seller/NOVA_SELLER_ONBOARDING.md)
- [`NOVA_SELLER_VERIFICATION.md`](../08-seller/NOVA_SELLER_VERIFICATION.md)
- [`NOVA_SELLER_DASHBOARD.md`](../08-seller/NOVA_SELLER_DASHBOARD.md)
- [`NOVA_SELLER_STORE_MANAGEMENT.md`](../08-seller/NOVA_SELLER_STORE_MANAGEMENT.md)
- [`NOVA_SELLER_PRODUCT_MANAGEMENT.md`](../08-seller/NOVA_SELLER_PRODUCT_MANAGEMENT.md)
- [`NOVA_SELLER_ORDER_MANAGEMENT.md`](../08-seller/NOVA_SELLER_ORDER_MANAGEMENT.md)
- [`NOVA_SELLER_INVENTORY.md`](../08-seller/NOVA_SELLER_INVENTORY.md)
- [`NOVA_SELLER_ANALYTICS.md`](../08-seller/NOVA_SELLER_ANALYTICS.md)
- [`NOVA_SELLER_PAYOUTS.md`](../08-seller/NOVA_SELLER_PAYOUTS.md)
- [`NOVA_SELLER_COMMISSION.md`](../08-seller/NOVA_SELLER_COMMISSION.md)
- [`NOVA_SELLER_POLICIES.md`](../08-seller/NOVA_SELLER_POLICIES.md)

## 9. 09 Logistics

- [`NOVA_LOGISTICS_SYSTEM.md`](../09-logistics/NOVA_LOGISTICS_SYSTEM.md)
- [`NOVA_RIDER_PLATFORM.md`](../09-logistics/NOVA_RIDER_PLATFORM.md)
- [`NOVA_RIDER_ONBOARDING.md`](../09-logistics/NOVA_RIDER_ONBOARDING.md)
- [`NOVA_RIDER_VERIFICATION.md`](../09-logistics/NOVA_RIDER_VERIFICATION.md)
- [`NOVA_DELIVERY_WORKFLOW.md`](../09-logistics/NOVA_DELIVERY_WORKFLOW.md)
- [`NOVA_DELIVERY_ZONES.md`](../09-logistics/NOVA_DELIVERY_ZONES.md)
- [`NOVA_DELIVERY_PRICING.md`](../09-logistics/NOVA_DELIVERY_PRICING.md)
- [`NOVA_ORDER_TRACKING.md`](../09-logistics/NOVA_ORDER_TRACKING.md)
- [`NOVA_RIDER_ASSIGNMENT.md`](../09-logistics/NOVA_RIDER_ASSIGNMENT.md)
- [`NOVA_PROOF_OF_DELIVERY.md`](../09-logistics/NOVA_PROOF_OF_DELIVERY.md)
- [`NOVA_DELIVERY_EXCEPTIONS.md`](../09-logistics/NOVA_DELIVERY_EXCEPTIONS.md)

## 10. 10 Payments Finance

- [`NOVA_PAYMENT_ARCHITECTURE.md`](../10-payments-finance/NOVA_PAYMENT_ARCHITECTURE.md)
- [`NOVA_PAYMENT_FLOW.md`](../10-payments-finance/NOVA_PAYMENT_FLOW.md)
- [`NOVA_SIERRA_LEONE_PAYMENTS.md`](../10-payments-finance/NOVA_SIERRA_LEONE_PAYMENTS.md)
- [`NOVA_PAYMENT_METHODS.md`](../10-payments-finance/NOVA_PAYMENT_METHODS.md)
- [`NOVA_NOVA_WALLET.md`](../10-payments-finance/NOVA_NOVA_WALLET.md)
- [`NOVA_PAYMENT_WEBHOOKS.md`](../10-payments-finance/NOVA_PAYMENT_WEBHOOKS.md)
- [`NOVA_PAYMENT_RECONCILIATION.md`](../10-payments-finance/NOVA_PAYMENT_RECONCILIATION.md)
- [`NOVA_REFUNDS.md`](../10-payments-finance/NOVA_REFUNDS.md)
- [`NOVA_SELLER_PAYOUTS.md`](../10-payments-finance/NOVA_SELLER_PAYOUTS.md)
- [`NOVA_TRANSACTION_LEDGER.md`](../10-payments-finance/NOVA_TRANSACTION_LEDGER.md)
- [`NOVA_PAYMENT_SECURITY.md`](../10-payments-finance/NOVA_PAYMENT_SECURITY.md)

## 11. 11 Admin

- [`NOVA_ADMIN_PLATFORM.md`](../11-admin/NOVA_ADMIN_PLATFORM.md)
- [`NOVA_ADMIN_DASHBOARD.md`](../11-admin/NOVA_ADMIN_DASHBOARD.md)
- [`NOVA_USER_MANAGEMENT.md`](../11-admin/NOVA_USER_MANAGEMENT.md)
- [`NOVA_SELLER_MANAGEMENT.md`](../11-admin/NOVA_SELLER_MANAGEMENT.md)
- [`NOVA_PRODUCT_MODERATION.md`](../11-admin/NOVA_PRODUCT_MODERATION.md)
- [`NOVA_ORDER_MANAGEMENT.md`](../11-admin/NOVA_ORDER_MANAGEMENT.md)
- [`NOVA_PAYMENT_MANAGEMENT.md`](../11-admin/NOVA_PAYMENT_MANAGEMENT.md)
- [`NOVA_DISPUTE_MANAGEMENT.md`](../11-admin/NOVA_DISPUTE_MANAGEMENT.md)
- [`NOVA_CONTENT_MANAGEMENT.md`](../11-admin/NOVA_CONTENT_MANAGEMENT.md)
- [`NOVA_ANALYTICS.md`](../11-admin/NOVA_ANALYTICS.md)
- [`NOVA_AUDIT_LOGS.md`](../11-admin/NOVA_AUDIT_LOGS.md)
- [`NOVA_ADMIN_PERMISSIONS.md`](../11-admin/NOVA_ADMIN_PERMISSIONS.md)

## 12. 12 Security

- [`NOVA_SECURITY_ARCHITECTURE.md`](../12-security/NOVA_SECURITY_ARCHITECTURE.md)
- [`NOVA_SECURITY_STANDARDS.md`](../12-security/NOVA_SECURITY_STANDARDS.md)
- [`NOVA_AUTH_SECURITY.md`](../12-security/NOVA_AUTH_SECURITY.md)
- [`NOVA_AUTHORIZATION.md`](../12-security/NOVA_AUTHORIZATION.md)
- [`NOVA_SESSION_SECURITY.md`](../12-security/NOVA_SESSION_SECURITY.md)
- [`NOVA_API_SECURITY.md`](../12-security/NOVA_API_SECURITY.md)
- [`NOVA_DATA_SECURITY.md`](../12-security/NOVA_DATA_SECURITY.md)
- [`NOVA_PAYMENT_SECURITY.md`](../12-security/NOVA_PAYMENT_SECURITY.md)
- [`NOVA_SECRETS_MANAGEMENT.md`](../12-security/NOVA_SECRETS_MANAGEMENT.md)
- [`NOVA_RATE_LIMITING.md`](../12-security/NOVA_RATE_LIMITING.md)
- [`NOVA_FRAUD_PREVENTION.md`](../12-security/NOVA_FRAUD_PREVENTION.md)
- [`NOVA_ABUSE_PREVENTION.md`](../12-security/NOVA_ABUSE_PREVENTION.md)
- [`NOVA_SECURITY_INCIDENT_RESPONSE.md`](../12-security/NOVA_SECURITY_INCIDENT_RESPONSE.md)

## 13. 13 Infrastructure Devops

- [`NOVA_INFRASTRUCTURE_ARCHITECTURE.md`](../13-infrastructure-devops/NOVA_INFRASTRUCTURE_ARCHITECTURE.md)
- [`NOVA_ENVIRONMENT_STRATEGY.md`](../13-infrastructure-devops/NOVA_ENVIRONMENT_STRATEGY.md)
- [`NOVA_LOCAL_DEVELOPMENT.md`](../13-infrastructure-devops/NOVA_LOCAL_DEVELOPMENT.md)
- [`NOVA_DEVELOPMENT_ENVIRONMENT.md`](../13-infrastructure-devops/NOVA_DEVELOPMENT_ENVIRONMENT.md)
- [`NOVA_STAGING_ENVIRONMENT.md`](../13-infrastructure-devops/NOVA_STAGING_ENVIRONMENT.md)
- [`NOVA_PRODUCTION_ENVIRONMENT.md`](../13-infrastructure-devops/NOVA_PRODUCTION_ENVIRONMENT.md)
- [`NOVA_DEPLOYMENT.md`](../13-infrastructure-devops/NOVA_DEPLOYMENT.md)
- [`NOVA_CI_CD.md`](../13-infrastructure-devops/NOVA_CI_CD.md)
- [`NOVA_DOCKER.md`](../13-infrastructure-devops/NOVA_DOCKER.md)
- [`NOVA_DATABASE_DEPLOYMENT.md`](../13-infrastructure-devops/NOVA_DATABASE_DEPLOYMENT.md)
- [`NOVA_MONITORING.md`](../13-infrastructure-devops/NOVA_MONITORING.md)
- [`NOVA_BACKUPS.md`](../13-infrastructure-devops/NOVA_BACKUPS.md)
- [`NOVA_DISASTER_RECOVERY.md`](../13-infrastructure-devops/NOVA_DISASTER_RECOVERY.md)
- [`NOVA_COST_MANAGEMENT.md`](../13-infrastructure-devops/NOVA_COST_MANAGEMENT.md)

## 14. 14 Quality Testing

- [`NOVA_TESTING_STRATEGY.md`](../14-quality-testing/NOVA_TESTING_STRATEGY.md)
- [`NOVA_UNIT_TESTING.md`](../14-quality-testing/NOVA_UNIT_TESTING.md)
- [`NOVA_INTEGRATION_TESTING.md`](../14-quality-testing/NOVA_INTEGRATION_TESTING.md)
- [`NOVA_E2E_TESTING.md`](../14-quality-testing/NOVA_E2E_TESTING.md)
- [`NOVA_API_TESTING.md`](../14-quality-testing/NOVA_API_TESTING.md)
- [`NOVA_UI_TESTING.md`](../14-quality-testing/NOVA_UI_TESTING.md)
- [`NOVA_ACCESSIBILITY_TESTING.md`](../14-quality-testing/NOVA_ACCESSIBILITY_TESTING.md)
- [`NOVA_PERFORMANCE_TESTING.md`](../14-quality-testing/NOVA_PERFORMANCE_TESTING.md)
- [`NOVA_SECURITY_TESTING.md`](../14-quality-testing/NOVA_SECURITY_TESTING.md)
- [`NOVA_LOAD_TESTING.md`](../14-quality-testing/NOVA_LOAD_TESTING.md)
- [`NOVA_RELEASE_CHECKLIST.md`](../14-quality-testing/NOVA_RELEASE_CHECKLIST.md)

## 15. 15 Analytics

- [`NOVA_ANALYTICS_STRATEGY.md`](../15-analytics/NOVA_ANALYTICS_STRATEGY.md)
- [`NOVA_EVENT_TRACKING.md`](../15-analytics/NOVA_EVENT_TRACKING.md)
- [`NOVA_PRODUCT_ANALYTICS.md`](../15-analytics/NOVA_PRODUCT_ANALYTICS.md)
- [`NOVA_SELLER_ANALYTICS.md`](../15-analytics/NOVA_SELLER_ANALYTICS.md)
- [`NOVA_CUSTOMER_ANALYTICS.md`](../15-analytics/NOVA_CUSTOMER_ANALYTICS.md)
- [`NOVA_LOGISTICS_ANALYTICS.md`](../15-analytics/NOVA_LOGISTICS_ANALYTICS.md)
- [`NOVA_FINANCIAL_ANALYTICS.md`](../15-analytics/NOVA_FINANCIAL_ANALYTICS.md)
- [`NOVA_KPI_DEFINITIONS.md`](../15-analytics/NOVA_KPI_DEFINITIONS.md)

## 16. 16 Ai

- [`NOVA_AI_STRATEGY.md`](../16-ai/NOVA_AI_STRATEGY.md)
- [`NOVA_AI_FEATURES.md`](../16-ai/NOVA_AI_FEATURES.md)
- [`NOVA_AI_SEARCH.md`](../16-ai/NOVA_AI_SEARCH.md)
- [`NOVA_AI_RECOMMENDATIONS.md`](../16-ai/NOVA_AI_RECOMMENDATIONS.md)
- [`NOVA_AI_PRODUCT_ASSISTANT.md`](../16-ai/NOVA_AI_PRODUCT_ASSISTANT.md)
- [`NOVA_AI_SELLER_ASSISTANT.md`](../16-ai/NOVA_AI_SELLER_ASSISTANT.md)
- [`NOVA_AI_MODERATION.md`](../16-ai/NOVA_AI_MODERATION.md)
- [`NOVA_AI_GOVERNANCE.md`](../16-ai/NOVA_AI_GOVERNANCE.md)

## 17. 17 Legal Trust

- [`NOVA_TERMS_OF_SERVICE.md`](../17-legal-trust/NOVA_TERMS_OF_SERVICE.md)
- [`NOVA_PRIVACY_POLICY.md`](../17-legal-trust/NOVA_PRIVACY_POLICY.md)
- [`NOVA_SELLER_TERMS.md`](../17-legal-trust/NOVA_SELLER_TERMS.md)
- [`NOVA_BUYER_POLICY.md`](../17-legal-trust/NOVA_BUYER_POLICY.md)
- [`NOVA_RETURN_POLICY.md`](../17-legal-trust/NOVA_RETURN_POLICY.md)
- [`NOVA_REFUND_POLICY.md`](../17-legal-trust/NOVA_REFUND_POLICY.md)
- [`NOVA_DELIVERY_POLICY.md`](../17-legal-trust/NOVA_DELIVERY_POLICY.md)
- [`NOVA_PROHIBITED_PRODUCTS.md`](../17-legal-trust/NOVA_PROHIBITED_PRODUCTS.md)
- [`NOVA_CONTENT_POLICY.md`](../17-legal-trust/NOVA_CONTENT_POLICY.md)
- [`NOVA_DISPUTE_POLICY.md`](../17-legal-trust/NOVA_DISPUTE_POLICY.md)

## 18. 18 Operations

- [`NOVA_OPERATIONS_MANUAL.md`](../18-operations/NOVA_OPERATIONS_MANUAL.md)
- [`NOVA_CUSTOMER_SUPPORT.md`](../18-operations/NOVA_CUSTOMER_SUPPORT.md)
- [`NOVA_SELLER_SUPPORT.md`](../18-operations/NOVA_SELLER_SUPPORT.md)
- [`NOVA_INCIDENT_MANAGEMENT.md`](../18-operations/NOVA_INCIDENT_MANAGEMENT.md)
- [`NOVA_DISPUTE_OPERATIONS.md`](../18-operations/NOVA_DISPUTE_OPERATIONS.md)
- [`NOVA_FRAUD_OPERATIONS.md`](../18-operations/NOVA_FRAUD_OPERATIONS.md)
- [`NOVA_REFUND_OPERATIONS.md`](../18-operations/NOVA_REFUND_OPERATIONS.md)
- [`NOVA_ORDER_OPERATIONS.md`](../18-operations/NOVA_ORDER_OPERATIONS.md)
- [`NOVA_ESCALATION_PROCEDURES.md`](../18-operations/NOVA_ESCALATION_PROCEDURES.md)

## 19. 19 Governance

- [`NOVA_DOCUMENTATION_INDEX.md`](../19-governance/NOVA_DOCUMENTATION_INDEX.md)
- [`NOVA_DOCUMENTATION_STANDARDS.md`](../19-governance/NOVA_DOCUMENTATION_STANDARDS.md)
- [`NOVA_ARCHITECTURE_DECISION_RECORDS.md`](../19-governance/NOVA_ARCHITECTURE_DECISION_RECORDS.md)
- [`NOVA_CHANGE_MANAGEMENT.md`](../19-governance/NOVA_CHANGE_MANAGEMENT.md)
- [`NOVA_VERSIONING.md`](../19-governance/NOVA_VERSIONING.md)
- [`NOVA_DEFINITION_OF_DONE.md`](../19-governance/NOVA_DEFINITION_OF_DONE.md)
