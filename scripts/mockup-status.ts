import { projectMockupStatus } from "../src/lib/mockups/status";

async function main(): Promise<void> {
  const report = await projectMockupStatus();
  console.log(
    `Templates: ${report.templates.length} (${report.templates.filter((item) => item.enabled).length} enabled)`,
  );
  for (const template of report.templates) {
    console.log(
      `- ${template.id}: ${template.enabled ? "enabled" : "disabled"}${template.default && template.enabled ? ", default" : ""}`,
    );
  }
  console.log(
    `Designs with artwork: ${report.summary.designs}. Ready: ${report.summary.ready}. Missing: ${report.summary.missing}. Outdated: ${report.summary.outdated}. Errors: ${report.summary.errors}.`,
  );
  for (const issue of report.issues) {
    const template = issue.templateId ? ` / ${issue.templateId}` : "";
    console.log(`- ${issue.slug}${template}: ${issue.kind}: ${issue.error}`);
  }
}

main().catch(() => {
  console.error("Mockup status failed.");
  process.exit(1);
});
