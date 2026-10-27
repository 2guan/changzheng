import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent,
  type KeyboardEvent,
  type DragEvent,
} from "react";
import { focalPan } from "../landscapeFocus";

/** Pan artwork directly, while leaving links and vertical touch scrolling alone. */
export function useLandscapeDrag(
  resetKey: string,
  disabled: boolean,
  mobileFocusX: number,
) {
  const surface = useRef<HTMLElement>(null);
  const artwork = useRef<HTMLImageElement>(null);
  const frame = useRef({ width: 0, travel: 0 });
  const position = useRef(0.5);
  const animationFrame = useRef<number | null>(null);
  const pendingScroll = useRef<{ viewport: HTMLElement; left: number } | null>(
    null,
  );
  const dragging = useRef(false);
  const nativeVerticalScroll = useRef(true);
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    start: number;
    moved: boolean;
    viewport: HTMLElement | null;
    scroll: number;
  } | null>(null);
  const suppressClick = useRef(false);
  const manuallyPanned = useRef(false);

  // Keep pointer-frequency updates out of React: the route and its SVG stay still.
  const paint = () => {
    animationFrame.current = null;
    if (artwork.current) {
      artwork.current.style.transform = `translate3d(${-position.current * frame.current.travel}px, 0, 0)`;
    }
    if (pendingScroll.current) {
      pendingScroll.current.viewport.scrollLeft = pendingScroll.current.left;
      pendingScroll.current = null;
    }
  };
  const schedulePaint = () => {
    if (animationFrame.current === null) {
      animationFrame.current = requestAnimationFrame(paint);
    }
  };
  const setDragging = (active: boolean) => {
    dragging.current = active;
    surface.current?.classList.toggle("is-dragging-landscape", active);
  };
  const cancelPaint = () => {
    if (animationFrame.current !== null)
      cancelAnimationFrame(animationFrame.current);
    animationFrame.current = null;
    pendingScroll.current = null;
  };

  useEffect(() => {
    cancelPaint();
    manuallyPanned.current = false;
    position.current = 0.5;
    gesture.current = null;
    setDragging(false);
    return cancelPaint;
  }, [resetKey]);

  useEffect(() => {
    if (disabled) {
      gesture.current = null;
      cancelPaint();
      setDragging(false);
    }
  }, [disabled]);

  useEffect(() => {
    const el = surface.current;
    const image = artwork.current;
    if (!el || !image) return;
    const measure = () => {
      const viewportWidth = el.clientWidth;
      // A full-screen map owns one-finger gestures, including diagonal swipes.
      // Long chapters still yield vertical scrolling and pinch zoom to the browser.
      nativeVerticalScroll.current = el.scrollHeight > window.innerHeight + 1;
      el.style.touchAction = nativeVerticalScroll.current
        ? "pan-y pinch-zoom"
        : "pinch-zoom";
      const ratio = image.naturalWidth / image.naturalHeight || 1.8;
      const width = Math.max(viewportWidth * 1.2, image.clientHeight * ratio);
      frame.current = { width, travel: width - viewportWidth };
      image.style.width = `${width}px`;
      image.style.left = "0";
      if (!manuallyPanned.current) {
        position.current = window.matchMedia("(max-width: 768px)").matches
          ? focalPan(mobileFocusX, width, viewportWidth)
          : 0.5;
      }
      schedulePaint();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    observer.observe(image);
    image.addEventListener("load", measure);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      image.removeEventListener("load", measure);
      window.removeEventListener("resize", measure);
    };
  }, [resetKey, mobileFocusX]);

  const finish = (event: ReactPointerEvent<HTMLElement>) => {
    if (gesture.current?.id !== event.pointerId) return;
    gesture.current = null;
    if (animationFrame.current !== null)
      cancelAnimationFrame(animationFrame.current);
    paint();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  };

  return {
    surface,
    artwork,
    dragging,
    handlers: {
      onPointerDown(event: ReactPointerEvent<HTMLElement>) {
        if (
          disabled ||
          !event.isPrimary ||
          event.button !== 0 ||
          gesture.current
        )
          return;
        suppressClick.current = false;
        if (
          (event.target as Element).closest(
            "a:not(.atlas-stop), button, input, textarea, select, [role='slider']",
          )
        )
          return;
        const viewport = (event.target as Element).closest<HTMLElement>(
          ".atlas-map-viewport",
        );
        gesture.current = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          start: position.current,
          moved: false,
          viewport:
            viewport &&
            window.matchMedia("(min-width: 769px)").matches &&
            viewport.scrollWidth > viewport.clientWidth
              ? viewport
              : null,
          scroll: viewport?.scrollLeft || 0,
        };
      },
      onPointerMove(event: ReactPointerEvent<HTMLElement>) {
        const drag = gesture.current;
        if (!drag || drag.id !== event.pointerId || disabled) return;
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        if (!drag.moved) {
          // Wait for a clear direction instead of rejecting the first diagonal sample.
          if (Math.hypot(dx, dy) < 10) return;
          if (
            nativeVerticalScroll.current &&
            Math.abs(dy) > Math.abs(dx) * 1.3
          ) {
            gesture.current = null;
            return;
          }
          if (Math.abs(dx) < 8) return;
          drag.moved = true;
          manuallyPanned.current = true;
          suppressClick.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }
        position.current = Math.max(
          0,
          Math.min(1, drag.start - dx / Math.max(1, frame.current.travel)),
        );
        if (drag.viewport) {
          pendingScroll.current = {
            viewport: drag.viewport,
            left: drag.scroll - dx,
          };
        }
        schedulePaint();
      },
      onPointerUp: finish,
      onPointerCancel: finish,
      onLostPointerCapture(event: ReactPointerEvent<HTMLElement>) {
        // Touch implicitly captures the initial child. Its capture-loss event
        // bubbles here when we transfer capture to the surface; that is not an end.
        if (event.target === event.currentTarget) finish(event);
      },
      onKeyDown(event: KeyboardEvent<HTMLElement>) {
        if (
          disabled ||
          (event.target !== event.currentTarget &&
            !(event.target as Element).classList.contains("atlas-map-viewport"))
        )
          return;
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        manuallyPanned.current = true;
        const direction = event.key === "ArrowRight" ? 1 : -1;
        position.current = Math.max(
          0,
          Math.min(1, position.current + direction * 0.08),
        );
        schedulePaint();
        if (
          (event.target as Element).classList.contains("atlas-map-viewport")
        ) {
          (event.target as HTMLElement).scrollLeft += direction * 100;
        }
      },
      onDragStartCapture(event: DragEvent<HTMLElement>) {
        if ((event.target as Element).closest(".atlas-stop"))
          event.preventDefault();
      },
      onClickCapture(event: MouseEvent<HTMLElement>) {
        if (suppressClick.current) {
          suppressClick.current = false;
          event.preventDefault();
          event.stopPropagation();
        }
      },
    },
  };
}
