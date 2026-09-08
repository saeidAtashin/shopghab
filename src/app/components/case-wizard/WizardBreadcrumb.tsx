import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Crumb = { label: string; href?: string };

type Props = {
  crumbs: Crumb[];
};

export default function WizardBreadcrumb({ crumbs }: Props) {
  return (
    <nav aria-label="مسیر طراحی" className="flex flex-wrap items-center gap-2 text-sm">
      {crumbs.map((crumb, i) => (
        <span key={crumb.label} className="flex items-center gap-2">
          {i > 0 ? <ChevronLeft size={14} className="text-muted" /> : null}
          {crumb.href ? (
            <Link href={crumb.href} className="text-muted transition hover:text-cyan-400">
              {crumb.label}
            </Link>
          ) : (
            <span className="font-medium text-cyan-400">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
