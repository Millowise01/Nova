"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { contactSchema, type ContactSchema } from "@/schemas/auth";

const contactInfo = [
  { Icon: MapPin, label: "Address", value: "12 Wilkinson Road, Freetown, Sierra Leone" },
  { Icon: Mail, label: "Email", value: "hello@nova.sl" },
  { Icon: Phone, label: "Phone", value: "+232 76 000 000" },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(_values: ContactSchema) {
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    reset();
    toast.success("Message sent! We'll get back to you within 24 hours.");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Get in Touch</h1>
        <p className="mb-8 text-slate-500">Have a question, partnership idea, or need support? We're here.</p>

        <div className="space-y-4">
          {contactInfo.map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Icon size={18} className="text-primary" /></div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        {sent ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 size={48} className="mb-4 text-success" />
            <h2 className="text-xl font-bold">Message Sent!</h2>
            <p className="mt-2 text-slate-500">We'll respond within 24 hours.</p>
            <Button onClick={() => setSent(false)} variant="outline" className="mt-6">Send another</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Your name" placeholder="Aminata Koroma" error={errors.name?.message} {...register("name")} />
            <Input label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
            <Input label="Subject" placeholder="Product inquiry, partnership, support…" error={errors.subject?.message} {...register("subject")} />
            <Textarea label="Message" rows={5} placeholder="Tell us more…" error={errors.message?.message} {...register("message")} />
            <Button type="submit" disabled={isSubmitting} className="w-full py-3">{isSubmitting ? "Sending…" : "Send Message"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
