import { getReadyCaseBySlug } from "@/lib/cases/ready.static";
import {
  getBrandBySlug,
  getModelBySlug,
} from "@/lib/cases/brands.static";
import {
  categoryChain,
  findPublishedDesign,
  primaryCategory,
  resolvePublicFilter,
} from "@/lib/catalog/logic";
import { readCatalog } from "@/lib/catalog/store";
import { normalizePath } from "@/lib/breadcrumb-tree-utils";
import { crumbs, type BreadcrumbItem } from "@/lib/seo/breadcrumbs";

const HOME: BreadcrumbItem = { label: "خانه", href: "/" };

const STATIC_PAGES: Record<string, string> = {
  "/tracking": "پیگیری سفارش",
  "/about-us": "درباره ما",
  "/contact": "تماس با ما",
  "/faq": "سوالات متداول",
  "/terms": "قوانین و شرایط",
  "/privacy-policy": "حریم خصوصی",
};

function withHome(...segments: BreadcrumbItem[]): BreadcrumbItem[] {
  return [HOME, ...segments];
}

function current(label: string): BreadcrumbItem {
  return crumbs.current(label);
}

function link(label: string, href: string): BreadcrumbItem {
  return { label, href };
}

function resolveCreate(pathname: string): BreadcrumbItem[] | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "create") return null;

  const create = crumbs.create();
  if (segments.length === 1) return withHome(current(create.label));

  const brand = getBrandBySlug(segments[1] ?? "");
  if (!brand) return withHome(create);

  if (segments.length === 2) {
    return withHome(create, current(brand.name));
  }

  const model = getModelBySlug(brand.slug, segments[2] ?? "");
  return withHome(
    create,
    link(brand.name, `/create/${brand.slug}`),
    current(model?.name ?? segments[2] ?? brand.name),
  );
}

function resolveDesigns(pathname: string): BreadcrumbItem[] | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "designs") return null;

  const hub = crumbs.designs();
  if (segments.length === 1) return withHome(current(hub.label));

  const catalog = readCatalog();

  if (segments[1] === "category") {
    const slug = segments[2];
    if (!slug) return withHome(current(hub.label));
    const category = catalog.categories.find((item) => item.slug === slug);
    if (!category) return withHome(hub, current(slug));

    const ancestry = categoryChain(catalog, category);
    return withHome(
      hub,
      ...ancestry.map((item, index) =>
        index === ancestry.length - 1
          ? current(item.name)
          : link(item.name, `/designs/category/${item.slug}`),
      ),
    );
  }

  if (segments[1] === "collection") {
    const slug = segments[2];
    if (!slug) return withHome(current(hub.label));
    const collection = catalog.collections.find((item) => item.slug === slug);
    return withHome(hub, current(collection?.name ?? slug));
  }

  if (segments[1] === "filter") {
    const groupSlug = segments[2];
    const valueSlug = segments[3];
    if (!groupSlug) return withHome(current(hub.label));
    if (!valueSlug) {
      const group = catalog.attributeGroups.find((item) => item.slug === groupSlug);
      return withHome(hub, current(group?.name ?? groupSlug));
    }

    const match = resolvePublicFilter(catalog, groupSlug, valueSlug);
    if (!match) return withHome(hub, current(valueSlug));
    return withHome(hub, { label: match.group.name }, current(match.value.name));
  }

  const design = findPublishedDesign(catalog, segments[1] ?? "");
  const category = design ? primaryCategory(catalog, design) : undefined;
  return withHome(
    hub,
    ...(category
      ? [link(category.name, `/designs/category/${category.slug}`)]
      : []),
    current(design?.title ?? segments[1] ?? hub.label),
  );
}

function resolveCases(pathname: string): BreadcrumbItem[] | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "cases") return null;

  const hub = crumbs.cases();
  if (segments.length === 1) return withHome(current(hub.label));

  const slug = segments[1] ?? "";
  const product = getReadyCaseBySlug(slug);
  return withHome(hub, current(product?.title ?? slug));
}

function resolveCart(pathname: string): BreadcrumbItem[] | null {
  if (pathname === "/cart") return withHome(current(crumbs.cart().label));
  if (pathname === "/checkout") {
    return withHome(crumbs.cart(), current("تسویه حساب"));
  }
  return null;
}

function resolvePhones(pathname: string): BreadcrumbItem[] | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "phones") return null;

  const create = crumbs.create();

  if (segments.length === 2) {
    const brand = getBrandBySlug(segments[1]!);
    if (!brand) return withHome(create, current("قاب موبایل"));
    return withHome(create, current(`قاب ${brand.name}`));
  }

  if (segments.length === 3) {
    const brand = getBrandBySlug(segments[1]!);
    const model = getModelBySlug(segments[1]!, segments[2]!);
    if (!brand || !model) {
      return withHome(create, current("قاب موبایل"));
    }
    return withHome(
      create,
      link(`قاب ${brand.name}`, `/phones/${brand.slug}`),
      current(model.name),
    );
  }

  return null;
}

/** Resolve breadcrumb trail from path. Returns empty array on home. */
export function resolveBreadcrumbs(
  path: string,
  override?: BreadcrumbItem[],
): BreadcrumbItem[] {
  if (override?.length) return override;

  const normalized = normalizePath(path);
  if (normalized === "/") return [];

  const resolvers = [
    () => resolvePhones(normalized),
    () => resolveCreate(normalized),
    () => resolveDesigns(normalized),
    () => resolveCases(normalized),
    () => resolveCart(normalized),
  ];

  for (const resolve of resolvers) {
    const trail = resolve();
    if (trail) return trail;
  }

  const staticLabel = STATIC_PAGES[normalized];
  if (staticLabel) {
    return withHome(current(staticLabel));
  }

  return withHome();
}
