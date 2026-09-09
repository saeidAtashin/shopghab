"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Undo2,
  Redo2,
  Eye,
  Save,
  Share2,
  Download,
  ShoppingCart,
  Type,
  Sticker,
  Upload,
  FileText,
  Layers,
  LayoutTemplate,
  Sparkles,
  HelpCircle,
  GraduationCap,
  AlertTriangle,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import type Konva from "konva";

import WizardBreadcrumb from "@/app/components/case-wizard/WizardBreadcrumb";
import TextPanel from "@/app/components/case-editor/TextPanel";
import UploadPanel from "@/app/components/case-editor/UploadPanel";
import DescriptionPanel from "@/app/components/case-editor/DescriptionPanel";
import LayersPanel from "@/app/components/case-editor/LayersPanel";
import PreviewModal from "@/app/components/case-editor/PreviewModal";
import SaveImageModal from "@/app/components/case-editor/SaveImageModal";
import EditorGuideOverlay from "@/app/components/case-editor/EditorGuideOverlay";
import { useAuth } from "@/app/context/AuthContext";
import { useShopCart } from "@/app/context/ShopCartContext";
import {
  getBrandBySlug,
  getCaseTypeBySlug,
  getCaseTotalPrice,
  getModelBySlug,
  getStickerPacks,
} from "@/lib/cases";
import { getCaseTemplateBySlug } from "@/lib/cases/templates.static";
import { getReadyCaseBySlug } from "@/lib/cases/ready.static";
import { getDesign, getDesignByShareToken } from "@/lib/design/api";
import { useEditorStore } from "@/lib/design/editor-store";
import { saveDesign } from "@/lib/design/api";
import { exportAndDownload, exportStageToPng } from "@/lib/design/export";
import {
  SHORTCUT_HELP,
  useEditorShortcuts,
} from "@/lib/design/use-editor-shortcuts";
import { loadEditorFonts } from "@/lib/design/editor-fonts";
import { useCanvasDisplaySize } from "@/lib/design/use-canvas-display-size";
import { useElementSize } from "@/lib/design/use-element-size";
import { useMediaQuery } from "@/lib/design/use-media-query";
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

const StickerPanel = dynamic(() => import("@/app/components/case-editor/StickerPanel"), {
  ssr: false,
  loading: () => <PanelLoading />,
});

