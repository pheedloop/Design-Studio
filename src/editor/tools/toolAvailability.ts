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

export function isToolAvailable(
  tool: ActiveTool,
  features: FeatureMap,
): boolean {
  const feature = toolFeature(tool);
  return feature === null || features[feature] === "enabled";
}
