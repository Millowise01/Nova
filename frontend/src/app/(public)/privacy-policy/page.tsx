import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

const sections = [
  { title: "1. Information We Collect", content: "We collect information you provide directly — such as name, email, phone, and address — when you register or make a purchase. We also collect usage data, device information, and cookies to improve our services." },
  { title: "2. How We Use Your Information", content: "We use your data to process orders, send delivery updates, provide customer support, personalise your experience, and send promotional communications (with your consent)." },
  { title: "3. Data Sharing", content: "We share your data only with sellers fulfilling your orders, payment processors handling transactions, and delivery partners. We never sell your personal data to third parties." },
  { title: "4. Data Security", content: "We use industry-standard encryption (TLS/SSL), secure data centres, and access controls to protect your information. Payment data is handled by certified PCI-DSS payment processors." },
  { title: "5. Your Rights", content: "You have the right to access, correct, or delete your personal data at any time. Contact us at privacy@nova.sl to submit a request." },
  { title: "6. Cookies", content: "We use essential cookies for authentication and cart functionality, and optional analytics cookies to understand platform usage. You can manage cookie preferences in your browser settings." },
  { title: "7. Changes to This Policy", content: "We may update this policy from time to time. We'll notify you of significant changes by email or in-app notification. Continued use of Nova after changes constitutes acceptance." },
  { title: "8. Contact", content: "For privacy-related questions, contact our Data Protection Officer at privacy@nova.sl or write to Nova Commerce, 12 Wilkinson Road, Freetown, Sierra Leone." },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: January 2025</p>
      </div>
      <p className="text-slate-600 dark:text-slate-400">
        At Nova Commerce, we take your privacy seriously. This policy explains what data we collect, how we use it, and your rights.
      </p>
      <div className="space-y-6">
        {sections.map((s) => (
          <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">{s.title}</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
