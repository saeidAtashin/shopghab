import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type HubLink = {
  title: string;
  description?: string;
  href: string;
};

type Props = {
  heading: string;
  description?: string;
  links: HubLink[];
};

export default function HubLinkGrid({ heading, description, links }: Props) {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-black lg:text-4xl">{heading}</h1>
      {description && (
        <p className="mb-10 max-w-2xl text-lg text-muted">{description}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-2xl border border-border bg-surface p-5 transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-foreground group-hover:text-cyan-200">
                  {link.title}
                </h2>
                {link.description && (
                  <p className="mt-2 text-sm text-muted">{link.description}</p>
                )}
              </div>
              <ChevronLeft
                className="shrink-0 text-muted transition group-hover:text-cyan-400"
                size={18}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
