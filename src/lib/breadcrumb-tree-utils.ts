import { services } from "@/app/data/services";
import type { BranchNode } from "./breadcrumb-tree-data";
import { siteBreadcrumbTree } from "./breadcrumb-tree-data";
import type { BreadcrumbItem } from "./seo/breadcrumbs";

export function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  const withoutQuery = path.split("?")[0] ?? path;
  return withoutQuery.replace(/\/+$/, "") || "/";
}

/** Path including allowed query keys (e.g. repair console filter). */
export function pathForBreadcrumbMatch(path: string) {
  if (!path.includes("?")) return normalizePath(path);
  const [pathname, query] = path.split("?");
  if (!pathname.startsWith("/repair") || !query) return normalizePath(path);
  const params = new URLSearchParams(query);
  const console = params.get("console")?.trim();
  if (console) return `/repair?console=${console}`;
  return normalizePath(path);
}

type TrailMatch = {
  trail: BranchNode[];
  indices: number[];
};

function findTrail(
  node: BranchNode,
  targetPath: string,
  trail: BranchNode[] = [],
  indices: number[] = [],
): TrailMatch | null {
  const path = pathForBreadcrumbMatch(targetPath);
  const href = node.href ? pathForBreadcrumbMatch(node.href) : undefined;
  const nextTrail = [...trail, node];
  const nextIndices = [...indices];

  if (href === path) {
    return { trail: nextTrail, indices: nextIndices };
  }

  const children = node.children ?? [];
  for (let i = 0; i < children.length; i++) {
    const found = findTrail(children[i], targetPath, nextTrail, [
      ...nextIndices,
      i,
    ]);
    if (found) return found;
  }

  return null;
}

/** Linear breadcrumb items for JSON-LD and meta. */
export function breadcrumbTrailFromPath(path: string): BreadcrumbItem[] {
  const matchPath = pathForBreadcrumbMatch(path);
  const normalized = normalizePath(path);
  if (normalized === "/") {
    return [{ label: "خانه", href: "/" }];
  }

  const match = findTrail(siteBreadcrumbTree, matchPath);
  if (!match) {
    if (normalized.startsWith("/services/")) {
      const slug = normalized.split("/").filter(Boolean)[1];
      const service = services.find((s) => s.slug === slug);
      if (service) {
        return [
          { label: "خانه", href: "/" },
          { label: "همه خدمات", href: "/services" },
          { label: service.title },
        ];
      }
    }
    return [{ label: "خانه", href: "/" }];
  }

  return match.trail.map((node, index) => {
    const isLast = index === match.trail.length - 1;
    return {
      label: node.title,
      href: isLast ? undefined : node.href,
    };
  });
}

/** Subtree: ancestors narrowed to active branch; current level keeps all siblings. */
export function getFocusedTree(path: string): BranchNode {
  const matchPath = pathForBreadcrumbMatch(path);
  if (matchPath === "/") return siteBreadcrumbTree;

  const match = findTrail(siteBreadcrumbTree, matchPath);
  if (!match) return siteBreadcrumbTree;

  const { indices } = match;

  function narrow(node: BranchNode, depth: number): BranchNode {
    if (depth >= indices.length - 1) {
      return {
        ...node,
        children: node.children?.map((child) => ({ ...child })),
      };
    }

    const childIndex = indices[depth + 1];
    const child = node.children?.[childIndex];
    if (!child) return node;

    return {
      ...node,
      children: [narrow(child, depth + 1)],
    };
  }

  return narrow(siteBreadcrumbTree, 0);
}

export function hasTreePath(path: string) {
  const matchPath = pathForBreadcrumbMatch(path);
  if (matchPath === "/") return true;
  return findTrail(siteBreadcrumbTree, matchPath) !== null;
}

export type TrailCrumb = {
  node: BranchNode;
  siblings: BranchNode[];
  children: BranchNode[];
  isCurrent: boolean;
};

function homeTrailCrumbs(): TrailCrumb[] {
  return [
    {
      node: siteBreadcrumbTree,
      siblings: [],
      children: siteBreadcrumbTree.children ?? [],
      isCurrent: true,
    },
  ];
}

function fallbackTrailCrumbs(path: string): TrailCrumb[] | null {
  if (!path.startsWith("/services/")) return null;

  const slug = path.split("/").filter(Boolean)[1];
  const service = services.find((s) => s.slug === slug);
  if (!service) return null;

  const servicesNode: BranchNode = {
    title: "همه خدمات",
    href: "/services",
  };

  const serviceNode: BranchNode = {
    title: service.title,
    href: path,
  };

  return [
    {
      node: siteBreadcrumbTree,
      siblings: [],
      children: siteBreadcrumbTree.children ?? [],
      isCurrent: false,
    },
    {
      node: servicesNode,
      siblings: (siteBreadcrumbTree.children ?? []).filter(
        (c) => c.href !== "/services",
      ),
      children: services
        .filter((s) => s.slug !== slug)
        .map((s) => ({
          title: s.title,
          href: `/services/${s.slug}`,
        })),
      isCurrent: false,
    },
    {
      node: serviceNode,
      siblings: services
        .filter((s) => s.slug !== slug)
        .map((s) => ({
          title: s.title,
          href: `/services/${s.slug}`,
        })),
      children: [],
      isCurrent: true,
    },
  ];
}

/** Linear trail with siblings & children for branch menus. */
export function getTrailCrumbs(path: string): TrailCrumb[] {
  const matchPath = pathForBreadcrumbMatch(path);
  if (matchPath === "/") return homeTrailCrumbs();

  const match = findTrail(siteBreadcrumbTree, matchPath);
  if (!match) {
    const normalized = normalizePath(path);
    return fallbackTrailCrumbs(normalized) ?? homeTrailCrumbs();
  }

  const { trail, indices } = match;
  const parentChildren = siteBreadcrumbTree.children ?? [];

  return trail.map((node, i) => {
    const parent = i > 0 ? trail[i - 1] : siteBreadcrumbTree;
    const parentList = i > 0 ? (parent.children ?? []) : parentChildren;
    const siblingIndex = i > 0 ? indices[i - 1] : -1;

    const siblings =
      i === 0 ? [] : parentList.filter((_, idx) => idx !== siblingIndex);

    return {
      node,
      siblings,
      children: node.children ?? [],
      isCurrent: i === trail.length - 1,
    };
  });
}

export function nodeHasBranches(crumb: TrailCrumb) {
  return crumb.siblings.length > 0 || crumb.children.length > 0;
}
