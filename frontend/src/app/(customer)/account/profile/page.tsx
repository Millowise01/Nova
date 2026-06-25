"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth-store";
import { updateProfileSchema, type UpdateProfileSchema } from "@/schemas/auth";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  async function onSubmit(values: UpdateProfileSchema) {
    await new Promise((r) => setTimeout(r, 600));
    if (user) setUser({ ...user, ...values });
    toast.success("Profile updated");
  }

  return (
    <div className="space-y-6 py-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {user?.firstName?.[0] ?? "U"}
          </div>
          <button
            aria-label="Change avatar"
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow hover:bg-primary/90"
          >
            <Camera size={13} />
          </button>
        </div>
        <div>
          <p className="font-semibold">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="mb-5 font-semibold">Personal Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Last name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
          <Input
            label="Email address"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Phone number"
            type="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="mt-5"
        >
          {isSubmitting ? "Saving…" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
