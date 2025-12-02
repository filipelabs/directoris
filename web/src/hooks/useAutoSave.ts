"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
  /** Key that resets the initial state when changed (e.g., entity ID) */
  key?: string | null;
}

interface UseAutoSaveReturn {
  status: SaveStatus;
  lastSaved: Date | null;
  save: () => void;
  isPending: boolean;
}

export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 500,
  enabled = true,
  key,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPending, setIsPending] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef(data);
  const initialDataRef = useRef(data);
  const prevKeyRef = useRef(key);
  const isFirstRender = useRef(true);
  const skipNextDataChange = useRef(false);

  // Update dataRef when data changes
  dataRef.current = data;

  // Reset initial state when key changes (e.g., switching scenes)
  useEffect(() => {
    if (prevKeyRef.current !== key) {
      prevKeyRef.current = key;
      setIsPending(false);
      setStatus("idle");
      setLastSaved(null);
      // Skip the next data change since it's the initial sync for the new key
      skipNextDataChange.current = true;

      // Clear any pending save
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [key]);

  const performSave = useCallback(async () => {
    if (!enabled) return;

    setStatus("saving");
    setIsPending(false);

    try {
      await onSave(dataRef.current);
      setStatus("saved");
      setLastSaved(new Date());
      // Update initial data after successful save
      initialDataRef.current = dataRef.current;

      // Reset to idle after showing "saved" briefly
      setTimeout(() => {
        setStatus((current) => (current === "saved" ? "idle" : current));
      }, 2000);
    } catch (error) {
      console.error("Auto-save failed:", error);
      setStatus("error");

      // Reset to idle after showing error
      setTimeout(() => {
        setStatus((current) => (current === "error" ? "idle" : current));
      }, 3000);
    }
  }, [onSave, enabled]);

  const save = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    performSave();
  }, [performSave]);

  // Debounced auto-save on data change
  useEffect(() => {
    // Skip the first render (initial mount)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      initialDataRef.current = data;
      return;
    }

    // Skip after key change - this is the initial data for the new entity
    if (skipNextDataChange.current) {
      skipNextDataChange.current = false;
      initialDataRef.current = data;
      return;
    }

    // Don't save if data hasn't changed from initial
    if (JSON.stringify(data) === JSON.stringify(initialDataRef.current)) {
      setIsPending(false);
      return;
    }

    if (!enabled) return;

    setIsPending(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, debounceMs, enabled, performSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    lastSaved,
    save,
    isPending,
  };
}
