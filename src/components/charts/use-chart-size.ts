"use client";

import { useEffect, useRef, useState } from "react";

type ChartSize = {
  width: number;
  height: number;
};

export function useChartSize() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<ChartSize>({ width: 0, height: 0 });

  useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

    const updateSize = () => {
      const nextSize = {
        width: node.clientWidth,
        height: node.clientHeight,
      };

      setSize((current) => {
        if (
          current.width === nextSize.width &&
          current.height === nextSize.height
        ) {
          return current;
        }

        return nextSize;
      });
    };

    const frameId = window.requestAnimationFrame(updateSize);
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  return {
    containerRef,
    size,
  };
}
