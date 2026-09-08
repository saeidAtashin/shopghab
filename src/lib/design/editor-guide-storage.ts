export const EDITOR_GUIDE_SEEN_KEY = "case-editor-guide-seen";

function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function hasSeenEditorGuide(): boolean {
  if (!hasLocalStorage()) return false;

  try {
    return localStorage.getItem(EDITOR_GUIDE_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markEditorGuideSeen(): void {
  if (!hasLocalStorage()) return;

  try {
    localStorage.setItem(EDITOR_GUIDE_SEEN_KEY, "1");
  } catch {
    // ignore quota / privacy errors
  }
}
