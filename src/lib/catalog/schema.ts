import { z } from "zod";

import { selectProductImages } from "@/lib/mockups/display";

export const designStatusSchema = z.enum(["draft", "published", "archived"]);
export const categoryStatusSchema = z.enum(["active", "inactive", "archived"]);

export const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/, "اسلاگ فقط می‌تواند شامل حروف کوچک، عدد، خط تیره و زیرخط باشد");

const assetPathSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || (value.startsWith("/designed/") && !value.includes("..")),
    "مسیر تصویر باید داخل /designed/ باشد",
  );

export const mockupStatusSchema = z.enum(["ready", "error", "skipped"]);

export const mockupRecordSchema = z.object({
  templateId: z.string(),
  path: z.string(),
  thumbPath: z.string(),
  width: z.number(),
  height: z.number(),
  contentHash: z.string(),
  templateVersion: z.string(),
  generatedAt: z.string(),
  status: mockupStatusSchema,
  error: z.string(),
});

export const designRecordSchema = z.object({
  id: z.string().min(1),
  sourceKey: z.string(),
  legacySlug: z.string(),
  templateSlug: z.string(),
  imagePath: z.string(),
  thumbnailPath: z.string(),
  width: z.number(),
  height: z.number(),
  title: z.string(),
  titleEn: z.string(),
  slug: z.string(),
  shortDescription: z.string(),
  description: z.string(),
  categoryIds: z.array(z.string()),
  tags: z.array(z.string()),
  colors: z.array(z.string()),
  styles: z.array(z.string()),
  attributeValueIds: z.array(z.string()),
  collectionIds: z.array(z.string()),
  alt: z.string(),
  gallery: z.array(z.string()),
  mockups: z.array(mockupRecordSchema),
  seoTitle: z.string(),
  seoDescription: z.string(),
  ogImage: z.string(),
  status: designStatusSchema,
  featured: z.boolean(),
  sortOrder: z.number(),
  assetMissing: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
});

export const categoryRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  slug: z.string(),
  parentId: z.string().nullable(),
  description: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  coverImage: z.string(),
  status: categoryStatusSchema,
  sortOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const redirectRecordSchema = z.object({
  fromSlug: z.string(),
  toSlug: z.string(),
  designId: z.string(),
});

export const categoryRedirectSchema = z.object({
  fromSlug: z.string(),
  toSlug: z.string(),
  categoryId: z.string(),
});

export const attributeGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  slug: z.string(),
  sortOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const attributeValueSchema = z.object({
  id: z.string().min(1),
  groupId: z.string(),
  name: z.string(),
  sortOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const collectionRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  coverImage: z.string(),
  status: categoryStatusSchema,
  sortOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const catalogSchema = z.object({
  version: z.literal(1),
  categories: z.array(categoryRecordSchema),
  designs: z.array(designRecordSchema),
  redirects: z.array(redirectRecordSchema),
  categoryRedirects: z.array(categoryRedirectSchema),
  attributeGroups: z.array(attributeGroupSchema),
  attributeValues: z.array(attributeValueSchema),
  collections: z.array(collectionRecordSchema),
});

export const designWriteSchema = z.object({
  title: z.string().trim().min(1, "عنوان فارسی الزامی است").max(200),
  titleEn: z.string().trim().max(200),
  slug: slugSchema,
  shortDescription: z.string().trim().max(400),
  description: z.string().trim().max(8000),
  categoryIds: z.array(z.string().min(1)).max(80),
  attributeValueIds: z.array(z.string().min(1)).max(80).optional(),
  collectionIds: z.array(z.string().min(1)).max(40).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(40),
  colors: z.array(z.string().trim().min(1).max(40)).max(16),
  styles: z.array(z.string().trim().min(1).max(40)).max(16),
  alt: z.string().trim().max(300),
  imagePath: assetPathSchema,
  thumbnailPath: assetPathSchema,
  gallery: z.array(assetPathSchema).max(12),
  seoTitle: z.string().trim().max(200),
  seoDescription: z.string().trim().max(320),
  ogImage: assetPathSchema,
  status: designStatusSchema,
  featured: z.boolean(),
  sortOrder: z.number().int().min(0).max(1_000_000),
  templateSlug: z.string().trim().max(200),
});

export const designStatusPatchSchema = z
  .object({
    status: designStatusSchema,
  })
  .strict();

export const categoryWriteSchema = z.object({
  name: z.string().trim().min(1, "نام دسته الزامی است").max(80),
  slug: slugSchema,
  parentId: z.string().min(1).nullable(),
  description: z.string().trim().max(4000),
  seoTitle: z.string().trim().max(200),
  seoDescription: z.string().trim().max(320),
  coverImage: assetPathSchema,
  status: categoryStatusSchema,
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
});

export const categoryStatusPatchSchema = z
  .object({
    status: categoryStatusSchema,
  })
  .strict();

export const categoryReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.number().int().min(0).max(1_000_000),
      }),
    )
    .min(1)
    .max(500),
});

