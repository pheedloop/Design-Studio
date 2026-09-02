import { useState, useRef } from "react";
import { PiStack, PiEye, PiEyeSlash } from "react-icons/pi";
import type { LayerDefinition, LayerId } from "@/types";
import type { FeatureMap } from "@/tiers";
import { showTrophy } from "@/tiers";
import { IconButton } from "@/components/IconButton";
import { TrophyIcon } from "@/editor/components/ui";
import { useT } from "@/editor/i18n";
import { useDismiss } from "@/hooks/useDismiss";

interface LayerPanelProps {
  layers: LayerDefinition[];
  activeLayerId: LayerId;
  onSetActiveLayer: (id: LayerId) => void;
  onToggleVisibility: (id: LayerId) => void;
  topOffset?: number;
  /** Resolved usage-tier capabilities — gates the wayfinding (pathing) layer. */
  features: FeatureMap;
}

const LAYER_COLORS: Record<LayerId, string> = {
  background: "#9ca3af",
  content: "#007bff",
  pathing: "#f59e0b",
  markup: "#10b981",
};

export function LayerPanel({
  layers,
  activeLayerId,
  onSetActiveLayer,
  onToggleVisibility,
  topOffset = 8,
  features,
}: LayerPanelProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useDismiss(panelRef, () => setOpen(false), open);

  const activeLayer = layers.find(l => l.id === activeLayerId);

  return (
    <div
      ref={panelRef}
      className="absolute right-2 z-[9001]"
      style={{ top: topOffset }}
    >
      <div className="flex items-center gap-1.5">
        {activeLayer && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-lg shadow-md text-xs text-text-body">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: LAYER_COLORS[activeLayer.id] }}
            />
            {activeLayer.name}
          </div>
        )}
        <IconButton
          active={open}
          onClick={() => setOpen(prev => !prev)}
          className={`shadow-md border ${open ? "border-primary-600" : "border-gray-200 bg-white hover:bg-surface-neutral"}`}
          title={t("editor.field.layers")}
        >
          <PiStack size={18} />
        </IconButton>
      </div>

      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[180px]">
          {layers.map(layer => {
            // Wayfinding gates the pathing layer: hide it entirely, or lock it.
            const locked =
              layer.id === "pathing" && features.wayfinding === "locked";
            if (layer.id === "pathing" && features.wayfinding === "hidden")
              return null;

            const isActive = layer.id === activeLayerId;
            return (
              <div
                key={layer.id}
                title={locked ? t("editor.premiumFeature") : undefined}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
                  locked
                    ? "text-gray-300 cursor-not-allowed"
                    : isActive
                      ? "bg-gray-100 font-semibold text-gray-800 cursor-pointer"
                      : "text-text-body hover:bg-surface-neutral cursor-pointer"
                }`}
                onClick={locked ? undefined : () => onSetActiveLayer(layer.id)}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: LAYER_COLORS[layer.id] }}
                />
                <span className="flex-1">{layer.name}</span>
                {locked ? (
                  showTrophy("wayfinding", features) && <TrophyIcon size={12} />
                ) : (
                  <IconButton
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      onToggleVisibility(layer.id);
                    }}
                    title={
                      layer.visible
                        ? t("editor.layer.hide")
                        : t("editor.layer.show")
                    }
                  >
                    {layer.visible ? (
                      <PiEye size={14} />
                    ) : (
                      <PiEyeSlash size={14} />
                    )}
                  </IconButton>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
