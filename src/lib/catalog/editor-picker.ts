export type EditorPickerSort = "featured" | "newest" | "title";

export type EditorPickerChild = {
  id: string;
  slug: string;
  name: string;
  count: number;
  /** This category and every category nested under it. */
  matchIds: string[];
};

export type EditorPickerCategory = {
  id: string;
  slug: string;
  name: string;
  count: number;
  matchIds: string[];
  children: EditorPickerChild[];
};

export type EditorPickerFilterOption = {
  id: string;
  label: string;
};

export type EditorPickerFilterGroup = {
  id: string;
  slug: string;
  label: string;
  options: EditorPickerFilterOption[];
};

export type EditorPickerDesign = {
  id: string;
  title: string;
  thumb: string;
  src: string;
  width: number;
  height: number;
  categoryIds: string[];
  attributeValueIds: string[];
  search: string;
  featured: boolean;
  sortOrder: number;
  publishedAt: string;
};

export type EditorDesignPicker = {
  categories: EditorPickerCategory[];
  groups: EditorPickerFilterGroup[];
  designs: EditorPickerDesign[];
};

export type EditorPickerFilters = {
  q?: string;
  categoryId?: string;
  childIds?: string[];
  attributeValueIds?: string[];
  sort?: EditorPickerSort;
};

export function filterEditorDesigns(
  picker: EditorDesignPicker,
  filters: EditorPickerFilters = {},
): EditorPickerDesign[] {
  const q = filters.q?.trim().toLowerCase() ?? "";
  const category = filters.categoryId
    ? picker.categories.find((item) => item.id === filters.categoryId)
    : undefined;
  const requestedChildren = new Set(filters.childIds ?? []);
  const children = category
    ? category.children.filter((child) => requestedChildren.has(child.id))
    : [];
  const categoryMatch = new Set<string>();
  if (children.length > 0) {
    for (const child of children) {
      for (const id of child.matchIds) categoryMatch.add(id);
    }
  } else if (category) {
    for (const id of category.matchIds) categoryMatch.add(id);
  }

  const optionGroup = new Map<string, string>();
  for (const group of picker.groups) {
    for (const option of group.options) optionGroup.set(option.id, group.id);
  }
  const selectedGroups = new Map<string, Set<string>>();
  for (const id of filters.attributeValueIds ?? []) {
    const groupId = optionGroup.get(id);
    if (!groupId) continue;
    const set = selectedGroups.get(groupId) ?? new Set<string>();
    set.add(id);
    selectedGroups.set(groupId, set);
  }

  const matched = picker.designs.filter((design) => {
    if (categoryMatch.size > 0 && !design.categoryIds.some((id) => categoryMatch.has(id))) {
      return false;
    }
    for (const ids of selectedGroups.values()) {
      if (!design.attributeValueIds.some((id) => ids.has(id))) return false;
    }
    if (q && !design.search.includes(q)) return false;
    return true;
  });

  const sort = filters.sort ?? "featured";
  const items = [...matched];
  if (sort === "title") {
    items.sort((a, b) => a.title.localeCompare(b.title, "fa"));
    return items;
  }
  if (sort === "newest") {
    items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return items;
  }
  items.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return b.publishedAt.localeCompare(a.publishedAt);
  });
  return items;
}
