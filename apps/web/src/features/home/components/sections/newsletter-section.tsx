"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Input } from "@nova/ui";

const schema = z.object({
  email: z.string().email("Please enter a valid email")
});

type NewsletterForm = z.infer<typeof schema>;

export function NewsletterSection() {
  const form = useForm<NewsletterForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" }
  });

  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
      <Card className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h2 className="text-2xl font-semibold">Stay ahead of every deal</h2>
          <p className="mt-1 text-sm text-slate-600">Receive campaign launches, sustainability rewards, and personalized suggestions.</p>
        </div>
        <form className="flex w-full max-w-md gap-2" onSubmit={form.handleSubmit(() => undefined)}>
          <Input aria-label="Email" placeholder="you@example.com" type="email" {...form.register("email")} />
          <Button type="submit">Subscribe</Button>
        </form>
      </Card>
    </section>
  );
}
