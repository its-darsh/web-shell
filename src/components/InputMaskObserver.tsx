import { ReactNode, useRef, useEffect } from "react";

export const InputMaskObserver: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) return;
    const observedElements = new Map<Element, DOMRect>();

    function notifyInputMask(entries: ResizeObserverEntry[] = []) {
      for (const entry of entries) {
        observedElements.set(
          entry.target,
          entry.target.getBoundingClientRect(),
        );
      }
      window.fabric.bridge.setInputRegions(
        Array.from(observedElements.values()),
      );
    }

    const resizeObserver = new ResizeObserver(notifyInputMask);

    containerElement.querySelectorAll<HTMLElement>(".observe").forEach((el) => {
      resizeObserver.observe(el);
    });

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type !== "childList" || mutation.addedNodes.length <= 0)
          return;
        mutation.addedNodes.forEach((newElement) => {
          if (!(newElement instanceof HTMLElement)) return;

          if (newElement.classList.contains("observe")) {
            resizeObserver.observe(newElement);
            notifyInputMask();
          }

          newElement.querySelectorAll<HTMLElement>(".observe").forEach((el) => {
            resizeObserver.observe(el);
          });
        });
      });
    });

    mutationObserver.observe(containerElement, {
      childList: true,
      subtree: true,
    });

    const id = setInterval(notifyInputMask, 800);
    notifyInputMask();

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      clearInterval(id);
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
};
