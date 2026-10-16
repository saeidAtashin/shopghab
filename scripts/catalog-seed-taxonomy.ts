import { mutateCatalog, readCatalog } from "../src/lib/catalog/store";
import { SEEDED_CATEGORY_COUNT, seedCatalogTaxonomy } from "../src/lib/catalog/taxonomy";

async function main(): Promise<void> {
  const created = await mutateCatalog((catalog) => {
    const seeded = seedCatalogTaxonomy(catalog);
    return { catalog: seeded.catalog, result: seeded.created };
  });

  const catalog = readCatalog();
  console.log(`Taxonomy seed created ${created} records.`);
  console.log(`Categories: ${catalog.categories.length} (seed defines ${SEEDED_CATEGORY_COUNT} plus any existing folders)`);
  console.log(`Attribute groups: ${catalog.attributeGroups.length}`);
  console.log(`Attribute values: ${catalog.attributeValues.length}`);
  console.log(`Collections: ${catalog.collections.length}`);
  console.log(`Designs preserved: ${catalog.designs.length}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
