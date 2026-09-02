import { useRef, useState } from "react";
import type { Legend, LegendEntry } from "@/types";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { IconButton } from "@/components/IconButton";
import { Dialog, TextInput, ColorSwatch } from "@/editor/components/ui";
import {
  PiEye,
  PiEyeSlash,
  PiArrowUp,
  PiArrowDown,
  PiTrash,
  PiPlus,
} from "react-icons/pi";
import { useT } from "@/editor/i18n";

interface LegendDialogProps {
  legend: Legend;
  onSave: (legend: Legend) => void;
  onClose: () => void;
}

export function LegendDialog({ legend, onSave, onClose }: LegendDialogProps) {
  const t = useT();
  const [local, setLocal] = useState<Legend>(() => ({
    ...legend,
    entries: legend.entries.map(e => ({ ...e })),
  }));

  const initialSnapshot = useRef(JSON.stringify(legend));

  const updateEntry = (id: string, updates: Partial<LegendEntry>) => {
    setLocal(prev => ({
      ...prev,
      entries: prev.entries.map(e => (e.id === id ? { ...e, ...updates } : e)),
    }));
  };

  const addEntry = () => {
    setLocal(prev => ({
      ...prev,
      entries: [
        ...prev.entries,
        { id: crypto.randomUUID(), label: "", color: "#4A90D9", visible: true },
      ],
    }));
  };

  const removeEntry = (id: string) => {
    setLocal(prev => ({
      ...prev,
      entries: prev.entries.filter(e => e.id !== id),
    }));
  };

  const moveEntry = (id: string, direction: "up" | "down") => {
    setLocal(prev => {
      const entries = [...prev.entries];
      const idx = entries.findIndex(e => e.id === id);
      if (idx === -1) return prev;
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= entries.length) return prev;
      [entries[idx], entries[target]] = [entries[target], entries[idx]];
      return { ...prev, entries };
    });
  };

  const handleDone = () => {
    if (JSON.stringify(local) !== initialSnapshot.current) {
      onSave(local);
    }
    onClose();
  };

  return (
    <Dialog
      title={t("common.legend")}
      onClose={handleDone}
      width="440px"
      maxHeight="80vh"
      footer={
        <Button variant="solid" color="primary" onClick={handleDone}>
          {t("editor.action.done")}
        </Button>
      }
    >
      <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
        {/* Global visibility toggle */}
        <Checkbox
          label={t("editor.legend.showOnMap")}
          checked={local.visible}
          onChange={v => setLocal(prev => ({ ...prev, visible: v }))}
        />

        {/* Entry list */}
        {local.entries.length > 0 && (
          <div className="flex flex-col gap-2">
            {local.entries.map((entry, idx) => (
              <div key={entry.id} className="flex items-center gap-2">
                <ColorSwatch
                  label=""
                  value={entry.color}
                  onChange={c => updateEntry(entry.id, { color: c })}
                />
                <div className="flex-1">
                  <TextInput
                    value={entry.label}
                    onChange={e =>
                      updateEntry(entry.id, { label: e.target.value })
                    }
                    placeholder={t("editor.legend.labelPlaceholder")}
                  />
                </div>
                <IconButton
                  variant="bare"
                  onClick={() =>
                    updateEntry(entry.id, { visible: !entry.visible })
                  }
                  title={
                    entry.visible
                      ? t("editor.legend.hideEntry")
                      : t("editor.legend.showEntry")
                  }
                >
                  {entry.visible ? (
                    <PiEye size={15} />
                  ) : (
                    <PiEyeSlash size={15} className="text-red-400" />
                  )}
                </IconButton>
                <IconButton
                  variant="bare"
                  onClick={() => moveEntry(entry.id, "up")}
                  disabled={idx === 0}
                  title={t("editor.action.moveUp")}
                >
                  <PiArrowUp size={13} />
                </IconButton>
                <IconButton
                  variant="bare"
                  onClick={() => moveEntry(entry.id, "down")}
                  disabled={idx === local.entries.length - 1}
                  title={t("editor.action.moveDown")}
                >
                  <PiArrowDown size={13} />
                </IconButton>
                {/* Raw: the red hover marks the destructive action, and a tone
                    prop for one site fails the ≥2-consumer bar. */}
                <button
                  className="p-1 rounded text-text-subtle hover:text-red-500 transition-colors cursor-pointer"
                  onClick={() => removeEntry(entry.id)}
                  title={t("editor.legend.removeEntry")}
                >
                  <PiTrash size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {local.entries.length === 0 && (
          <p className="text-xs text-text-subtle text-center py-2">
            {t("editor.legend.empty")}
          </p>
        )}

        {/* Add entry */}
        <button
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors cursor-pointer self-start"
          onClick={addEntry}
        >
          <PiPlus size={13} />
          {t("editor.legend.addEntry")}
        </button>
      </div>
    </Dialog>
  );
}
