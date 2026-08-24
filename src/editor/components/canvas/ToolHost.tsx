import { useEffect } from "react";
import type {
  ToolContext,
  ToolDefinition,
  ToolInteraction,
} from "@/editor/tools/types";

/**
 * Runs a tool's `useInteraction` hook and renders its preview. Canvas mounts it
 * with `key={tool.id}`, so switching tool remounts and resets the tool's hooks.
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
