"use client";

import { useState } from "react";
import { CreditCard, Plus, Trash2, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

interface PaymentMethod {
  id: string;
  type: "card" | "mobile";
  label: string;
  detail: string;
  isDefault: boolean;
}

const SEED_METHODS: PaymentMethod[] = [
  { id: "pm-1", type: "mobile", label: "Orange Money", detail: "+232 76 000 000", isDefault: true },
  { id: "pm-2", type: "card", label: "Visa", detail: "**** **** **** 4242", isDefault: false },
];

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>(SEED_METHODS);
  const [modalOpen, setModalOpen] = useState(false);
  const [cardNum, setCardNum] = useState("");

  function remove(id: string) {
    setMethods((prev) => prev.filter((m) => m.id !== id));
    toast.success("Payment method removed");
  }

  function addCard() {
    if (cardNum.length < 16) { toast.error("Enter a valid card number"); return; }
    const newMethod: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type: "card",
      label: "Visa",
      detail: `**** **** **** ${cardNum.slice(-4)}`,
      isDefault: false,
    };
    setMethods((prev) => [...prev, newMethod]);
    setCardNum("");
    setModalOpen(false);
    toast.success("Card added");
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payment Methods</h1>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus size={15} /> Add Card
        </Button>
      </div>

      <div className="space-y-3">
        {methods.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {m.type === "card" ? <CreditCard size={18} /> : <Smartphone size={18} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{m.label}</p>
                  {m.isDefault && <Badge variant="eco">Default</Badge>}
                </div>
                <p className="text-sm text-slate-500">{m.detail}</p>
              </div>
            </div>
            <button
              onClick={() => remove(m.id)}
              aria-label="Remove"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-error dark:hover:bg-red-950/20"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <Modal title="Add Card" open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-3">
          <Input
            label="Card number"
            placeholder="4242 4242 4242 4242"
            maxLength={19}
            value={cardNum}
            onChange={(e) => setCardNum(e.target.value.replace(/\D/g, ""))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Expiry" placeholder="MM/YY" />
            <Input label="CVV" placeholder="123" maxLength={4} />
          </div>
          <Input label="Cardholder name" placeholder="Aminata Koroma" />
          <Button className="w-full" onClick={addCard}>
            Add Card
          </Button>
        </div>
      </Modal>
    </div>
  );
}
