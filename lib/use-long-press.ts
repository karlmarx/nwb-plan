"use client";

import { useCallback, useRef } from "react";

/**
 * Long-press hook that also handles right-click / context menu for desktop.
 *
 * - Touch: press & hold for `delay` ms triggers onLongPress. Tap still fires normally
 *   (consumers should use the returned onClick wrapper — it suppresses the click
 *   when a long-press fired).
 * - Mouse: context menu (right-click) triggers onLongPress. Left-click holds do NOT
 *   trigger long-press to avoid conflict with text selection / drag.
 * - Scroll cancels an in-progress long-press.
 */
export interface LongPressHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onTouchCancel: (e: React.TouchEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}

interface UseLongPressOptions {
  delay?: number;
  moveThreshold?: number;
}

export function useLongPress(
  onLongPress: () => void,
  onClick?: () => void,
  { delay = 500, moveThreshold = 10 }: UseLongPressOptions = {},
): LongPressHandlers {
  const timerRef = useRef<number | null>(null);
  const firedRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      firedRef.current = false;
      const touch = e.touches[0];
      if (!touch) return;
      startPosRef.current = { x: touch.clientX, y: touch.clientY };
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        firedRef.current = true;
        // Haptic feedback on supported devices
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          try {
            navigator.vibrate(15);
          } catch {}
        }
        onLongPress();
      }, delay);
    },
    [clearTimer, onLongPress, delay],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const start = startPosRef.current;
      if (!touch || !start) return;
      const dx = Math.abs(touch.clientX - start.x);
      const dy = Math.abs(touch.clientY - start.y);
      if (dx > moveThreshold || dy > moveThreshold) {
        clearTimer();
      }
    },
    [clearTimer, moveThreshold],
  );

  const handleTouchEnd = useCallback(
    (_e: React.TouchEvent) => {
      clearTimer();
      startPosRef.current = null;
    },
    [clearTimer],
  );

  const handleTouchCancel = useCallback(
    (_e: React.TouchEvent) => {
      clearTimer();
      firedRef.current = false;
      startPosRef.current = null;
    },
    [clearTimer],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      firedRef.current = true;
      onLongPress();
    },
    [onLongPress],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (firedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        firedRef.current = false;
        return;
      }
      onClick?.();
    },
    [onClick],
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    onContextMenu: handleContextMenu,
    onClick: handleClick,
  };
}
