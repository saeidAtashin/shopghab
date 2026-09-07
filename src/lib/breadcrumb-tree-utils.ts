import type { BranchNode } from "./breadcrumb-tree-data";
import { siteBreadcrumbTree } from "./breadcrumb-tree-data";
import type { BreadcrumbItem } from "./seo/breadcrumbs";

export function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  const withoutQuery = path.split("?")[0] ?? path;
  return withoutQuery.replace(/\/+$/, "") || "/";
}

export function pathForBreadcrumbMatch(path: string) {
  return normalizePath(path.split("?")[0] ?? path);
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

/** Linear trail with siblings & children for branch menus. */
export function getTrailCrumbs(path: string): TrailCrumb[] {
  const matchPath = pathForBreadcrumbMatch(path);
  if (matchPath === "/") return homeTrailCrumbs();

  const match = findTrail(siteBreadcrumbTree, matchPath);
  if (!match) return homeTrailCrumbs();

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
