"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { addressSchema, type AddressSchema } from "@/schemas/auth";
import type { Address } from "@/types/domain";

const SEED_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    userId: "u-1",
    label: "Home",
    line1: "12 Wilkinson Road",
    city: "Freetown",
    country: "Sierra Leone",
    phone: "+232 76 000 001",
    isDefault: true,
  },
  {
    id: "addr-2",
    userId: "u-1",
    label: "Office",
    line1: "45 Siaka Stevens Street",
    city: "Freetown",
    country: "Sierra Leone",
    phone: "+232 76 000 002",
    isDefault: false,
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(SEED_ADDRESSES);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressSchema>({ resolver: zodResolver(addressSchema) });

  async function onSubmit(values: AddressSchema) {
    await new Promise((r) => setTimeout(r, 400));
    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      userId: "u-1",
      label: values.label,
      line1: values.line1,
      line2: values.line2,
      city: values.city,
      country: values.country,
      phone: values.phone,
      isDefault: values.isDefault ?? false,
    };
    setAddresses((prev) => [...prev, newAddr]);
    toast.success("Address added");
    reset();
    setModalOpen(false);
  }

  function deleteAddress(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address removed");
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Addresses</h1>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus size={15} /> Add Address
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="relative rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-2 flex items-center gap-2">
              <MapPin size={15} className="text-primary" />
              <span className="font-semibold">{addr.label}</span>
              {addr.isDefault && <Badge variant="eco">Default</Badge>}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{addr.line1}</p>
            {addr.line2 && (
              <p className="text-sm text-slate-600 dark:text-slate-400">{addr.line2}</p>
            )}
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {addr.city}, {addr.country}
            </p>
            <p className="mt-1 text-xs text-slate-400">{addr.phone}</p>
            <button
              onClick={() => deleteAddress(addr.id)}
              aria-label="Delete address"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-error dark:hover:bg-red-950/20"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <Modal title="Add Address" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input label="Label (e.g. Home)" error={errors.label?.message} {...register("label")} />
          <Input label="Street address" error={errors.line1?.message} {...register("line1")} />
          <Input label="Apartment / Suite (optional)" {...register("line2")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" error={errors.city?.message} {...register("city")} />
            <Input label="Country" defaultValue="Sierra Leone" error={errors.country?.message} {...register("country")} />
          </div>
          <Input label="Phone" type="tel" error={errors.phone?.message} {...register("phone")} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-primary" {...register("isDefault")} />
            Set as default address
          </label>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving…" : "Save Address"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
