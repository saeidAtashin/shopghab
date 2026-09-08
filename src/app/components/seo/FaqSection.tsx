import FAQSchema from "@/app/components/schema/FAQSchema";

export type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  title?: string;
  items: FaqItem[];
  withSchema?: boolean;
  className?: string;
};

export default function FaqSection({
  title = "سوالات متداول",
  items,
  withSchema = true,
  className = "",
}: Props) {
  if (items.length === 0) return null;

  return (
    <section
      className={`border-t border-border bg-background py-24 ${className}`}
      aria-labelledby="faq-section-title"
    >
      {withSchema ? <FAQSchema items={items} /> : null}
      <div className="container mx-auto px-6">
        <h2 id="faq-section-title" className="mb-10 text-3xl font-black">
          {title}
        </h2>
        <div className="space-y-4">
          {items.map((faq, index) => (
            <details
              key={index}
              className="group rounded-2xl border border-border bg-input-bg p-6"
              suppressHydrationWarning
            >
              <summary className="cursor-pointer font-bold marker:content-none">
                {faq.question}
              </summary>
              <p className="mt-4 leading-8 text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
