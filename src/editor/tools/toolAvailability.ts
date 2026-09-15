import type { ActiveTool } from "@/editor/types";
import type { FeatureKey, FeatureMap } from "@/tiers";
import { TOOL_MAP } from "./registry";

export function isNavigationTool(toolId: string): boolean {
  return toolId === "hand" || toolId === "select";
}

/**
 * The tier feature gating a tool, or null when nothing gates it. Navigation is
 * never gated; anything else falls back to drawingTools unless its definition
 * names another feature.
 */
export function toolFeature(toolId: string): FeatureKey | null {
  if (isNavigationTool(toolId)) return null;
  return TOOL_MAP.get(toolId)?.feature ?? "drawingTools";
}

/** Whether the toolbar renders this tool at all. */
export function isToolVisible(toolId: string, features: FeatureMap): boolean {
  const feature = toolFeature(toolId);
  if (!feature) return true;
  const state = features[feature];
  if (state === "hidden") return false;
  if (state === "locked") return TOOL_MAP.get(toolId)?.whenLocked !== "hide";
  return true;
}

export function isToolAvailable(
  tool: ActiveTool,
  features: FeatureMap,
): boolean {
  const feature = toolFeature(tool);
  return feature === null || features[feature] === "enabled";
}