const TemplatesPanel = dynamic(() => import("@/app/components/case-editor/TemplatesPanel"), {
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
  | "templates"
  | "design-for-you"
  | "description";

type Props = {
  brandSlug: string;
  modelSlug: string;
  caseTypeSlug: string;
  initialDesignId?: string;
  initialShareToken?: string;
  initialTemplateSlug?: string;
  initialTab?: EditorTab;
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
}: Props) {
  const brand = getBrandBySlug(brandSlug)!;
  const model = getModelBySlug(brandSlug, modelSlug)!;
  const caseType = getCaseTypeBySlug(caseTypeSlug)!;
  const stickerPacks = getStickerPacks();

  const { user } = useAuth();
  const { addCustomCase, startFlyToCart } = useShopCart();
  const stageRef = useRef<Konva.Stage | null>(null);
  const loadedRef = useRef(false);
  const guideCheckedRef = useRef(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const mobileDockRef = useRef<HTMLDivElement>(null);

  const isSplitLayout = useMediaQuery("(min-width: 768px)");
  const isMobileViewport = isSplitLayout === false;
  const dockSize = useElementSize(mobileDockRef);
  const canvasDisplaySize = useCanvasDisplaySize(
    canvasContainerRef,
    true,
    isSplitLayout ? "desktop" : "mobile",
    { width: model.canvasWidth, height: model.canvasHeight },
  );

  const init = useEditorStore((s) => s.init);
  const loadDocument = useEditorStore((s) => s.loadDocument);
  const loadTemplate = useEditorStore((s) => s.loadTemplate);
  const document = useEditorStore((s) => s.document);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const setPreviewMode = useEditorStore((s) => s.setPreviewMode);

  useEditorShortcuts();

  useEffect(() => {
    void loadEditorFonts();
  }, []);

  const [activeTab, setActiveTab] = useState<EditorTab>(initialTab ?? "text");
  const [loadedTabs, setLoadedTabs] = useState<Set<EditorTab>>(
    () => new Set([initialTab ?? "text"]),
  );
  const [showPreview, setShowPreview] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [warningExpanded, setWarningExpanded] = useState(false);
  const [mobileDockCollapsed, setMobileDockCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [buyBusy, setBuyBusy] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [showEditorGuide, setShowEditorGuide] = useState(false);

  useEffect(() => {
    setLoadedTabs((prev) => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  useEffect(() => {
    if (!editorReady || guideCheckedRef.current) return;
    guideCheckedRef.current = true;

    const timer = window.setTimeout(() => {
      if (!hasSeenEditorGuide()) {
        setShowEditorGuide(true);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [editorReady]);

  useEffect(() => {
    if (loadedRef.current) return;

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
    init,
    loadDocument,
    loadTemplate,
    caseType,
    model,
  ]);

  const handleSaveToAccount = useCallback(async () => {
    if (!user) {
      setMessage("برای ذخیره طراحی ابتدا وارد شوید.");
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
  }, [user, document]);

  const handleShare = useCallback(async () => {
    const saved = await saveDesign(document);
    const url = `${window.location.origin}/share/${saved.shareToken}`;
    setShareUrl(url);
    try {
      await navigator.clipboard.writeText(url);
      setMessage("لینک اشتراک‌گذاری کپی شد.");
    } catch {
      setMessage(url);
    }
  }, [document]);

  const handleDownload = useCallback(async () => {
    if (!stageRef.current) return;
    await exportAndDownload(
      stageRef.current,
      `case-${brandSlug}-${modelSlug}.png`,
    );
  }, [brandSlug, modelSlug]);

  const handleBuy = useCallback(async () => {
    if (buyBusy) return;
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
  ]);

  const tabs: { id: EditorTab; label: string; icon: React.ReactNode }[] = [
    { id: "layers", label: "لایه‌ها", icon: <Layers size={16} /> },
    { id: "text", label: "متن", icon: <Type size={16} /> },
    { id: "stickers", label: "طراحی آماده", icon: <Sticker size={16} /> },
    { id: "upload", label: "تصویر", icon: <Upload size={16} /> },
    { id: "templates", label: "قالب", icon: <LayoutTemplate size={16} /> },
    { id: "design-for-you", label: "طراحی برای شما", icon: <Sparkles size={16} /> },
    { id: "description", label: "توضیحات", icon: <FileText size={16} /> },
  ];

  const mobileBottomPadding =
    isMobileViewport && dockSize.height > 0 ? dockSize.height + 8 : undefined;

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
    setShowMoreMenu(false);
    setShowEditorGuide(true);
  }, []);

  const sidePanelProps = {
    tabs,
    activeTab,
    onTabChange: setActiveTab,
    stickerPacks,
    brandSlug,
    modelSlug,
    caseTypeSlug,
    modelName: model.name,
    loadedTabs,
  };

  return (
    <div
      className={`min-h-screen bg-background pt-20 md:pb-8 ${
        isMobileViewport && !mobileBottomPadding
          ? mobileDockCollapsed
            ? "pb-14"
            : "pb-24"
          : ""
      }`}
      style={mobileBottomPadding ? { paddingBottom: mobileBottomPadding } : undefined}
    >
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
            <p
              className={`text-sm leading-relaxed text-amber-100/90 ${
                warningExpanded ? "" : "line-clamp-2 md:line-clamp-none"
              }`}
            >
              تفاوت طراحی و قاب اصلی را چشم‌پوشی کنید. قبل از طراحی و ارسال، هماهنگی
              بابت تایید طراحی با شما انجام خواهد شد.
            </p>
            <button
              type="button"
              onClick={() => setWarningExpanded((v) => !v)}
              className="mt-1 flex items-center gap-1 text-xs text-amber-300/80 md:hidden"
            >
              {warningExpanded ? (
                <>
                  <ChevronUp size={14} />
                  کمتر
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  بیشتر
                </>
              )}
            </button>
          </div>
        </div>

        <div
          data-editor-guide="toolbar"
          className="mt-4 flex scroll-mt-24 flex-wrap items-center gap-2 md:flex-nowrap"
        >
          <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
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
          </div>

          <div className="hidden h-6 w-px shrink-0 bg-border sm:block" aria-hidden />

          <div className="hidden sm:contents">
            <ToolbarButton onClick={handleShare} icon={<Share2 size={16} />} label="اشتراک" />
            <ToolbarButton onClick={handleDownload} icon={<Download size={16} />} label="دانلود" />
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

          <div className="relative sm:hidden">
            <ToolbarButton
              onClick={() => setShowMoreMenu((v) => !v)}
              icon={<MoreHorizontal size={16} />}
              label="بیشتر"
            />
            {showMoreMenu ? (
              <div className="absolute right-0 top-full z-50 mt-2 min-w-[10rem] rounded-xl border border-border bg-card p-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    void handleShare();
                    setShowMoreMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-foreground hover:bg-background"
                >
                  <Share2 size={14} />
                  اشتراک
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleDownload();
                    setShowMoreMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-foreground hover:bg-background"
                >
                  <Download size={14} />
                  دانلود
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditorGuide();
                    setShowMoreMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-foreground hover:bg-background"
                >
                  <GraduationCap size={14} />
                  راهنما
                </button>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            data-editor-guide="buy"
            onClick={() => void handleBuy()}
            disabled={buyBusy}
            className="mr-auto flex min-h-11 scroll-mt-24 items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-cyan-400 disabled:opacity-60"
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">خرید — </span>
            {formatToman(getCaseTotalPrice(caseType, true))}
          </button>
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
            className="relative flex min-h-[280px] w-full scroll-mt-24 scroll-mb-36 items-center justify-center overflow-hidden rounded-2xl border border-border bg-[radial-gradient(ellipse_at_50%_30%,rgba(34,211,238,0.12),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(139,92,246,0.1),transparent_50%)] bg-card/40 p-4 md:sticky md:top-24 md:w-fit md:min-h-0 md:scroll-mb-0 md:scroll-mt-0 md:self-start md:p-8"
          >
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
              displayMaxWidth={canvasDisplaySize.width}
              displayMaxHeight={canvasDisplaySize.height}
              mobileTouchMode={isMobileViewport}
            />
            {analyzing ? (
              <div
                className="absolute inset-0 z-10 overflow-hidden rounded-2xl bg-black/50 backdrop-blur-[2px]"
                aria-live="polite"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-25"
                  style={{
                    backgroundImage:
                      "linear-gradient(to left, rgba(34,211,238,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,211,238,0.35) 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                  }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-x-4 top-0 h-16 -translate-y-1/2 bg-gradient-to-b from-cyan-400/0 via-cyan-300/70 to-cyan-400/0 animate-print-analyze-scan"
                  aria-hidden
                />
                <div className="pointer-events-none absolute inset-5 rounded-xl border border-cyan-300/40" aria-hidden />
                <div className="absolute inset-x-0 bottom-5 flex justify-center">
                  <p className="rounded-full border border-cyan-400/40 bg-black/55 px-3 py-1.5 text-xs font-bold text-cyan-100">
                    در حال بررسی چاپ…
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {isSplitLayout ? (
            <EditorSidePanel {...sidePanelProps} />
          ) : null}
        </div>
      </div>

      {isMobileViewport ? (
        <div
          ref={mobileDockRef}
          data-editor-guide="mobile-dock"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          <div className="flex overflow-x-auto border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-editor-guide={`tab-${tab.id}`}
                onClick={() => handleMobileTabChange(tab.id)}
                className={`flex min-h-11 min-w-[5rem] flex-1 flex-col items-center justify-center gap-1 py-2 text-xs ${
                  activeTab === tab.id ? "text-cyan-400" : "text-muted"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-expanded={!mobileDockCollapsed}
            onClick={() => setMobileDockCollapsed((v) => !v)}
            className="flex min-h-9 w-full items-center justify-center gap-1.5 border-b border-border text-xs text-muted transition hover:bg-card/60 hover:text-foreground"
          >
            {mobileDockCollapsed ? (
              <>
                <ChevronUp size={14} />
                نمایش ابزارها
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                بستن ابزارها
              </>
            )}
          </button>
          {!mobileDockCollapsed ? (
            <div className="max-h-[min(40dvh,280px)] overflow-y-auto overscroll-contain p-4">
              <EditorSidePanel {...sidePanelProps} compact />
            </div>
          ) : null}
        </div>
      ) : null}

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
      </AnimatePresence>
    </div>
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

function EditorSidePanel({
  tabs,
  activeTab,
  onTabChange,
  stickerPacks,
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
  stickerPacks: ReturnType<typeof getStickerPacks>;
  brandSlug: string;
  modelSlug: string;
  caseTypeSlug: string;
  modelName: string;
  compact?: boolean;
  loadedTabs: Set<EditorTab>;
}) {
  return (
    <div
      className={
        compact
          ? "min-h-0"
          : "flex max-h-[calc(100dvh-13rem)] min-h-0 min-w-0 flex-col rounded-2xl border border-border bg-card/60"
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
      <div className={compact ? "min-h-0" : "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"}>
        {loadedTabs.has("layers") && activeTab === "layers" ? <LayersPanel /> : null}
        {loadedTabs.has("text") && activeTab === "text" ? <TextPanel /> : null}
        {loadedTabs.has("stickers") && activeTab === "stickers" ? (
          <StickerPanel packs={stickerPacks} />
        ) : null}
        {loadedTabs.has("upload") && activeTab === "upload" ? <UploadPanel /> : null}
        {loadedTabs.has("templates") && activeTab === "templates" ? (
          <TemplatesPanel
            brandSlug={brandSlug}
            modelSlug={modelSlug}
            caseTypeSlug={caseTypeSlug}
          />
        ) : null}
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
