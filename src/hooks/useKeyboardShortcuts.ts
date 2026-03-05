"use client";

import { useEffect } from "react";

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  handler: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        const metaOrCtrl = shortcut.meta || shortcut.ctrl;
        const isMetaOrCtrl = e.metaKey || e.ctrlKey;

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          (!metaOrCtrl || isMetaOrCtrl) &&
          (!shortcut.shift || e.shiftKey)
        ) {
          e.preventDefault();
          shortcut.handler();
          return;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
