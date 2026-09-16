"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, Button, Card, Input } from "@nova/ui";
import { emailSchema } from "@nova/validation";

const schema = z.object({
  email: emailSchema,
});

type NewsletterForm = z.infer<typeof schema>;

export function NewsletterSection() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<NewsletterForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  // No newsletter/marketing-capture endpoint exists on the backend — this form
  // can't actually subscribe anyone. Say so instead of silently doing nothing
  // while looking like it succeeded.
  const onSubmit = () => {
    setSubmitted(true);
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
      <Card className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h2 className="text-2xl font-semibold">Stay ahead of every deal</h2>

          <p className="mt-1 text-sm text-slate-600">
            Receive campaign launches, sustainability rewards, and personalized suggestions.
          </p>
        </div>

        <div className="w-full max-w-md space-y-2">
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              void form.handleSubmit(onSubmit)(event);
            }}
          >
            <Input
              aria-label="Email"
              placeholder="you@example.com"
              type="email"
              {...form.register("email")}
            />

            <Button type="submit">Subscribe</Button>
          </form>

          {submitted && (
            <Alert tone="neutral">
              Newsletter signups aren&apos;t available yet — check back soon.
            </Alert>
          )}
        </div>
      </Card>
    </section>
  );
}
