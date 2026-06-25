"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  { q: "How do I place an order?", a: "Browse products, add items to your cart, and proceed to checkout. You can pay by card, Orange Money, or Africell Money." },
  { q: "What payment methods are accepted?", a: "Nova accepts debit/credit cards, Orange Money, and Africell Money for all transactions." },
  { q: "How long does delivery take?", a: "Standard delivery takes 3–5 business days. Express delivery is available for next-day delivery in Freetown." },
  { q: "Can I return a product?", a: "Yes. All products have a 30-day return window. Contact support to initiate a return and receive a full refund." },
  { q: "What is the Eco Score?", a: "Our Eco Score (0–100) rates each product on carbon footprint, packaging materials, supply chain transparency, and seller sustainability practices." },
  { q: "How do I become a seller?", a: "Register at nova.sl/seller/register. Our team will verify your business, and you can start listing products within 48 hours." },
  { q: "Is my payment information secure?", a: "Yes. Nova uses bank-grade encryption and never stores raw card data. All transactions are processed by certified payment processors." },
  { q: "Do you deliver outside Freetown?", a: "We deliver nationwide in Sierra Leone. Delivery times and fees vary by location. Check availability at checkout." },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold">Frequently Asked Questions</h1>
      <p className="mb-8 text-slate-500">Find answers to common questions about shopping, payments, delivery, and selling on Nova.</p>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
              aria-expanded={open === i}
            >
              <span className="font-medium">{faq.q}</span>
              <ChevronDown size={18} className={cn("flex-shrink-0 text-slate-400 transition-transform", open === i && "rotate-180")} />
            </button>
            {open === i && (
              <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