export const attributeCreateSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("group"),
    name: z.string().trim().min(1, "نام گروه الزامی است").max(80),
    slug: slugSchema,
    sortOrder: z.number().int().min(0).max(1_000_000).optional(),
  }),
  z.object({
    kind: z.literal("value"),
    groupId: z.string().min(1),
    name: z.string().trim().min(1, "نام ویژگی الزامی است").max(80),
    sortOrder: z.number().int().min(0).max(1_000_000).optional(),
  }),
]);

export const attributeUpdateSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("group"),
    id: z.string().min(1),
    name: z.string().trim().min(1, "نام گروه الزامی است").max(80),
    slug: slugSchema,
  }),
  z.object({
    kind: z.literal("value"),
    id: z.string().min(1),
    name: z.string().trim().min(1, "نام ویژگی الزامی است").max(80),
  }),
]);

export const attributeDeleteSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("group"),
    id: z.string().min(1),
  }),
  z.object({
    kind: z.literal("value"),
    id: z.string().min(1),
  }),
]);

export const collectionWriteSchema = z.object({
  name: z.string().trim().min(1, "نام کالکشن الزامی است").max(120),
  slug: slugSchema,
  description: z.string().trim().max(4000),
  seoTitle: z.string().trim().max(200),
  seoDescription: z.string().trim().max(320),
  coverImage: assetPathSchema,
  status: categoryStatusSchema,
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
});

export type DesignStatus = z.infer<typeof designStatusSchema>;
export type CategoryStatus = z.infer<typeof categoryStatusSchema>;
export type DesignRecord = z.infer<typeof designRecordSchema>;
export type CategoryRecord = z.infer<typeof categoryRecordSchema>;
export type RedirectRecord = z.infer<typeof redirectRecordSchema>;
export type CategoryRedirectRecord = z.infer<typeof categoryRedirectSchema>;
export type AttributeGroupRecord = z.infer<typeof attributeGroupSchema>;
export type AttributeValueRecord = z.infer<typeof attributeValueSchema>;
export type CollectionRecord = z.infer<typeof collectionRecordSchema>;
export type DesignCatalog = z.infer<typeof catalogSchema>;
export type DesignWriteInput = z.infer<typeof designWriteSchema>;
export type CategoryWriteInput = z.infer<typeof categoryWriteSchema>;
export type AttributeCreateInput = z.infer<typeof attributeCreateSchema>;
export type AttributeUpdateInput = z.infer<typeof attributeUpdateSchema>;
export type AttributeDeleteInput = z.infer<typeof attributeDeleteSchema>;
export type CollectionWriteInput = z.infer<typeof collectionWriteSchema>;

export type PublicDesign = {
  id: string;
  slug: string;
  templateSlug: string;
  title: string;
  titleEn: string;
  shortDescription: string;
  description: string;
  alt: string;
  imagePath: string;
  thumbnailPath: string;
  gallery: string[];
  frames: { src: string; thumb: string }[];
  tags: string[];
  colors: string[];
  styles: string[];
  categoryIds: string[];
  attributeValueIds: string[];
  collectionIds: string[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  publishedAt: string | null;
  updatedAt: string;
};

export function toPublicDesign(design: DesignRecord): PublicDesign {
  const images = selectProductImages(design);
  return {
    id: design.id,
    slug: design.slug,
    templateSlug: design.templateSlug,
    title: design.title,
    titleEn: design.titleEn,
    shortDescription: design.shortDescription,
    description: design.description,
    alt: images.alt,
    imagePath: images.hero,
    thumbnailPath: images.thumb,
    gallery: images.gallery,
    frames: images.frames,
    tags: design.tags,
    colors: design.colors,
    styles: design.styles,
    categoryIds: design.categoryIds,
    attributeValueIds: design.attributeValueIds,
    collectionIds: design.collectionIds,
    featured: design.featured,
    seoTitle: design.seoTitle,
    seoDescription: design.seoDescription,
    ogImage: design.ogImage,
    publishedAt: design.publishedAt,
    updatedAt: design.updatedAt,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/** Fills fields added after the first catalog file so older JSON still loads. */
export function parseCatalogDocument(raw: unknown): DesignCatalog {
  const doc = asRecord(raw) ?? {};
  const categories = Array.isArray(doc.categories)
    ? doc.categories.map((item) => {
        const category = asRecord(item) ?? {};
        return {
          ...category,
          sortOrder: typeof category.sortOrder === "number" ? category.sortOrder : 0,
        };
      })
    : [];
  const designs = Array.isArray(doc.designs)
    ? doc.designs.map((item) => {
        const design = asRecord(item) ?? {};
        return {
          ...design,
          attributeValueIds: Array.isArray(design.attributeValueIds) ? design.attributeValueIds : [],
          collectionIds: Array.isArray(design.collectionIds) ? design.collectionIds : [],
          mockups: Array.isArray(design.mockups) ? design.mockups : [],
        };
      })
    : [];

  return catalogSchema.parse({
    version: 1,
    categories,
    designs,
    redirects: Array.isArray(doc.redirects) ? doc.redirects : [],
    categoryRedirects: Array.isArray(doc.categoryRedirects) ? doc.categoryRedirects : [],
    attributeGroups: Array.isArray(doc.attributeGroups) ? doc.attributeGroups : [],
    attributeValues: Array.isArray(doc.attributeValues) ? doc.attributeValues : [],
    collections: Array.isArray(doc.collections) ? doc.collections : [],
  });
}
