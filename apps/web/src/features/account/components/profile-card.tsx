"use client";

import { useEffect, useState } from "react";

import { Button, Card, ErrorState, Input, Select, Spinner } from "@nova/ui";

import { useUpdateMeMutation } from "../account.mutations";
import { useMeQuery } from "../account.queries";

const LOCALE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "ar", label: "العربية" },
];

/** Real GET/PATCH /v1/me, wired into the Settings page's "Profile" section.
 *  Deliberately name/locale only — email/phone are shown read-only, with no
 *  edit affordance, since changing either needs its own verify-then-change
 *  flow that doesn't exist yet (confirmed decision, not an oversight). */
export function ProfileCard() {
  const meQuery = useMeQuery();
  const updateMe = useUpdateMeMutation();

  const [name, setName] = useState("");
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    if (meQuery.data) {
      setName(meQuery.data.name ?? "");
      setLocale(meQuery.data.locale);
    }
  }, [meQuery.data]);

  if (meQuery.isLoading) {
    return (
      <Card className="flex items-center justify-center gap-3 rounded-xl py-12 text-sm text-[color:var(--color-foreground-muted)]">
        <Spinner className="h-4 w-4" /> Loading profile...
      </Card>
    );
  }

  if (meQuery.isError || !meQuery.data) {
    return (
      <ErrorState
        action={<Button onClick={() => void meQuery.refetch()}>Try again</Button>}
        description="We couldn't load your profile."
        title="Something went wrong"
      />
    );
  }

  const me = meQuery.data;
  const dirty = name !== (me.name ?? "") || locale !== me.locale;

  return (
    <Card className="space-y-4 rounded-xl p-6">
      <div>
        <h2 className="text-base font-bold text-[color:var(--color-foreground)]">Profile</h2>
        <p className="text-sm text-[color:var(--color-foreground-muted)]">
          Personal profile and contact details.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!dirty) return;
          updateMe.mutate({
            ...(name !== (me.name ?? "") ? { name } : {}),
            ...(locale !== me.locale ? { locale } : {}),
          });
        }}
      >
        <Input label="Full name" onChange={(e) => setName(e.target.value)} value={name} />

        <Select
          label="Language"
          onChange={(e) => setLocale(e.target.value)}
          options={LOCALE_OPTIONS}
          value={locale}
        />

        {/* Read-only — no edit affordance. Changing either needs its own
            verify-then-change flow, not built here. */}
        <Input
          disabled
          helperText="Contact support to change your email"
          label="Email"
          value={me.email}
        />
        {me.phone && (
          <Input
            disabled
            helperText="Contact support to change your phone number"
            label="Phone"
            value={me.phone}
          />
        )}

        <Button disabled={!dirty || updateMe.isPending} type="submit">
          {updateMe.isPending ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
