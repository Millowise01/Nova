import { Card } from "@nova/ui";

const testimonials = [
  {
    quote: "Nova helped us reduce checkout friction and discover trusted local sellers.",
    author: "Mariama K., Freetown"
  },
  {
    quote: "The wallet and rewards ecosystem makes repeat orders seamless.",
    author: "Ibrahim S., Bo"
  },
  {
    quote: "I now compare products with AI suggestions before every purchase.",
    author: "Hawa J., Kenema"
  }
];

export function TestimonialsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 px-4 md:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold">What customers are saying</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((item) => (
          <Card key={item.author}>
            <p className="text-sm text-slate-700">"{item.quote}"</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{item.author}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
