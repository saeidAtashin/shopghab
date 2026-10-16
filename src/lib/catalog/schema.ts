import { z } from "zod";

export const designStatusSchema = z.enum(["draft", "published", "archived"]);
export const categoryStatusSchema = z.enum(["active", "archived"]);

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
  alt: z.string(),
  gallery: z.array(z.string()),
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
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const redirectRecordSchema = z.object({
  fromSlug: z.string(),
  toSlug: z.string(),
  designId: z.string(),
});

export const catalogSchema = z.object({
  version: z.literal(1),
  categories: z.array(categoryRecordSchema),
  designs: z.array(designRecordSchema),
  redirects: z.array(redirectRecordSchema),
});

export const designWriteSchema = z.object({
  title: z.string().trim().min(1, "عنوان فارسی الزامی است").max(200),
  titleEn: z.string().trim().max(200),
  slug: slugSchema,
  shortDescription: z.string().trim().max(400),
  description: z.string().trim().max(8000),
  categoryIds: z.array(z.string().min(1)).max(40),
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
});

export type DesignStatus = z.infer<typeof designStatusSchema>;
export type CategoryStatus = z.infer<typeof categoryStatusSchema>;
export type DesignRecord = z.infer<typeof designRecordSchema>;
export type CategoryRecord = z.infer<typeof categoryRecordSchema>;
export type RedirectRecord = z.infer<typeof redirectRecordSchema>;
export type DesignCatalog = z.infer<typeof catalogSchema>;
export type DesignWriteInput = z.infer<typeof designWriteSchema>;
export type CategoryWriteInput = z.infer<typeof categoryWriteSchema>;

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
  tags: string[];
  colors: string[];
  styles: string[];
  categoryIds: string[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  publishedAt: string | null;
  updatedAt: string;
};

export function toPublicDesign(design: DesignRecord): PublicDesign {
  return {
    id: design.id,
    slug: design.slug,
    templateSlug: design.templateSlug,
    title: design.title,
    titleEn: design.titleEn,
    shortDescription: design.shortDescription,
    description: design.description,
    alt: design.alt,
    imagePath: design.imagePath,
    thumbnailPath: design.thumbnailPath,
    gallery: design.gallery,
    tags: design.tags,
    colors: design.colors,
    styles: design.styles,
    categoryIds: design.categoryIds,
    featured: design.featured,
    seoTitle: design.seoTitle,
    seoDescription: design.seoDescription,
    ogImage: design.ogImage,
    publishedAt: design.publishedAt,
    updatedAt: design.updatedAt,
  };
}
