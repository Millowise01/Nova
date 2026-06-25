"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/dashboard/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type { Coupon } from "@/types/domain";
import toast from "react-hot-toast";

const SEED_COUPONS: Coupon[] = [
  { id: "c-1", code: "NOVA10", discountType: "PERCENT", discountValue: 10, expiresAt: "2025-12-31T23:59:00Z", isActive: true },
  { id: "c-2", code: "ECO20", discountType: "PERCENT", discountValue: 20, minOrderSll: 200_000, expiresAt: "2025-07-31T23:59:00Z", isActive: true },
  { id: "c-3", code: "SAVE50K", discountType: "FIXED", discountValue: 50_000, expiresAt: "2025-06-30T23:59:00Z", isActive: false },
];

export default function SellerCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(SEED_COUPONS);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [value, setValue] = useState("");

  function addCoupon() {
    if (!code || !value) { toast.error("Fill all fields"); return; }
    const newCoupon: Coupon = {
      id: `c-${Date.now()}`,
      code: code.toUpperCase(),
      discountType: "PERCENT",
      discountValue: Number(value),
      expiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      isActive: true,
    };
    setCoupons((prev) => [...prev, newCoupon]);
    setCode(""); setValue("");
    setModalOpen(false);
    toast.success("Coupon created");
  }

  const rows = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.discountType === "PERCENT" ? `${c.discountValue}%` : `SLL ${c.discountValue.toLocaleString()}`,
    expires: formatDate(c.expiresAt),
    isActive: c.isActive,
  }));

  return (
    <main className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus size={15} /> Create Coupon
        </Button>
      </div>

      <DataTable
        columns={[
          { key: "code", header: "Code", sortable: true, render: (row) => (
            <code className="rounded bg-slate-100 px-2 py-0.5 text-sm font-bold dark:bg-slate-800">{String(row.code)}</code>
          )},
          { key: "type", header: "Discount" },
          { key: "expires", header: "Expires" },
          { key: "isActive", header: "Status", render: (row) => (
            <Badge variant={row.isActive ? "success" : "default"}>
              {row.isActive ? "Active" : "Inactive"}
            </Badge>
          )},
        ]}
        data={rows as Record<string, unknown>[]}
        emptyMessage="No coupons yet"
      />

      <Modal title="Create Coupon" open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-3">
          <Input label="Coupon Code" placeholder="SUMMER20" value={code} onChange={(e) => setCode(e.target.value)} />
          <Input label="Discount (%)" type="number" min={1} max={100} placeholder="10" value={value} onChange={(e) => setValue(e.target.value)} />
          <Button className="w-full" onClick={addCoupon}>Create</Button>
        </div>
      </Modal>
    </main>
  );
}
