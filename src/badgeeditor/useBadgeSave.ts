import { useCallback, useEffect, useRef, useState } from "react";
import type { BadgeDocument } from "./model";

interface UseBadgeSaveOptions {
  doc: BadgeDocument;
  persist?: (doc: BadgeDocument) => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
}

export function useBadgeSave({
  doc,
  persist,
  onDirtyChange,
}: UseBadgeSaveOptions) {
  const [savedDoc, setSavedDoc] = useState(doc);
  const [isSaving, setIsSaving] = useState(false);
  const inFlight = useRef(false);
  const isDirty = doc !== savedDoc;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const save = useCallback(async () => {
    if (!persist || inFlight.current) return;
    inFlight.current = true;
    setIsSaving(true);
    try {
      await persist(doc);
    } catch {
      return;
    } finally {
      inFlight.current = false;
      setIsSaving(false);
    }
    setSavedDoc(doc);
  }, [doc, persist]);

  return { isDirty, isSaving, save };
}
