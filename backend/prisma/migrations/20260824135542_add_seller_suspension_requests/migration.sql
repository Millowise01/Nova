-- Trust & Safety seller suspension (backend/docs/10) — dual-authorized propose/confirm,
-- same shape as RefundRequest/SellerPayout.
CREATE TABLE "seller_suspension_requests" (
    "id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "proposed_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "seller_suspension_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "seller_suspension_requests_seller_id_idx" ON "seller_suspension_requests"("seller_id");

CREATE INDEX "seller_suspension_requests_status_idx" ON "seller_suspension_requests"("status");
