"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { CheckCircle2, Leaf, ShieldCheck, Store } from "lucide-react";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { sellerApi } from "@/lib/api";

const sellerSchema = z.object({
  shopName: z.string().min(3, "Shop name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  phone: z.string().min(7, "Enter a valid phone number"),
  address: z.string().min(5, "Enter your business address"),
  category: z.string().min(1, "Select a category"),
  taxId: z.string().optional(),
  isEcoApplicant: z.boolean().optional(),
});

type SellerForm = z.infer<typeof sellerSchema>;

const CATEGORIES = [
  "Fashion & Clothing",
  "Home & Living",
  "Electronics",
  "Organic Food",
  "Beauty & Care",
  "Health & Wellness",
  "Arts & Crafts",
  "Other",
];

const perks = [
  { Icon: Store, text: "Reach thousands of buyers across Sierra Leone" },
  { Icon: Leaf, text: "Earn eco-certified seller badge" },
  { Icon: ShieldCheck, text: "Verified seller trust mark" },
];

export default function SellerRegistrationPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SellerForm>({ resolver: zodResolver(sellerSchema) });

  async function onSubmit(values: SellerForm) {
    try {
      await sellerApi.register(values);
      setSubmitted(true);
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 size={44} className="text-success" />
        </div>
        <h1 className="text-2xl font-bold">Application Submitted!</h1>
        <p className="text-slate-500">
          Our team will review your application within 48 hours. You&apos;ll receive an email confirmation shortly.
        </p>
        <Button onClick={() => router.push("/")} variant="outline" className="mt-4 w-full">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-12 py-6 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="text-2xl font-bold">Become a Seller</h1>
        <p className="mt-1 text-sm text-slate-500 mb-8">
          Join Nova's marketplace and start selling to customers across Sierra Leone.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Shop / Business Name"
            placeholder="e.g. EcoLight SL"
            error={errors.shopName?.message}
            {...register("shopName")}
          />
          <Textarea
            label="Business Description"
            rows={4}
            placeholder="Tell customers what you sell and what makes your shop unique…"
            error={errors.description?.message}
            {...register("description")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Business Phone"
              type="tel"
              placeholder="+232 76 000 000"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Primary Category
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900"
                {...register("category")}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-error">{errors.category.message}</p>
              )}
            </div>
          </div>
          <Input
            label="Business Address"
            placeholder="12 Wilkinson Road, Freetown"
            error={errors.address?.message}
            {...register("address")}
          />
          <Input
            label="Tax ID / Business Registration (optional)"
            placeholder="SL-TAX-0000000"
            {...register("taxId")}
          />
          <label className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <input type="checkbox" className="mt-0.5 accent-primary" {...register("isEcoApplicant")} />
            <div>
              <p className="font-medium">Apply for Eco Certification</p>
              <p className="text-sm text-slate-500">
                Our team will evaluate your supply chain and packaging for eco certification.
              </p>
            </div>
          </label>
          <Button type="submit" disabled={isSubmitting} className="w-full py-3">
            {isSubmitting ? "Submitting…" : "Submit Application"}
          </Button>
        </form>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4">
        <div className="surface-gradient rounded-2xl p-6">
          <h2 className="mb-4 font-semibold">Why sell on Nova?</h2>
          <div className="space-y-4">
            {perks.map(({ Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon size={15} className="text-primary" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 font-semibold">What you get</h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {[
              "Dedicated seller dashboard",
              "Real-time order management",
              "Analytics & revenue reports",
              "Customer messaging",
              "Coupon & promotion tools",
              "Dispute resolution support",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
