"use client";
import { useEffect } from "react";

/**
 * Locks body scroll while a modal/bottom-sheet is open.
 * Automatically restores scroll on unmount.
 */
export function useBodyScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}
