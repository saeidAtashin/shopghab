import type { ReactNode } from "react";

import FuturisticBreadcrumbTree from "@/app/components/FuturisticBreadcrumbTree";
import {
  type BreadcrumbItem,
  breadcrumbJsonLd,
} from "../../../lib/seo/breadcrumbs";
import { breadcrumbTrailFromPath } from "../../../lib/breadcrumb-tree-utils";
import JsonLd from "./JsonLd";

type Props = {
  children: ReactNode;
  currentPath: string;
  /** Optional override when path is not in the site tree. */
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
  containerClassName?: string;
  breadcrumbClassName?: string;
  /** Extra JSON-LD objects (WebPage, ItemList, etc.) */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export default function PageShell({
  children,
  currentPath,
  breadcrumbs,
  className = "",
  containerClassName = "container mx-auto px-6",
  breadcrumbClassName = "mb-6",
  jsonLd,
}: Props) {
  const schemas: Record<string, unknown>[] = [];
  const trail = breadcrumbs ?? breadcrumbTrailFromPath(currentPath);

  if (trail.length > 0) {
    schemas.push(breadcrumbJsonLd(trail, currentPath));
  }

  if (jsonLd) {
    schemas.push(...(Array.isArray(jsonLd) ? jsonLd : [jsonLd]));
  }

  return (
    <>
      {schemas.length > 0 && <JsonLd data={schemas} />}
      <div className={containerClassName}>
        <FuturisticBreadcrumbTree
          currentPath={currentPath}
          className={breadcrumbClassName}
        />
      </div>
      <div className={className}>{children}</div>
    </>
  );
}
