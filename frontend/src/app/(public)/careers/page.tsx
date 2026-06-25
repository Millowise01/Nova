import type { Metadata } from "next";
import { ArrowRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Careers at Nova" };

const roles = [
  { title: "Senior Backend Engineer", team: "Engineering", location: "Freetown / Remote", type: "Full-time" },
  { title: "Product Designer (UX/UI)", team: "Design", location: "Remote", type: "Full-time" },
  { title: "Seller Onboarding Specialist", team: "Growth", location: "Freetown", type: "Full-time" },
  { title: "Data Analyst", team: "Analytics", location: "Remote", type: "Contract" },
  { title: "Customer Support Lead", team: "Operations", location: "Freetown", type: "Full-time" },
  { title: "Sustainability Partnerships Manager", team: "Partnerships", location: "Remote", type: "Full-time" },
];

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <div className="surface-gradient rounded-3xl px-8 py-14 text-center">
        <h1 className="text-4xl font-bold">Build the future of African commerce</h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600 dark:text-slate-300">
          Join a mission-driven team creating sustainable trade infrastructure for Sierra Leone and beyond.
        </p>
      </div>

      <section>
        <h2 className="mb-6 text-2xl font-bold">Open Roles</h2>
        <div className="space-y-3">
          {roles.map((role) => (
            <div key={role.title} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{role.title}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge>{role.team}</Badge>
                  <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={11} />{role.location}</span>
                  <Badge variant={role.type === "Contract" ? "warning" : "success"}>{role.type}</Badge>
                </div>
              </div>
              <button className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Apply <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-xl font-bold">Don't see your role?</h2>
        <p className="text-slate-600 dark:text-slate-400">We're always looking for passionate people. Send your CV and a note to <a href="mailto:careers@nova.sl" className="text-primary hover:underline">careers@nova.sl</a></p>
      </div>
    </div>
  );
}
