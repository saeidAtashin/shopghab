export const GAME_INSTALL_LIST_TARGET_SELECTOR =
  "[data-game-install-list-target]";

export const GAME_INSTALL_SUBMIT_TARGET_SELECTOR =
  "[data-game-install-submit-target]";

export const GAME_INSTALL_ORDER_SECTION_ID = "game-install-order";

export const INSTALL_FAB_DOCKED_EVENT = "game-install-fab-docked";

export const SCROLL_TO_TARGET_MS = 500;
export const SCROLL_BACK_MS = 450;
export const LIST_RECEIVE_DURATION_MS = 500;

export {
  FLY_ANIMATION_CONFIG,
  getCenter,
  prefersReducedMotion,
} from "@/lib/shop/fly-to-cart";

export function isElementInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.top < window.innerHeight &&
    rect.bottom > 0
  );
}

export function getVisibleListTargetRect(): DOMRect | null {
  if (typeof document === "undefined") return null;

  const orderSection = document.getElementById(GAME_INSTALL_ORDER_SECTION_ID);
  if (orderSection) {
    const panelBadge = orderSection.querySelector(
      GAME_INSTALL_LIST_TARGET_SELECTOR,
    );
    if (panelBadge instanceof HTMLElement) {
      const rect = panelBadge.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return rect;
    }
    if (isElementInViewport(orderSection)) {
      return orderSection.getBoundingClientRect();
    }
  }

  const targets = document.querySelectorAll(GAME_INSTALL_LIST_TARGET_SELECTOR);
  for (const el of targets) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return rect;
  }

  return orderSection?.getBoundingClientRect() ?? null;
}

export function getListTargetElement(): HTMLElement | null {
  if (typeof document === "undefined") return null;

  const orderSection = document.getElementById(GAME_INSTALL_ORDER_SECTION_ID);
  if (orderSection) {
    const panelBadge = orderSection.querySelector(
      GAME_INSTALL_LIST_TARGET_SELECTOR,
    );
    if (panelBadge instanceof HTMLElement) return panelBadge;
    return orderSection;
  }

  const targets = document.querySelectorAll(GAME_INSTALL_LIST_TARGET_SELECTOR);
  for (const el of targets) {
    if (el instanceof HTMLElement && el.getBoundingClientRect().width > 0) {
      return el;
    }
  }

  return null;
}

export function isOrderPanelInViewport(): boolean {
  const orderSection = document.getElementById(GAME_INSTALL_ORDER_SECTION_ID);
  if (!orderSection) return false;
  return isElementInViewport(orderSection);
}

export function scrollToListTarget(): Promise<void> {
  const target = getListTargetElement();
  if (!target) return Promise.resolve();

  return new Promise((resolve) => {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(resolve, SCROLL_TO_TARGET_MS);
  });
}

export function scrollBackTo(y: number): Promise<void> {
  return new Promise((resolve) => {
    window.scrollTo({ top: y, behavior: "smooth" });
    window.setTimeout(resolve, SCROLL_BACK_MS);
  });
}
