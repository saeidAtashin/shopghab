<<<<<<< HEAD
import DesignRouteLoading from "@/app/components/ui/DesignRouteLoading";

export default function DesignEditorLoading() {
  return <DesignRouteLoading />;
=======
import ShopghabLoaderSvg from "@/app/components/ui/ShopghabLoaderSvg";

export default function DesignEditorLoading() {
  return (
    <div className="grid min-h-[42vh] place-items-center" role="status" aria-live="polite">
      <span className="sr-only">در حال بارگذاری…</span>
      <ShopghabLoaderSvg runId={0} />
    </div>
  );
>>>>>>> b30ecce6594f8307a08f0a3ffaf197ae58cec20f
}
