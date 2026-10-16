import { generateMockupsForDesigns } from "../src/lib/mockups/generate";

function argument(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((item) => item.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

async function main(): Promise<void> {
  const design = argument("design");
  const all = process.argv.includes("--all");
  if (!design && !all) {
    console.error("Usage: npm run mockups:generate -- --design=<slug>");
    console.error("       npm run mockups:generate -- --all");
    process.exit(1);
  }

  const report = await generateMockupsForDesigns(all ? { all: true } : { slugs: [design ?? ""] });
  console.log(
    `Mockups: ${report.designs} design(s), ${report.ready} written, ${report.reused} reused, ${report.errors} error(s), ${report.skippedTemplates} disabled template(s).`,
  );
}

main().catch(() => {
  console.error("Mockup generation failed.");
  process.exit(1);
});
