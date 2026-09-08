export function createRafResizeHandler(callback: () => void) {
  let rafId: number | null = null;

  const handler = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      callback();
    });
  };

  const cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  return { handler, cancel };
}
