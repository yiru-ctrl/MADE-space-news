import { useEffect, useRef } from "react";
import "./dot-grid-background.css";

export function DotGridBackground({
  position = "absolute",
  className = "",
}: {
  position?: "absolute" | "fixed";
  className?: string;
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;

    const paint = () => {
      frame = 0;
      const node = gridRef.current;
      if (!node) return;
      node.style.setProperty("--dot-x", `${lastX}px`);
      node.style.setProperty("--dot-y", `${lastY}px`);
      node.style.setProperty("--dot-shift-x", `${((lastX / window.innerWidth) - 0.5) * 4}px`);
      node.style.setProperty("--dot-shift-y", `${((lastY / window.innerHeight) - 0.5) * 4}px`);
      node.classList.add("is-active");
    };

    const handlePointerMove = (event: PointerEvent) => {
      lastX = event.clientX;
      lastY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const handlePointerLeave = () => gridRef.current?.classList.remove("is-active");

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("mouseleave", handlePointerLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={gridRef}
      className={`dot-grid-background ${position} inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <div className="dot-grid-hover" />
    </div>
  );
}
