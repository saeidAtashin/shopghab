import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  paragraphs: string[];
  className?: string;
};

export default function OverviewSection({
  title,
  paragraphs,
  className = "",
}: Props) {
  const sectionId = title ? "overview-section" : undefined;

  return (
    <section
      className={cn("border-t border-border py-24", className)}
      aria-labelledby={sectionId}
    >
      <div className="container mx-auto px-6">
        {title ? (
          <h2 id={sectionId} className="mb-8 text-3xl font-black">
            {title}
          </h2>
        ) : null}
        <div className="max-w-3xl space-y-5">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="leading-9 text-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
