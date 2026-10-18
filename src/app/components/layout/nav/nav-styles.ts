export const ICON_SIZE = 18;

/** Dark edge so light labels stay readable on light and dark banners. */
export const navBarLabelClass =
  "[text-shadow:0_0_1px_#000,0_1px_2px_rgba(0,0,0,0.95),0_-1px_2px_rgba(0,0,0,0.85),1px_0_2px_rgba(0,0,0,0.85),-1px_0_2px_rgba(0,0,0,0.85)]";

export const iconButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-border bg-card p-2.5 text-foreground transition hover:border-cyan-500/50 touch-manipulation";

export const loginButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95 sm:px-5 touch-manipulation";

export const panelButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold text-foreground transition-all hover:border-cyan-500/50 touch-manipulation";

export const logoutButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-red-500/10 p-2.5 text-red-400 transition-colors hover:bg-red-500/20 touch-manipulation";
