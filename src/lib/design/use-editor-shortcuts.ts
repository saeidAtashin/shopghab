"use client";

import { useEffect } from "react";

import { useEditorStore } from "@/lib/design/editor-store";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function useEditorShortcuts() {
  const {
    undo,
    redo,
    addTextLayer,
    selectLayer,
    setLayerVisible,
    moveLayer,
    nudgeLayer,
    duplicateLayer,
    getSelectedLayer,
  } = useEditorStore();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;

      const mod = e.ctrlKey || e.metaKey;
      const selected = getSelectedLayer();

      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if ((mod && e.key === "y") || (mod && e.shiftKey && e.key === "z")) {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key === "t") {
        e.preventDefault();
        addTextLayer();
        return;
      }
      if (mod && e.key === "d" && selected) {
        e.preventDefault();
        duplicateLayer(selected.id);
        return;
      }
      if (mod && e.key === "]" && selected) {
        e.preventDefault();
        moveLayer(selected.id, "up");
        return;
      }
      if (mod && e.key === "[" && selected) {
        e.preventDefault();
        moveLayer(selected.id, "down");
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        e.preventDefault();
        setLayerVisible(selected.id, false);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        selectLayer(null);
        return;
      }
      if (e.key === "v" && !mod && selected) {
        e.preventDefault();
        setLayerVisible(selected.id, selected.visible === false);
        return;
      }
      if (selected && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        nudgeLayer(selected.id, dx, dy);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    undo,
    redo,
    addTextLayer,
    selectLayer,
    setLayerVisible,
    moveLayer,
    nudgeLayer,
    duplicateLayer,
    getSelectedLayer,
  ]);
}

export const SHORTCUT_HELP = [
  { keys: "Ctrl+Z / Ctrl+Y", action: "بازگشت / جلو" },
  { keys: "Ctrl+T", action: "افزودن متن" },
  { keys: "Delete", action: "مخفی کردن لایه" },
  { keys: "V", action: "نمایش/مخفی لایه" },
  { keys: "← → ↑ ↓", action: "جابجایی ۱px (Shift=۱۰px)" },
  { keys: "Ctrl+] / Ctrl+[", action: "ترتیب لایه" },
  { keys: "Ctrl+D", action: "کپی لایه" },
  { keys: "Escape", action: "لغو انتخاب" },
] as const;
