import ShopghabLoaderSvg from "@/app/components/ui/ShopghabLoaderSvg";

export default function DesignEditorLoading() {
  return (
    <div className="grid min-h-[42vh] place-items-center" role="status" aria-live="polite">
      <span className="sr-only">در حال بارگذاری…</span>
      <ShopghabLoaderSvg runId={0} />
    </div>
  );
}
