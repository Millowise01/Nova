-- Logistics, Finance, Trust & Safety (backend/docs/10-logistics-finance-trust-safety-design.md).
-- Generated via `prisma migrate diff --from-schema-datasource --to-schema-datamodel`
-- against the live dev database, with one unrelated drift statement (a spurious
-- DropIndex/AlterColumn on products.search_vector, an Unsupported("tsvector") raw-SQL
-- column Prisma's diff engine doesn't model correctly) excluded — not part of this change.

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "seller_suspended" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "delivery_zones" (
    "id" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "standard_fee_amount" DECIMAL(14,2) NOT NULL,
    "express_fee_amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "country_code" TEXT NOT NULL DEFAULT 'SL',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "delivery_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_jobs" (
    "id" TEXT NOT NULL,
    "sub_order_id" TEXT NOT NULL,
    "rider_id" TEXT NOT NULL,
    "delivery_zone_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "country_code" TEXT NOT NULL DEFAULT 'SL',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "delivery_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proofs_of_delivery" (
    "id" TEXT NOT NULL,
    "delivery_job_id" TEXT NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proofs_of_delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_accounts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL,
    "ledger_account_id" TEXT NOT NULL,
    "debit_amount" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "credit_amount" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "currency" TEXT NOT NULL,
    "reference_type" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_payouts" (
    "id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "proposed_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "seller_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_submissions" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "subject_type" TEXT NOT NULL,
    "document_reference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "review_proposed_by" TEXT,
    "proposed_decision" TEXT,
    "review_confirmed_by" TEXT,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "kyc_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "order_id" TEXT,
    "review_id" TEXT,
    "opened_by" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolution" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute_events" (
    "id" TEXT NOT NULL,
    "dispute_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_zones_district_key" ON "delivery_zones"("district");

-- CreateIndex
CREATE INDEX "delivery_zones_district_idx" ON "delivery_zones"("district");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_jobs_sub_order_id_key" ON "delivery_jobs"("sub_order_id");

-- CreateIndex
CREATE INDEX "delivery_jobs_rider_id_idx" ON "delivery_jobs"("rider_id");

-- CreateIndex
CREATE INDEX "delivery_jobs_status_idx" ON "delivery_jobs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "proofs_of_delivery_delivery_job_id_key" ON "proofs_of_delivery"("delivery_job_id");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_accounts_code_key" ON "ledger_accounts"("code");

-- CreateIndex
CREATE INDEX "ledger_entries_ledger_account_id_idx" ON "ledger_entries"("ledger_account_id");

-- CreateIndex
CREATE INDEX "ledger_entries_reference_type_reference_id_idx" ON "ledger_entries"("reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "seller_payouts_seller_id_idx" ON "seller_payouts"("seller_id");

-- CreateIndex
CREATE INDEX "seller_payouts_status_idx" ON "seller_payouts"("status");

-- CreateIndex
CREATE INDEX "kyc_submissions_subject_id_idx" ON "kyc_submissions"("subject_id");

-- CreateIndex
CREATE INDEX "kyc_submissions_status_idx" ON "kyc_submissions"("status");

-- CreateIndex
CREATE INDEX "disputes_order_id_idx" ON "disputes"("order_id");

-- CreateIndex
CREATE INDEX "disputes_review_id_idx" ON "disputes"("review_id");

-- CreateIndex
CREATE INDEX "disputes_status_idx" ON "disputes"("status");

-- CreateIndex
CREATE INDEX "dispute_events_dispute_id_idx" ON "dispute_events"("dispute_id");

-- AddForeignKey
ALTER TABLE "delivery_jobs" ADD CONSTRAINT "delivery_jobs_delivery_zone_id_fkey" FOREIGN KEY ("delivery_zone_id") REFERENCES "delivery_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proofs_of_delivery" ADD CONSTRAINT "proofs_of_delivery_delivery_job_id_fkey" FOREIGN KEY ("delivery_job_id") REFERENCES "delivery_jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_ledger_account_id_fkey" FOREIGN KEY ("ledger_account_id") REFERENCES "ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_events" ADD CONSTRAINT "dispute_events_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed Finance's minimal code-defined chart of accounts (backend/docs/10) — no
-- revenue/commission/tax accounts, since nothing posts to them yet.
INSERT INTO "ledger_accounts" ("id", "code", "name", "currency", "created_at") VALUES
  (gen_random_uuid(), 'seller_payable', 'Seller Payable', 'SLE', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'platform_cash', 'Platform Cash', 'SLE', CURRENT_TIMESTAMP);
