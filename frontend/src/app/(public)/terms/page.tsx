import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using Nova, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, please do not use the platform.",
  },
  {
    title: "2. User Accounts",
    content:
      "You must be 18 or older to create an account. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us immediately of any unauthorised use.",
  },
  {
    title: "3. Buyer Obligations",
    content:
      "Buyers agree to provide accurate delivery information, pay for orders placed, and use products only for lawful purposes. Fraudulent orders will result in immediate account suspension.",
  },
  {
    title: "4. Seller Obligations",
    content:
      "Sellers must accurately represent their products, fulfil confirmed orders within stated timeframes, and comply with Sierra Leone's commerce regulations. Nova reserves the right to remove non-compliant listings.",
  },
  {
    title: "5. Payments",
    content:
      "All transactions are processed by certified payment partners. Nova is not liable for payment processor outages. Refunds are processed within 5–7 business days to the original payment method.",
  },
  {
    title: "6. Returns & Refunds",
    content:
      "Products may be returned within 30 days of delivery if they are defective, misdescribed, or not delivered. Buyers must contact support to initiate a return. Digital and perishable goods are non-refundable.",
  },
  {
    title: "7. Prohibited Conduct",
    content:
      "You may not use Nova to sell counterfeit goods, facilitate fraud, harass users, scrape data, or circumvent platform fees. Violations result in permanent suspension and may be referred to authorities.",
  },
  {
    title: "8. Intellectual Property",
    content:
      "Nova's brand, logo, software, and content are owned by Nova Commerce. You may not reproduce or redistribute them without written permission. Sellers retain ownership of their product content.",
  },
  {
    title: "9. Limitation of Liability",
    content:
      "To the fullest extent permitted by law, Nova is not liable for indirect, incidental, or consequential damages arising from platform use. Our total liability is limited to the value of the transaction in dispute.",
  },
  {
    title: "10. Governing Law",
    content:
      "These terms are governed by the laws of the Republic of Sierra Leone. Any disputes will be resolved in the courts of Freetown, Sierra Leone.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: January 2025</p>
      </div>
      <p className="text-slate-600 dark:text-slate-400">
        Please read these terms carefully before using Nova. By using our platform you agree to the following
        conditions.
      </p>
      <div className="space-y-4">
        {sections.map((s) => (
          <div
            key={s.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">{s.title}</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.content}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">
        Questions? Contact us at{" "}
        <a href="mailto:legal@nova.sl" className="text-primary hover:underline">
          legal@nova.sl
        </a>
      </p>
    </div>
  );
}
