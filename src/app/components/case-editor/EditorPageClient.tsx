"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Undo2,
  Redo2,
  Eye,
  Save,
  LogOut,
  ShoppingCart,
  Type,
  Sticker,
  Upload,
  FileText,
  Layers,
  Sparkles,
  HelpCircle,
  GraduationCap,
  AlertTriangle,
  ChevronDown,
  Info,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import type Konva from "konva";

import PhoneVerificationModal from "@/app/components/auth/PhoneVerificationModal";
import {
  EditorGuestGateProvider,
  GUEST_EDIT_MESSAGE,
  GuestEditNotice,
} from "@/app/components/case-editor/EditorGuestGate";
import WizardBreadcrumb from "@/app/components/case-wizard/WizardBreadcrumb";
import DockableAction from "@/app/components/ui/DockableAction";
import TextPanel from "@/app/components/case-editor/TextPanel";
import UploadPanel from "@/app/components/case-editor/UploadPanel";
import DescriptionPanel from "@/app/components/case-editor/DescriptionPanel";
import LayersPanel from "@/app/components/case-editor/LayersPanel";
import PreviewModal from "@/app/components/case-editor/PreviewModal";
import SaveImageModal from "@/app/components/case-editor/SaveImageModal";
import EditorGuideOverlay from "@/app/components/case-editor/EditorGuideOverlay";
import CaseDesignerLoader from "@/app/components/case-loading/CaseDesignerLoader";
import { useAuth } from "@/app/context/AuthContext";
import { useShopCart } from "@/app/context/ShopCartContext";
import {
  getBrandBySlug,
  getCaseTypeBySlug,
  getCaseTotalPrice,
  getModelBySlug,
} from "@/lib/cases";
import type { EditorDesignPicker } from "@/lib/catalog/editor-picker";
import { getCaseTemplateBySlug } from "@/lib/cases/templates.static";
import { getReadyCaseBySlug } from "@/lib/cases/ready.static";
import { getDesign, getDesignByShareToken } from "@/lib/design/api";
import { useEditorStore } from "@/lib/design/editor-store";
import { ensureCatalogCookie } from "@/lib/auth-api";
import { saveDesign } from "@/lib/design/api";
import { dataUrlToFile, exportStageToPng } from "@/lib/design/export";
import {
  SHORTCUT_HELP,
  useEditorShortcuts,
} from "@/lib/design/use-editor-shortcuts";
import {
  DEFAULT_EDITOR_FONT,
  loadEditorFonts,
  normalizeFontFamily,
} from "@/lib/design/editor-fonts";
import { useCanvasDisplaySize } from "@/lib/design/use-canvas-display-size";
import { useMediaQuery } from "@/lib/design/use-media-query";
import { lockPageScroll } from "@/lib/scroll-lock";
import { formatToman } from "@/lib/shop/format";
import {
  getVisibleCartRect,
  prefersReducedMotion,
  toRectLike,
} from "@/lib/shop/fly-to-cart";
import {
  hasSeenEditorGuide,
  markEditorGuideSeen,
} from "@/lib/design/editor-guide-storage";

const CaseCanvas = dynamic(() => import("@/app/components/case-editor/CaseCanvas"), {
  ssr: false,
});

const DesignPickerPanel = dynamic(() => import("@/app/components/case-editor/DesignPickerPanel"), {
  ssr: false,
  loading: () => <PanelLoading />,
});

const DesignForYouPanel = dynamic(
  () => import("@/app/components/case-editor/DesignForYouPanel"),
  {
    ssr: false,
    loading: () => <PanelLoading />,
  },
);

export type EditorTab =
  | "layers"
  | "text"
  | "stickers"
  | "upload"
  | "design-for-you"
  | "description";

export type ForkArtwork = {
  designId: string;
  src: string;
  width: number;
  height: number;
  name: string;
};

type Props = {
  brandSlug: string;
  modelSlug: string;
  caseTypeSlug: string;
  initialDesignId?: string;
  initialShareToken?: string;
  initialTemplateSlug?: string;
  initialTab?: EditorTab;
  forkArtwork?: ForkArtwork;
  designPicker: EditorDesignPicker;
};

function PanelLoading() {
  return (
    <div className="flex items-center justify-center py-8 text-xs text-muted">
      در حال بارگذاری…
    </div>
  );
}

