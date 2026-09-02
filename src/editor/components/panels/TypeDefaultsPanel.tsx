import type { TypeStyles, ElementTypeDefaults } from "@/types";
import { DEFAULT_TYPE_STYLES } from "@/types";
import { Stack } from "@/components/Stack";
import { TypeSection } from "./TypeSection";

interface TypeDefaultsPanelProps {
  typeStyles: TypeStyles;
  /** Restricts which type sections render (the active product's object types). */
  typeKeys?: string[];
  onUpdateTypeStyles: (
    key: string,
    updates: Partial<ElementTypeDefaults>,
  ) => void;
}

export function TypeDefaultsPanel({
  typeStyles,
  typeKeys,
  onUpdateTypeStyles,
}: TypeDefaultsPanelProps) {
  const merged: TypeStyles = { ...DEFAULT_TYPE_STYLES, ...typeStyles };
  const keys = typeKeys ?? Object.keys(merged);

  return (
    <Stack gap="xxs">
      {keys.map(key => (
        <TypeSection
          key={key}
          typeKey={key}
          defaults={merged[key] ?? {}}
          onChange={updates => onUpdateTypeStyles(key, updates)}
        />
      ))}
    </Stack>
  );
}
