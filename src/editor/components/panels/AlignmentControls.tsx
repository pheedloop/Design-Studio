import { Fragment } from "react";
import { IconButton } from "@/components/IconButton";
import { useT, type StringKey } from "@/editor/i18n";
import { AlignmentGlyph, type AlignmentGlyphName } from "./alignmentIcons";

export interface AlignmentControlsProps {
  onAlignLeft?: () => void;
  onAlignCenterH?: () => void;
  onAlignRight?: () => void;
  onAlignTop?: () => void;
  onAlignCenterV?: () => void;
  onAlignBottom?: () => void;
  onDistributeH?: () => void;
  onDistributeV?: () => void;
}

/** Render order. A divider goes between adjacent groups that both have items. */
const GROUPS: {
  prop: keyof AlignmentControlsProps;
  glyph: AlignmentGlyphName;
  labelKey: StringKey;
}[][] = [
  [
    { prop: "onAlignLeft", glyph: "alignLeft", labelKey: "editor.align.left" },
    {
      prop: "onAlignCenterH",
      glyph: "alignCenterH",
      labelKey: "editor.align.centerH",
    },
    {
      prop: "onAlignRight",
      glyph: "alignRight",
      labelKey: "editor.align.right",
    },
  ],
  [
    { prop: "onAlignTop", glyph: "alignTop", labelKey: "editor.align.top" },
    {
      prop: "onAlignCenterV",
      glyph: "alignCenterV",
      labelKey: "editor.align.centerV",
    },
    {
      prop: "onAlignBottom",
      glyph: "alignBottom",
      labelKey: "editor.align.bottom",
    },
  ],
  [
    {
      prop: "onDistributeH",
      glyph: "distributeH",
      labelKey: "editor.distribute.horizontal",
    },
    {
      prop: "onDistributeV",
      glyph: "distributeV",
      labelKey: "editor.distribute.vertical",
    },
  ],
];

/**
 * The align + distribute icon cluster shared by the map editor's OptionsBar and
 * the badge editor. Renders a fragment (no wrapper) so it drops into an existing
 * `flex items-center gap-0.5` row; each button appears only when its handler is
 * provided. Distribute handlers are typically passed only with ≥3 units.
 */
export function AlignmentControls(props: AlignmentControlsProps) {
  const t = useT();
  const groups = GROUPS.map(group =>
    group.filter(tool => props[tool.prop] !== undefined),
  );

  return (
    <>
      {groups.map((group, i) => {
        if (group.length === 0) return null;
        const precededByContent = groups.slice(0, i).some(g => g.length > 0);
        return (
          <Fragment key={i}>
            {precededByContent && (
              <div className="w-px h-3.5 bg-gray-200 shrink-0 mx-0.5" />
            )}
            {group.map(({ prop, glyph, labelKey }) => (
              <IconButton
                key={prop}
                size="sm"
                title={t(labelKey)}
                onClick={props[prop]}
              >
                <AlignmentGlyph name={glyph} />
              </IconButton>
            ))}
          </Fragment>
        );
      })}
    </>
  );
}