export default function EditorPageClient({
  brandSlug,
  modelSlug,
  caseTypeSlug,
  initialDesignId,
  initialShareToken,
  initialTemplateSlug,
  initialTab,
  forkArtwork,
  designPicker,
}: Props) {
  const brand = getBrandBySlug(brandSlug)!;
  const model = getModelBySlug(brandSlug, modelSlug)!;
  const caseType = getCaseTypeBySlug(caseTypeSlug)!;

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addCustomCase, startFlyToCart } = useShopCart();
  const stageRef = useRef<Konva.Stage | null>(null);
  const loadedRef = useRef(false);
  const guideCheckedRef = useRef(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const requireAccountRef = useRef<(action: () => void) => void>((action) => {
    action();
  });
  const guardEdit = useCallback((action: () => void) => {
    requireAccountRef.current(action);
  }, []);

  const isSplitLayout = useMediaQuery("(min-width: 768px)");
  const isMobileViewport = isSplitLayout !== true;
  const canvasDisplaySize = useCanvasDisplaySize(
    canvasContainerRef,
    true,
    isSplitLayout === true ? "desktop" : "mobile",
    { width: model.canvasWidth, height: model.canvasHeight },
  );

  const init = useEditorStore((s) => s.init);
  const loadDocument = useEditorStore((s) => s.loadDocument);
  const loadTemplate = useEditorStore((s) => s.loadTemplate);
  const addDesignImage = useEditorStore((s) => s.addDesignImage);
  const document = useEditorStore((s) => s.document);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const setPreviewMode = useEditorStore((s) => s.setPreviewMode);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const [, setFontsTick] = useState(0);

  useEditorShortcuts(guardEdit);

  useEffect(() => {
    const families = new Set<string>([DEFAULT_EDITOR_FONT]);
    for (const layer of document.layers) {
      if (layer.type === "text") {
        families.add(normalizeFontFamily(layer.fontFamily));
      }
    }
    void loadEditorFonts([...families]).then(() => {
      setFontsTick((tick) => tick + 1);
    });
  }, [document.layers]);

  useEffect(() => {
    if (!isMobileViewport) return;
    return lockPageScroll();
  }, [isMobileViewport]);

  const [activeTab, setActiveTab] = useState<EditorTab>(initialTab ?? "text");
  const [loadedTabs, setLoadedTabs] = useState<Set<EditorTab>>(
    () => new Set([initialTab ?? "text"]),
  );
  const [showPreview, setShowPreview] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [warningExpanded, setWarningExpanded] = useState(false);
  const [mobileDockCollapsed, setMobileDockCollapsed] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [buyBusy, setBuyBusy] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [guestNotice, setGuestNotice] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [showEditorGuide, setShowEditorGuide] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    setLoadedTabs((prev) => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  const handleCanvasReady = useCallback(() => {
    setCanvasReady(true);
  }, []);

  const previewReady = editorReady && canvasReady;

  useEffect(() => {
    if (!previewReady || guideCheckedRef.current) return;
    guideCheckedRef.current = true;

    const timer = window.setTimeout(() => {
      if (!hasSeenEditorGuide()) {
        setShowEditorGuide(true);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [previewReady]);

  useEffect(() => {
    if (!showEditorGuide) return;
    setGuestNotice(null);
  }, [showEditorGuide]);

  const requireAccount = useCallback(
    (action: () => void) => {
      if (authLoading || !previewReady || showEditorGuide) return;
      if (!user) {
        setGuestNotice(GUEST_EDIT_MESSAGE);
        return;
      }
      action();
    },
    [authLoading, previewReady, showEditorGuide, user],
  );
  requireAccountRef.current = requireAccount;

  const promptPhoneLogin = useCallback(
    (text: string) => {
      if (authLoading || !previewReady || showEditorGuide) return;
      setGuestNotice(text);
    },
    [authLoading, previewReady, showEditorGuide],
  );

  useEffect(() => {
    if (loadedRef.current) return;
    if (initialDesignId && authLoading) return;

    async function bootstrap() {
      const meta = {
        brandSlug,
        modelSlug,
        caseTypeSlug,
        caseType,
        model,
        canvasWidth: model.canvasWidth,
        canvasHeight: model.canvasHeight,
      };

      if (initialDesignId) {
        const saved = await getDesign(initialDesignId);
        if (saved) {
          loadDocument(saved, meta);
          loadedRef.current = true;
          setEditorReady(true);
          return;
        }
      }
      if (initialShareToken) {
        const shared = await getDesignByShareToken(initialShareToken);
        if (shared) {
          loadDocument(shared, meta);
          loadedRef.current = true;
          setEditorReady(true);
          return;
        }
      }
      init(meta);
      loadedRef.current = true;
      setEditorReady(true);

      if (forkArtwork) {
        addDesignImage(forkArtwork.src, forkArtwork.width, forkArtwork.height, forkArtwork.name);
        return;
      }

      if (initialTemplateSlug) {
        const template = getCaseTemplateBySlug(initialTemplateSlug);
        if (template) {
          loadTemplate(template, true);
        } else {
          const readyCase = getReadyCaseBySlug(initialTemplateSlug);
          if (readyCase?.template) {
            loadTemplate(
              {
                id: readyCase.id,
                slug: readyCase.slug,
                title: readyCase.title,
                description: readyCase.description,
                thumbnail: readyCase.image,
                tags: readyCase.tags,
                referenceCanvas: {
                  width: model.canvasWidth,
                  height: model.canvasHeight,
                },
                layers: readyCase.template.layers,
              },
              true,
            );
          }
        }
      }
    }

    void bootstrap();
  }, [
    brandSlug,
    modelSlug,
    caseTypeSlug,
    initialDesignId,
    initialShareToken,
    initialTemplateSlug,
    forkArtwork,
    init,
    loadDocument,
    loadTemplate,
    addDesignImage,
    caseType,
    model,
    authLoading,
  ]);

  const handleSaveAsCatalogDesign = useCallback(async () => {
    if (!forkArtwork || user?.role !== "admin") return;
    const stage = stageRef.current;
    if (!stage) {
      setMessage("بوم طراحی هنوز آماده نیست.");
      return;
    }
    setSavingCatalog(true);
    setMessage(null);
    let savedAdminPath = "";
    try {
      const allowed = await ensureCatalogCookie();
      if (!allowed) throw new Error("نشست ادمین برقرار نشد");
      const dataUrl = await exportStageToPng(stage, 2);
      const file = dataUrlToFile(dataUrl, "design.png", "image/png");
      const body = new FormData();
      body.set("sourceId", forkArtwork.designId);
      body.set("image", file);
      const response = await fetch("/api/admin/catalog/designs/from-editor", {
        method: "POST",
        credentials: "include",
        body,
      });
      const payload = (await response.json().catch(() => ({}))) as {
        designId?: string;
        slug?: string;
        adminPath?: string;
        templates?: { templateId: string; name: string }[];
        error?: string;
      };
      if (response.status === 413) throw new Error("حجم تصویر برای سرور زیاد است");
      if (!response.ok) throw new Error(payload.error || "ذخیره طرح جدید انجام نشد");
      if (!payload.designId || !payload.adminPath) throw new Error("ذخیره طرح جدید انجام نشد");
      savedAdminPath = payload.adminPath;

      const templates = payload.templates ?? [];
      if (templates.length === 0) {
        setMessage("طرح ذخیره شد اما موکاپ آماده نیست.");
        router.push(payload.adminPath);
        return;
      }

      const failed: string[] = [];
      for (let index = 0; index < templates.length; index += 1) {
        const template = templates[index];
        if (!template) continue;
        setMessage(`در حال ساخت موکاپ ${index + 1} از ${templates.length}…`);
        const allowed = await ensureCatalogCookie();
        if (!allowed) throw new Error("نشست ادمین برقرار نشد");
        const rendered = await fetch(`/api/admin/catalog/designs/${payload.designId}/placement`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId: template.templateId,
            focalX: 0.5,
            focalY: 0.5,
            zoom: 1,
          }),
        });
        if (!rendered.ok) {
          const reason = (await rendered.json().catch(() => ({}))) as { error?: string };
          failed.push(reason.error || template.name);
        }
      }

      const ready = templates.length - failed.length;
      if (ready > 0) {
        const published = await fetch(`/api/admin/catalog/designs/${payload.designId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "published" }),
        });
        if (!published.ok) {
          const reason = (await published.json().catch(() => ({}))) as { error?: string };
          throw new Error(reason.error || "طرح ذخیره شد اما منتشر نشد");
        }
      }

      if (failed.length === 0 && payload.slug) {
        router.push(`/designs/${payload.slug}`);
        return;
      }
      setMessage(
        ready > 0
          ? `برخی موکاپ‌ها ساخته نشد: ${failed.join("، ")}`
          : "موکاپ ساخته نشد. طرح به صورت پیش‌نویس ذخیره شد.",
      );
      router.push(payload.adminPath);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره طرح جدید انجام نشد");
      if (savedAdminPath) router.push(savedAdminPath);
    } finally {
      setSavingCatalog(false);
    }
  }, [forkArtwork, router, user?.role]);

  const handleSaveToAccount = useCallback(async () => {
    if (!user) {
      promptPhoneLogin("برای ذخیره طراحی ابتدا وارد شوید.");
      throw new Error("auth");
    }
    setSaving(true);
    setMessage(null);
    try {
      const saved = await saveDesign(document);
      setShareUrl(`${window.location.origin}/share/${saved.shareToken}`);
      setMessage("طراحی ذخیره شد.");
    } catch {
      setMessage("خطا در ذخیره طراحی.");
      throw new Error("save");
    } finally {
      setSaving(false);
    }
  }, [user, document, promptPhoneLogin]);

  const requestExit = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  const confirmExit = useCallback(() => {
    setShowExitConfirm(false);
    router.push(`/phones/${brandSlug}/${modelSlug}`);
  }, [brandSlug, modelSlug, router]);

  const handleCanvasBackdropPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) selectLayer(null);
    },
    [selectLayer],
  );

  const handleBuy = useCallback(async () => {
    if (buyBusy) return;
    if (!user) {
      promptPhoneLogin("برای خرید ابتدا وارد شوید.");
      return;
    }
    setBuyBusy(true);
    setMessage(null);
    try {
      const reduce = prefersReducedMotion();
      if (!reduce) {
        setAnalyzing(true);
        await new Promise((resolve) => window.setTimeout(resolve, 1100));
        setAnalyzing(false);
      }

      const saved = await saveDesign(document);
      let previewUrl = saved.previewUrl ?? "";
      if (stageRef.current) {
        previewUrl = await exportStageToPng(stageRef.current, 2);
      }
      const price = getCaseTotalPrice(caseType, true);
      const payload = {
        designId: saved.id,
        previewUrl,
        unitPrice: price,
        title: document.name || `قاب ${model.name}`,
        brandSlug,
        modelSlug,
        caseTypeSlug,
        description: document.description,
      };

      const container = stageRef.current?.container();
      const fromRect = container
        ? toRectLike(container.getBoundingClientRect())
        : null;
      const canFly =
        !reduce &&
        Boolean(previewUrl) &&
        Boolean(fromRect && fromRect.width > 0) &&
        Boolean(getVisibleCartRect());

      addCustomCase(payload, { deferPrompt: canFly });
      if (canFly && fromRect && previewUrl) {
        await startFlyToCart({ image: previewUrl, fromRect });
      }
    } catch {
      setMessage("افزودن به سبد ناموفق بود.");
      setAnalyzing(false);
    } finally {
      setBuyBusy(false);
    }
  }, [
    buyBusy,
    document,
    caseType,
    model,
    addCustomCase,
    startFlyToCart,
    brandSlug,
    modelSlug,
    caseTypeSlug,
    user,
    promptPhoneLogin,
  ]);

  const tabs: { id: EditorTab; label: string; icon: React.ReactNode }[] = [
    { id: "layers", label: "لایه‌ها", icon: <Layers size={16} /> },
    { id: "text", label: "متن", icon: <Type size={16} /> },
    { id: "stickers", label: "طرح", icon: <Sticker size={16} /> },
    { id: "upload", label: "تصویر", icon: <Upload size={16} /> },
    { id: "design-for-you", label: "طراحی برای شما", icon: <Sparkles size={16} /> },
    { id: "description", label: "توضیحات", icon: <FileText size={16} /> },
  ];

  const handleMobileTabChange = useCallback(
    (tab: EditorTab) => {
      setActiveTab(tab);
      if (mobileDockCollapsed) setMobileDockCollapsed(false);
    },
    [mobileDockCollapsed],
  );

  const handleGuideTabChange = useCallback((tab: EditorTab) => {
    setActiveTab(tab);
  }, []);

  const handleEnsureMobileDockOpen = useCallback(() => {
    setMobileDockCollapsed(false);
  }, []);

  const handleGuideComplete = useCallback(() => {
    markEditorGuideSeen();
  }, []);

  const handleOpenEditorGuide = useCallback(() => {
    setShowShortcuts(false);
    setShowEditorGuide(true);
  }, []);

  const sidePanelProps = {
    tabs,
    activeTab,
    onTabChange: setActiveTab,
    designPicker,
    brandSlug,
    modelSlug,
    caseTypeSlug,
    modelName: model.name,
    loadedTabs,
  };

  const canvasStage = (
    <div className="relative mx-auto w-fit">
      <div
        className="pointer-events-none absolute inset-x-6 top-1/2 h-24 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-3xl animate-preview-glow motion-reduce:animate-none"
        aria-hidden
      />
      <CaseCanvas
        caseColor={caseType.color}
        caseMaterial={caseType.material}
        onStageRef={(stage) => {
          stageRef.current = stage;
        }}
        onReady={handleCanvasReady}
        displayMaxWidth={canvasDisplaySize.width}
        displayMaxHeight={canvasDisplaySize.height}
        mobileTouchMode={isMobileViewport}
      />
      {analyzing ? (
        <div
          className="absolute inset-0 z-30 overflow-hidden rounded-[2rem] bg-black/55"
          aria-live="polite"
        >
          <div
            className="pointer-events-none absolute inset-x-0 h-28 animate-print-analyze-scan"
            aria-hidden
          >
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/0 via-cyan-300/55 to-cyan-400/0" />
            <div className="absolute inset-x-3 top-1/2 h-[2px] -translate-y-1/2 bg-white shadow-[0_0_18px_6px_rgba(103,232,249,0.95)]" />
          </div>
          <div className="absolute inset-x-0 bottom-4 flex justify-center">
            <p className="rounded-full border border-cyan-300/50 bg-black/70 px-3 py-1.5 text-[11px] font-bold text-cyan-50">
              در حال بررسی چاپ
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );

  const editorModals = (
    <AnimatePresence>
      {showPreview ? (
        <PreviewModal
          key="case-preview"
          caseColor={caseType.color}
          caseMaterial={caseType.material}
          onClose={() => {
            setShowPreview(false);
            setPreviewMode(false);
          }}
        />
      ) : null}
      {showSaveModal ? (
        <SaveImageModal
          key="save-image"
          stage={stageRef.current}
          brandSlug={brandSlug}
          modelSlug={modelSlug}
          loggedIn={Boolean(user)}
          savingAccount={saving}
          onSaveToAccount={handleSaveToAccount}
          onClose={() => setShowSaveModal(false)}
        />
      ) : null}
      {showEditorGuide ? (
        <EditorGuideOverlay
          key="editor-guide"
          open={showEditorGuide}
          onClose={() => setShowEditorGuide(false)}
          onComplete={handleGuideComplete}
          onTabChange={handleGuideTabChange}
          onEnsureMobileDockOpen={handleEnsureMobileDockOpen}
          isMobileViewport={isMobileViewport}
        />
      ) : null}
      {showExitConfirm ? (
        <div
          key="exit-confirm"
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="editor-exit-title"
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="editor-exit-title" className="text-base font-bold text-foreground">
              از ویرایشگر خارج می‌شوید؟
            </h2>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="min-h-11 flex-1 rounded-xl border border-border px-4 text-sm font-bold text-foreground"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={confirmExit}
                className="min-h-11 flex-1 rounded-xl bg-cyan-500 px-4 text-sm font-bold text-black"
              >
                خروج
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  );

  const accountPrompt = (
    <>
      <GuestEditNotice
        message={previewReady && !showEditorGuide ? guestNotice : null}
        onDismiss={() => setGuestNotice(null)}
        onLogin={() => {
          setGuestNotice(null);
          setLoginOpen(true);
        }}
      />
      <PhoneVerificationModal
        open={loginOpen}
        phone=""
        description={GUEST_EDIT_MESSAGE}
        onClose={() => setLoginOpen(false)}
        onVerified={() => {
          setLoginOpen(false);
          setGuestNotice(null);
        }}
      />
    </>
  );

  const designerLoader = <CaseDesignerLoader previewReady={previewReady} />;

  if (isMobileViewport) {
    return (
      <EditorGuestGateProvider requireAccount={requireAccount}>
      <>
      {designerLoader}
      <div className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 flex flex-col overflow-hidden overscroll-none bg-background">
        <div
          data-editor-guide="toolbar"
          className="flex shrink-0 flex-wrap items-center gap-1 border-b border-border px-1.5 py-1.5"
        >
          <MobileIconButton
            onClick={requestExit}
            icon={<LogOut size={15} />}
            label="خروج"
          />

          <div className="relative">
            <MobileIconButton
              onClick={() => setWarningExpanded((v) => !v)}
              icon={<Info size={15} />}
              label="توجه"
            />
            {warningExpanded ? (
              <div className="absolute right-0 top-full z-50 mt-1 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-amber-500/30 bg-card p-3 shadow-xl">
                <p className="text-xs leading-relaxed text-amber-100/90">
                  تفاوت طراحی و قاب اصلی را چشم‌پوشی کنید. قبل از طراحی و ارسال، هماهنگی
                  بابت تایید طراحی با شما انجام خواهد شد.
                </p>
              </div>
            ) : null}
          </div>

          <MobileIconButton
            onClick={undo}
            disabled={!canUndo()}
            icon={<Undo2 size={15} />}
            label="بازگشت"
          />
          <MobileIconButton
            onClick={redo}
            disabled={!canRedo()}
            icon={<Redo2 size={15} />}
            label="جلو"
          />
          <MobileIconButton
            onClick={() => {
              setPreviewMode(true);
              setShowPreview(true);
            }}
            icon={<Eye size={15} />}
            label="پیش‌نمایش"
          />
          <MobileIconButton
            onClick={() => setShowSaveModal(true)}
            icon={<Save size={15} />}
            label="ذخیره"
          />
          {user?.role === "admin" && forkArtwork ? (
            <MobileIconButton
              onClick={() => void handleSaveAsCatalogDesign()}
              disabled={savingCatalog}
              icon={<Save size={15} />}
              label={savingCatalog ? "در حال ذخیره" : "طرح جدید"}
            />
          ) : null}
          <MobileIconButton
            onClick={handleOpenEditorGuide}
            icon={<GraduationCap size={15} />}
            label="راهنما"
          />

          <DockableAction className="ms-auto shrink-0">
            <EditorBuyButton
              busy={buyBusy}
              price={formatToman(getCaseTotalPrice(caseType, true))}
              onClick={() => void handleBuy()}
              compact
            />
          </DockableAction>
        </div>

        <div className="relative min-h-0 flex-1">
          {message ? (
            <p className="pointer-events-none absolute inset-x-3 top-2 z-20 rounded-lg border border-cyan-500/30 bg-background/90 px-3 py-1.5 text-xs text-cyan-300 shadow-lg backdrop-blur-sm">
              {message}
            </p>
          ) : null}
          <div
            ref={canvasContainerRef}
            data-editor-guide="canvas"
            onPointerDown={handleCanvasBackdropPointerDown}
            className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,rgba(34,211,238,0.12),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(139,92,246,0.1),transparent_50%)] bg-card/40 p-2"
          >
            {canvasStage}
          </div>
          {!mobileDockCollapsed ? (
            <button
              type="button"
              className="absolute inset-0 z-10 bg-black/35"
              aria-label="بستن ابزارها"
              onClick={() => setMobileDockCollapsed(true)}
            />
          ) : null}
        </div>

        <div
          data-editor-guide="mobile-dock"
          className="relative z-40 shrink-0 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]"
        >
          {!mobileDockCollapsed ? (
            <div
              className={`absolute inset-x-0 bottom-full z-20 flex flex-col overflow-hidden rounded-t-2xl border border-b-0 border-border bg-background shadow-[0_-12px_32px_rgba(0,0,0,0.4)] ${
                activeTab === "stickers"
                  ? "h-[min(72dvh,560px)]"
                  : "max-h-[min(42dvh,320px)]"
              }`}
            >
              <button
                type="button"
                aria-expanded
                onClick={() => setMobileDockCollapsed(true)}
                className="flex min-h-11 w-full shrink-0 items-center justify-center gap-2 border-b border-border bg-card text-sm font-bold text-foreground"
              >
                <ChevronDown size={16} />
                بستن ابزارها
              </button>
              <div
                className={
                  activeTab === "stickers"
                    ? "flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3 pt-2"
                    : "min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
                }
              >
                <EditorSidePanel {...sidePanelProps} compact />
              </div>
            </div>
          ) : null}
          <div className="grid grid-cols-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-editor-guide={`tab-${tab.id}`}
                onClick={() => handleMobileTabChange(tab.id)}
                className={`flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] leading-tight ${
                  activeTab === tab.id && !mobileDockCollapsed
                    ? "text-cyan-400"
                    : "text-muted"
                }`}
              >
                {tab.icon}
                <span className="line-clamp-2 w-full text-center">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {editorModals}
        {accountPrompt}
      </div>
      </>
      </EditorGuestGateProvider>
    );
  }

  return (
    <EditorGuestGateProvider requireAccount={requireAccount}>
    <>
    {designerLoader}
    <div className="min-h-screen bg-background pt-20 md:pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <WizardBreadcrumb
          crumbs={[
            { label: "برند", href: "/create" },
            { label: brand.name, href: `/create/${brandSlug}` },
            { label: model.name, href: `/phones/${brandSlug}/${modelSlug}` },
            { label: caseType.name },
            { label: "طراحی" },
          ]}
        />

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed text-amber-100/90">
              تفاوت طراحی و قاب اصلی را چشم‌پوشی کنید. قبل از طراحی و ارسال، هماهنگی
              بابت تایید طراحی با شما انجام خواهد شد.
            </p>
          </div>
        </div>

        <div
          data-editor-guide="toolbar"
          className="mt-4 flex flex-wrap items-center gap-2 md:flex-nowrap"
        >
          <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
            <ToolbarButton onClick={requestExit} icon={<LogOut size={16} />} label="خروج" />
            <ToolbarButton onClick={undo} disabled={!canUndo()} icon={<Undo2 size={16} />} label="بازگشت" />
            <ToolbarButton onClick={redo} disabled={!canRedo()} icon={<Redo2 size={16} />} label="جلو" />
            <ToolbarButton
              onClick={() => {
                setPreviewMode(true);
                setShowPreview(true);
              }}
              icon={<Eye size={16} />}
              label="پیش‌نمایش"
            />
            <ToolbarButton onClick={() => setShowSaveModal(true)} icon={<Save size={16} />} label="ذخیره" />
            {user?.role === "admin" && forkArtwork ? (
              <ToolbarButton
                onClick={() => void handleSaveAsCatalogDesign()}
                disabled={savingCatalog}
                icon={<Save size={16} />}
                label={savingCatalog ? "در حال ذخیره" : "طرح جدید"}
              />
            ) : null}
          </div>

          <div className="hidden h-6 w-px shrink-0 bg-border sm:block" aria-hidden />

          <div className="hidden sm:contents">
            <ToolbarButton
              onClick={handleOpenEditorGuide}
              icon={<GraduationCap size={16} />}
              label="راهنما"
            />
            <div className="relative">
              <ToolbarButton
                onClick={() => setShowShortcuts((v) => !v)}
                icon={<HelpCircle size={16} />}
                label="?"
              />
              {showShortcuts ? (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-card p-3 shadow-xl">
                  <p className="mb-2 text-xs font-bold text-foreground">میانبرهای صفحه‌کلید</p>
                  <ul className="space-y-1">
                    {SHORTCUT_HELP.map((item) => (
                      <li key={item.keys} className="flex justify-between gap-2 text-[10px]">
                        <span className="text-muted">{item.action}</span>
                        <kbd className="shrink-0 rounded bg-background px-1.5 py-0.5 font-mono text-foreground">
                          {item.keys}
                        </kbd>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <DockableAction className="mr-auto shrink-0">
            <EditorBuyButton
              busy={buyBusy}
              price={formatToman(getCaseTotalPrice(caseType, true))}
              onClick={() => void handleBuy()}
            />
          </DockableAction>
        </div>

        {message ? (
          <p className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
            {message}
          </p>
        ) : null}
        {shareUrl ? (
          <p className="mt-2 truncate text-xs text-muted">{shareUrl}</p>
        ) : null}

        <div className="mt-6 grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:gap-8">
          <div
            ref={canvasContainerRef}
            data-editor-guide="canvas"
            onPointerDown={handleCanvasBackdropPointerDown}
            className="relative flex min-h-[280px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[radial-gradient(ellipse_at_50%_30%,rgba(34,211,238,0.12),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(139,92,246,0.1),transparent_50%)] bg-card/40 p-4 md:sticky md:top-24 md:w-fit md:min-h-0 md:self-start md:p-8"
          >
            {canvasStage}
          </div>

          <EditorSidePanel {...sidePanelProps} />
        </div>
      </div>

      {editorModals}
      {accountPrompt}
    </div>
    </>
    </EditorGuestGateProvider>
  );
}

function EditorBuyButton({
  price,
  busy,
  onClick,
  compact = false,
}: {
  price: string;
  busy: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      data-editor-guide="buy"
      onClick={onClick}
      disabled={busy}
      aria-label={`خرید قاب، ${price}`}
      className={`flex items-center rounded-2xl bg-foreground text-background shadow-[0_10px_28px_rgba(0,0,0,0.28)] transition hover:bg-cyan-300 hover:text-black disabled:opacity-60 ${
        compact ? "min-h-12 gap-1.5 px-3" : "min-h-12 gap-2 px-4"
      }`}
    >
      <ShoppingCart size={compact ? 16 : 18} />
      <span className="flex flex-col items-start leading-none">
        <span className="text-[10px] font-semibold">خرید قاب</span>
        <span className={`font-black ${compact ? "mt-0.5 text-xs" : "mt-1 text-sm"}`}>{price}</span>
      </span>
    </button>
  );
}

function ToolbarButton({
  onClick,
  disabled,
  icon,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted transition hover:border-cyan-500/50 disabled:opacity-40 sm:min-h-0 sm:min-w-0"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function MobileIconButton({
  onClick,
  disabled,
  icon,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex min-h-11 min-w-[3.4rem] max-w-[4.75rem] flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] leading-tight text-muted transition hover:bg-card/70 hover:text-foreground disabled:opacity-40"
    >
      {icon}
      <span className="line-clamp-2 w-full text-center">{label}</span>
    </button>
  );
}

function EditorSidePanel({
  tabs,
  activeTab,
  onTabChange,
  designPicker,
  brandSlug,
  modelSlug,
  caseTypeSlug,
  modelName,
  compact,
  loadedTabs,
}: {
  tabs: { id: EditorTab; label: string; icon: React.ReactNode }[];
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  designPicker: EditorDesignPicker;
  brandSlug: string;
  modelSlug: string;
  caseTypeSlug: string;
  modelName: string;
  compact?: boolean;
  loadedTabs: Set<EditorTab>;
}) {
  const designTab = activeTab === "stickers";
  return (
    <div
      className={
        compact
          ? designTab
            ? "flex h-full min-h-0 flex-col"
            : "min-h-0"
          : designTab
            ? "sticky top-24 flex h-[max(min(72dvh,560px),calc(100dvh-7rem))] min-h-0 min-w-0 flex-col self-start rounded-2xl border border-border bg-card/60"
            : "sticky top-24 flex max-h-[calc(100dvh-7rem)] min-h-[min(42dvh,320px)] min-w-0 flex-col self-start rounded-2xl border border-border bg-card/60"
      }
    >
      {!compact ? (
        <div className="sticky top-0 z-10 shrink-0 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex gap-1 overflow-x-auto overscroll-x-contain p-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-editor-guide={`tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition ${
                  activeTab === tab.id
                    ? "border-cyan-500/30 bg-cyan-500/20 text-cyan-400"
                    : "border-transparent text-muted hover:border-border hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div
        className={
          designTab
            ? "flex min-h-0 flex-1 flex-col overflow-hidden p-3"
            : compact
              ? "min-h-0"
              : "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
        }
      >
        {loadedTabs.has("layers") && activeTab === "layers" ? (
          <LayersPanel compact={compact} />
        ) : null}
        {loadedTabs.has("text") && activeTab === "text" ? (
          <TextPanel compact={compact} />
        ) : null}
        {loadedTabs.has("stickers") ? (
          <div className={designTab ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
            <DesignPickerPanel picker={designPicker} />
          </div>
        ) : null}
        {loadedTabs.has("upload") && activeTab === "upload" ? <UploadPanel /> : null}
        {loadedTabs.has("design-for-you") && activeTab === "design-for-you" ? (
          <DesignForYouPanel
            brandSlug={brandSlug}
            modelSlug={modelSlug}
            caseTypeSlug={caseTypeSlug}
            modelName={modelName}
          />
        ) : null}
        {loadedTabs.has("description") && activeTab === "description" ? (
          <DescriptionPanel />
        ) : null}
      </div>
    </div>
  );
}
