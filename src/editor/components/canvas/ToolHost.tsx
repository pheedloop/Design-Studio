import { useEffect } from "react";
import type {
  ToolContext,
  ToolDefinition,
  ToolInteraction,
} from "@/editor/tools/types";

/**
 * Bridges a tool into the canvas: calls the tool's own `useInteraction` hook and
 * renders its preview. Mounted with `key={tool.id}` by Canvas, so switching tool
 * unmounts this and remounts it — which is what gives each tool's hooks a clean
 * lifecycle instead of carrying the previous tool's state over.
 */
export function ToolHost({
  tool,
  context,
  onInteraction,
}: {
  tool: ToolDefinition;
  context: ToolContext;
  onInteraction: (interaction: ToolInteraction) => void;
}) {
  const interaction = tool.useInteraction(context);

  useEffect(() => {
    onInteraction(interaction);
  });

  // Key listener for tools that need it (e.g. arc Escape to cancel)
  useEffect(() => {
    if (!interaction.handleKeyDown) return;
    const handler = interaction.handleKeyDown;
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [interaction.handleKeyDown]);

  // Render preview if the tool has one
  const Preview = tool.PreviewComponent;
  return Preview ? (
    <Preview
      state={interaction.state}
      scale={context.scale}
      dimensions={context.data.dimensions}
    />
  ) : null;
}
