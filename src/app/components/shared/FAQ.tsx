interface FAQItem {
  question: string;
  answer: string;
}

interface Props {
  items: FAQItem[];
}

export default function FAQ({ items }: Props) {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <h2 className="mb-12 text-center text-4xl font-black">سوالات متداول</h2>

        <div className="mx-auto max-w-4xl space-y-6">
          {items.map((item) => (
            <div
              key={item.question}
              className="
                  rounded-2xl
                  border
                  border-zinc-800
                  bg-zinc-900/50
                  p-6
                "
            >
              <h3 className="mb-4 text-xl font-bold">{item.question}</h3>

              <p className="leading-8 text-zinc-400">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
