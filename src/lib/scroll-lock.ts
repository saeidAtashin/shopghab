type SavedScroll = {
  htmlOverflow: string;
  bodyOverflow: string;
  bodyOverscroll: string;
};

let depth = 0;
let saved: SavedScroll | null = null;

export function lockPageScroll(): () => void {
  if (typeof document === "undefined") return () => {};

  if (depth === 0) {
    const html = document.documentElement;
    const body = document.body;
    saved = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
  }

  depth += 1;
  let released = false;

  return () => {
    if (released) return;
    released = true;
    depth = Math.max(0, depth - 1);
    if (depth > 0 || !saved || typeof document === "undefined") return;

    const html = document.documentElement;
    const body = document.body;
    html.style.overflow = saved.htmlOverflow;
    body.style.overflow = saved.bodyOverflow;
    body.style.overscrollBehavior = saved.bodyOverscroll;
    saved = null;
  };
}
