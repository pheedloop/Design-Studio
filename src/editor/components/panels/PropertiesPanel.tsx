import { useState } from "react";
import type {
  FloorPlanElement,
  ElementProperties,
  Geometry,
  Background,
  LayerId,
  Dimensions,
  ElementTypeDefaults,
} from "@/types";
import { getToolUIConfig } from "@/editor/tools/registry";
import type { PropertiesPanelField } from "@/editor/components/canvas/elements/types";
import { formatMeasurement, formatArea } from "@/utils/unitConversion";
import { elementTypeLabel } from "@/editor/utils/elementLabels";
import { useLocale, useT, type StringKey } from "@/editor/i18n";
import { Button } from "@/components/Button";
import {
  TabBar,
  Slider,
  SectionLabel,
  FieldRow,
  NumberInput,
  TextInput,
  TextArea,
  ColorSwatch,
} from "@/editor/components/ui";
import { JsonDebugView } from "@/editor/components/debug";
import { Row } from "@/components/Row";
import { Stack } from "@/components/Stack";
import { Text } from "@/components/Text";
import { WHITE } from "@/canvasColors";
import { LabelSection } from "./LabelSection";

const TEXT_ALIGN_LABEL: Record<"left" | "center" | "right", StringKey> = {
  center: "editor.textAlign.center",
  left: "editor.textAlign.left",
  right: "editor.textAlign.right",
};

const ARROW_STYLE_LABEL: Record<"triangle" | "chevron", StringKey> = {
  chevron: "editor.arrowStyle.chevron",
  triangle: "editor.arrowStyle.triangle",
};

interface PropertiesPanelProps {
  element: FloorPlanElement | null;
  selectedElements: FloorPlanElement[];
  selectedCount: number;
  isSelectedUnlinked: boolean;
  dimensions: Dimensions;
  background?: Background;
  backgroundColor?: string;
  activeLayerId: LayerId;
  debug: boolean;
  onUpdateProperties: (id: string, updates: Partial<ElementProperties>) => void;
  onPreviewProperties: (
    id: string,
    updates: Partial<ElementProperties>,
  ) => void;
  onBatchUpdateProperties: (updates: Partial<ElementProperties>) => void;
  onUpdateGeometry: (id: string, updates: Partial<Geometry>) => void;
  onDelete: (id: string) => void;
  onBackgroundOpacityChange?: (opacity: number) => void;
  onRemoveBackground?: () => void;
  onUploadBackground?: () => void;
  /** Toggle one DXF layer's visibility — only meaningful when background.kind === "dxf". */
  onToggleDxfLayer?: (layer: string) => void;
  onBackgroundColorChange?: (color: string) => void;
  onUpdateTypeStyles: (
    key: string,
    updates: Partial<ElementTypeDefaults>,
  ) => void;
}

function getCommonValue<T>(
  elements: FloorPlanElement[],
  getter: (el: FloorPlanElement) => T,
): T | undefined {
  if (elements.length === 0) return undefined;
  const vals = elements.map(getter);
  const first = JSON.stringify(vals[0]);
  return vals.every(v => JSON.stringify(v) === first) ? vals[0] : undefined;
}

function getDimensions(element: FloorPlanElement): {
  width: number;
  height: number;
  length: number;
} {
  const geo = element.geometry;
  if (geo.shape === "rect")
    return { width: geo.width, height: geo.height, length: 0 };
  if (geo.shape === "ellipse")
    return { width: geo.radiusX * 2, height: geo.radiusY * 2, length: 0 };
  if (geo.shape === "line") {
    const [x1, y1, x2, y2] = geo.points;
    const dx = x2 - x1;
    const dy = y2 - y1;
    return {
      width: 0,
      height: 0,
      length: Math.round(Math.sqrt(dx * dx + dy * dy)),
    };
  }
  if (geo.shape === "arc") {
    // Approximate arc length using chord + control point deviation
    const [x1, y1, cx, cy, x2, y2] = geo.points;
    const chordLen = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const controlLen =
      Math.sqrt((cx - x1) ** 2 + (cy - y1) ** 2) +
      Math.sqrt((x2 - cx) ** 2 + (y2 - cy) ** 2);
    // Average of chord and control polygon is a reasonable approximation
    return {
      width: 0,
      height: 0,
      length: Math.round((chordLen + controlLen) / 2),
    };
  }
  return { width: 0, height: 0, length: 0 };
}

function extractTypeDefaults(
  props: ElementProperties,
  geometry: Geometry,
): ElementTypeDefaults {
  let defaultWidth: number | undefined;
  let defaultHeight: number | undefined;
  if (geometry.shape === "rect") {
    defaultWidth = geometry.width;
    defaultHeight = geometry.height;
  } else if (geometry.shape === "ellipse") {
    defaultWidth = geometry.radiusX * 2;
    defaultHeight = geometry.radiusY * 2;
  } else if (geometry.shape === "circle") {
    defaultWidth = geometry.radius * 2;
    defaultHeight = geometry.radius * 2;
  }

  return {
    color: props.color,
    strokeColor: props.strokeColor,
    strokeWidth: props.strokeWidth,
    opacity: props.opacity,
    labelColor: props.labelColor,
    labelFontSize: props.labelFontSize,
    labelBold: props.labelBold,
    labelItalic: props.labelItalic,
    labelUnderline: props.labelUnderline,
    labelBackground: props.labelBackground,
    labelVisible: props.labelVisible,
    labelPositionV: props.labelPositionV,
    labelPositionH: props.labelPositionH,
    defaultWidth,
    defaultHeight,
  };
}

export function PropertiesPanel({
  element,
  selectedElements,
  selectedCount,
  isSelectedUnlinked,
  dimensions,
  background,
  backgroundColor,
  activeLayerId,
  debug,
  onUpdateProperties,
  onPreviewProperties,
  onBatchUpdateProperties,
  onUpdateGeometry,
  onDelete,
  onBackgroundOpacityChange,
  onRemoveBackground,
  onUploadBackground,
  onToggleDxfLayer,
  onBackgroundColorChange,
  onUpdateTypeStyles,
}: PropertiesPanelProps) {
  const t = useT();
  const locale = useLocale();
  const [tab, setTab] = useState<"properties" | "debug">("properties");

  if (!element && selectedCount > 1) {
    // Elements that support labels (rects and ellipses, excluding text labels and icons)
    const labelableElements = selectedElements.filter(el => {
      const s = el.geometry.shape;
      return (
        (s === "rect" || s === "ellipse") &&
        el.type !== "label" &&
        el.type !== "icon"
      );
    });
    const hasLabelable = labelableElements.length > 0;

    // Build mixed-state properties for LabelSection
    const mixedProps: Partial<ElementProperties> = hasLabelable
      ? {
          labelPositionV: getCommonValue(
            labelableElements,
            el => el.properties.labelPositionV ?? "middle",
          ) as ElementProperties["labelPositionV"],
          labelPositionH: getCommonValue(
            labelableElements,
            el => el.properties.labelPositionH ?? "center",
          ) as ElementProperties["labelPositionH"],
          labelColor: getCommonValue(
            labelableElements,
            el => el.properties.labelColor ?? WHITE,
          ),
          labelFontSize: getCommonValue(
            labelableElements,
            el => el.properties.labelFontSize ?? 12,
          ),
          labelBold: getCommonValue(
            labelableElements,
            el => el.properties.labelBold ?? true,
          ),
          labelItalic: getCommonValue(
            labelableElements,
            el => el.properties.labelItalic ?? false,
          ),
          labelUnderline: getCommonValue(
            labelableElements,
            el => el.properties.labelUnderline ?? false,
          ),
          labelVisible: getCommonValue(labelableElements, el =>
            el.properties.labelVisible !== false ? true : false,
          ),
          labelBackground: getCommonValue(
            labelableElements,
            el => el.properties.labelBackground,
          ),
        }
      : {};

    const commonOpacity = getCommonValue(
      selectedElements,
      el => el.properties.opacity ?? 1,
    );

    return (
      <div className="w-60 shrink-0 border-l border-border-neutral-light bg-white flex flex-col">
        <div className="px-xs py-xxs border-b border-border-neutral-light">
          <Text size="xs" weight="medium" color="body" as="span">
            {t("editor.selection.count", { count: selectedCount })}
          </Text>
        </div>
        <Stack gap="s" className="p-xs overflow-y-auto flex-1">
          <Stack gap="tight">
            <div className="flex items-center justify-between">
              <SectionLabel>{t("editor.field.opacity")}</SectionLabel>
              <span className="text-xs text-text-subtle">
                {commonOpacity !== undefined
                  ? `${Math.round(commonOpacity * 100)}%`
                  : t("editor.field.mixed")}
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              value={
                commonOpacity !== undefined
                  ? Math.round(commonOpacity * 100)
                  : 100
              }
              onChange={e =>
                onBatchUpdateProperties({
                  opacity: Number(e.target.value) / 100,
                })
              }
              className="w-full"
            />
          </Stack>

          {hasLabelable && (
            <>
              <LabelSection
                properties={mixedProps as ElementProperties}
                onChange={updates => onBatchUpdateProperties(updates)}
              />
              <Row gap="xxs">
                <Button
                  variant="outline"
                  color="neutral"
                  className="flex-1 text-xs"
                  onClick={() =>
                    onBatchUpdateProperties({ labelVisible: false })
                  }
                >
                  {t("editor.label.hideAll")}
                </Button>
                <Button
                  variant="outline"
                  color="neutral"
                  className="flex-1 text-xs"
                  onClick={() =>
                    onBatchUpdateProperties({ labelVisible: true })
                  }
                >
                  {t("editor.label.showAll")}
                </Button>
              </Row>
            </>
          )}
        </Stack>
        <div className="p-xs border-t border-border-neutral-light">
          <Button
            variant="outline"
            color="negative"
            className="w-full"
            onClick={() => onDelete("")}
          >
            {t("editor.action.deleteAll", { count: selectedCount })}
          </Button>
        </div>
      </div>
    );
  }

  if (!element) {
    if (activeLayerId === "background") {
      return (
        <div className="w-60 shrink-0 border-l border-border-neutral-light bg-white flex flex-col">
          <div className="px-xs py-xxs border-b border-border-neutral-light">
            <Text size="xs" weight="medium" color="body" as="span">
              {t("editor.field.background")}
            </Text>
          </div>
          <Stack gap="s" className="p-xs overflow-y-auto flex-1">
            <Stack gap="tight">
              <SectionLabel>{t("editor.field.backgroundColor")}</SectionLabel>
              <ColorSwatch
                label=""
                value={backgroundColor ?? WHITE}
                onChange={c => onBackgroundColorChange?.(c)}
              />
            </Stack>

            <Stack gap="tight">
              <SectionLabel>{t("editor.field.backgroundFile")}</SectionLabel>
              {background ? (
                <Stack gap="xxs">
                  {background.kind === "image" ? (
                    <div
                      className="w-full h-20 rounded border border-border-neutral-light bg-surface-neutral"
                      style={{
                        backgroundImage: `url(${background.url})`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                    />
                  ) : (
                    <div className="text-xs text-text-caption truncate">
                      {background.sourceFileName}
                    </div>
                  )}
                  <Stack gap="tight">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-caption">
                        {t("editor.field.opacity")}
                      </span>
                      <span className="text-xs text-text-subtle">
                        {Math.round(background.opacity * 100)}%
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      value={Math.round(background.opacity * 100)}
                      onChange={e =>
                        onBackgroundOpacityChange?.(
                          Number(e.target.value) / 100,
                        )
                      }
                      className="w-full"
                    />
                  </Stack>

                  {background.kind === "dxf" && (
                    <Stack gap="xxxs">
                      <span className="text-xs text-text-caption">
                        {t("editor.field.layers")}
                      </span>
                      <Stack
                        gap="xxxs"
                        className="max-h-32 overflow-y-auto border border-border-neutral-light rounded-md p-xxs"
                      >
                        {background.layers.map(layer => (
                          <label
                            key={layer}
                            className="flex items-center gap-xxs cursor-pointer text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={
                                !background.hiddenLayers?.includes(layer)
                              }
                              onChange={() => onToggleDxfLayer?.(layer)}
                              className="accent-primary-600"
                            />
                            <span className="flex-1 text-text-body truncate">
                              {layer}
                            </span>
                          </label>
                        ))}
                      </Stack>
                    </Stack>
                  )}

                  <Row gap="xxs">
                    <Button
                      variant="outline"
                      color="neutral"
                      className="flex-1"
                      onClick={onUploadBackground}
                    >
                      {t("editor.background.replace")}
                    </Button>
                    <Button
                      variant="outline"
                      color="negative"
                      className="flex-1"
                      onClick={onRemoveBackground}
                    >
                      {t("editor.background.remove")}
                    </Button>
                  </Row>
                </Stack>
              ) : (
                <button
                  onClick={onUploadBackground}
                  className="w-full text-xs text-text-body border border-border-neutral-light border-dashed rounded px-xxs py-xs hover:bg-surface-neutral cursor-pointer transition-colors"
                >
                  {t("editor.background.uploadCta")}
                </button>
              )}
            </Stack>
          </Stack>
        </div>
      );
    }

    return (
      <div className="w-60 shrink-0 border-l border-border-neutral-light bg-white p-s">
        <p className="text-xs text-text-subtle">
          {t("editor.properties.noSelection")}
        </p>
      </div>
    );
  }

  const geo = element.geometry;
  const config = getToolUIConfig(geo.shape, element.type);
  const fields = new Set<PropertiesPanelField>(config.propertiesPanel);
  const dims = getDimensions(element);

  const handleWidthChange = (w: number) => {
    if (w <= 0) return;
    if (geo.shape === "rect") {
      onUpdateGeometry(element.id, { width: w });
    } else if (geo.shape === "ellipse") {
      onUpdateGeometry(element.id, { radiusX: w / 2 });
    }
  };

  const handleHeightChange = (h: number) => {
    if (h <= 0) return;
    if (geo.shape === "rect") {
      onUpdateGeometry(element.id, { height: h });
    } else if (geo.shape === "ellipse") {
      onUpdateGeometry(element.id, { radiusY: h / 2 });
    }
  };

  return (
    <div className="w-60 shrink-0 border-l border-border-neutral-light bg-white flex flex-col">
      <div className="flex items-center justify-between px-xs py-xxs border-b border-border-neutral-light">
        {debug && (
          <TabBar
            tabs={[
              { id: "properties", label: t("editor.tab.props") },
              { id: "debug", label: t("editor.tab.debug") },
            ]}
            value={tab}
            onChange={id => setTab(id as typeof tab)}
            itemClassName="px-tight py-hair text-xs"
          />
        )}
      </div>
      <div className="flex items-center justify-between px-xs py-xxs border-b border-border-neutral-light">
        <Text size="xs" weight="medium" color="body" as="span">
          {elementTypeLabel(element, t)}
        </Text>
      </div>

      {tab === "debug" && debug ? (
        <div className="flex-1 overflow-auto p-xxs">
          <JsonDebugView data={element} />
        </div>
      ) : (
        <Stack gap="s" className="p-xs overflow-y-auto flex-1">
          {isSelectedUnlinked && (
            <Row
              gap="tight"
              align="start"
              className="px-xxs py-tight rounded bg-red-50 border border-red-200"
            >
              <span className="text-red-500 text-xs font-medium leading-4">
                {t("editor.properties.unlinked")}
              </span>
              <span className="text-red-400 text-xs leading-4">
                {t("editor.properties.unlinkedHint")}
              </span>
            </Row>
          )}
          {fields.has("name") && (
            <Stack gap="tight">
              <SectionLabel>{t("editor.field.name")}</SectionLabel>
              <TextInput
                value={element.properties.name || ""}
                onChange={e =>
                  onUpdateProperties(element.id, { name: e.target.value })
                }
              />
            </Stack>
          )}
          <Stack gap="tight">
            <div className="flex items-center justify-between">
              <SectionLabel>{t("editor.field.opacity")}</SectionLabel>
              <span className="text-xs text-text-subtle">
                {Math.round((element.properties.opacity ?? 1) * 100)}%
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              value={Math.round((element.properties.opacity ?? 1) * 100)}
              onMouseDown={() => {
                // Push current state to undo stack before dragging begins
                onUpdateProperties(element.id, {
                  opacity: element.properties.opacity ?? 1,
                });
              }}
              onChange={e => {
                // Live preview without undo entries
                onPreviewProperties(element.id, {
                  opacity: Number(e.target.value) / 100,
                });
              }}
              className="w-full"
            />
          </Stack>

          {(geo.shape === "rect" ||
            geo.shape === "ellipse" ||
            geo.shape === "polygon" ||
            geo.shape === "circle") &&
            element.type !== "label" &&
            element.type !== "icon" && (
              <LabelSection
                properties={{
                  ...element.properties,
                  labelPositionV: element.properties.labelPositionV ?? "middle",
                  labelPositionH: element.properties.labelPositionH ?? "center",
                }}
                onChange={updates => onUpdateProperties(element.id, updates)}
              />
            )}

          {fields.has("text") && (
            <Stack gap="tight">
              <SectionLabel>{t("editor.field.text")}</SectionLabel>
              <TextArea
                value={element.properties.text || ""}
                rows={2}
                onChange={e =>
                  onUpdateProperties(element.id, { text: e.target.value })
                }
              />
            </Stack>
          )}

          {fields.has("fontSize") && (
            <Stack gap="tight">
              <SectionLabel>{t("editor.field.fontSize")}</SectionLabel>
              <NumberInput
                value={element.properties.fontSize ?? 16}
                onChange={v =>
                  onUpdateProperties(element.id, { fontSize: Math.max(1, v) })
                }
              />
            </Stack>
          )}

          {(fields.has("fontWeight") ||
            fields.has("fontStyle") ||
            fields.has("textDecoration")) && (
            <Stack gap="tight">
              <SectionLabel>{t("editor.field.style")}</SectionLabel>
              <Row gap="xxxs">
                {fields.has("fontWeight") && (
                  <Button
                    variant="outline"
                    color="neutral"
                    active={element.properties.fontWeight === "bold"}
                    className="w-8 h-8 p-0 font-bold"
                    onClick={() =>
                      onUpdateProperties(element.id, {
                        fontWeight:
                          element.properties.fontWeight === "bold"
                            ? "normal"
                            : "bold",
                      })
                    }
                  >
                    B
                  </Button>
                )}
                {fields.has("fontStyle") && (
                  <Button
                    variant="outline"
                    color="neutral"
                    active={element.properties.fontStyle === "italic"}
                    className="w-8 h-8 p-0 italic"
                    onClick={() =>
                      onUpdateProperties(element.id, {
                        fontStyle:
                          element.properties.fontStyle === "italic"
                            ? "normal"
                            : "italic",
                      })
                    }
                  >
                    I
                  </Button>
                )}
                {fields.has("textDecoration") && (
                  <Button
                    variant="outline"
                    color="neutral"
                    active={element.properties.textDecoration === "underline"}
                    className="w-8 h-8 p-0 underline"
                    onClick={() =>
                      onUpdateProperties(element.id, {
                        textDecoration:
                          element.properties.textDecoration === "underline"
                            ? "none"
                            : "underline",
                      })
                    }
                  >
                    U
                  </Button>
                )}
              </Row>
            </Stack>
          )}

          {fields.has("textAlign") && (
            <Stack gap="tight">
              <SectionLabel>{t("editor.field.alignment")}</SectionLabel>
              <div className="flex">
                {(["left", "center", "right"] as const).map(align => (
                  <Button
                    key={align}
                    variant="outline"
                    color="neutral"
                    active={(element.properties.textAlign ?? "left") === align}
                    className={`flex-1 py-xxxs ${
                      align === "left"
                        ? "rounded-r-none"
                        : align === "right"
                          ? "rounded-l-none"
                          : "rounded-none border-l-0 border-r-0"
                    }`}
                    onClick={() =>
                      onUpdateProperties(element.id, { textAlign: align })
                    }
                  >
                    {t(TEXT_ALIGN_LABEL[align])}
                  </Button>
                ))}
              </div>
            </Stack>
          )}

          {(fields.has("width") || fields.has("height")) &&
            (geo.shape === "rect" || geo.shape === "ellipse") && (
              <Stack gap="tight">
                <SectionLabel>{t("editor.field.size")}</SectionLabel>
                {fields.has("width") && (
                  <FieldRow label={t("editor.field.widthShort")}>
                    <NumberInput
                      value={dims.width}
                      onChange={handleWidthChange}
                    />
                  </FieldRow>
                )}
                {fields.has("height") && (
                  <FieldRow label={t("editor.field.heightShort")}>
                    <NumberInput
                      value={dims.height}
                      onChange={handleHeightChange}
                    />
                  </FieldRow>
                )}
              </Stack>
            )}

          {fields.has("rotation") && (
            <Stack gap="tight">
              <SectionLabel>{t("editor.field.rotation")}</SectionLabel>
              <FieldRow label="°">
                <NumberInput
                  value={"rotation" in geo ? (geo.rotation ?? 0) : 0}
                  onChange={r => onUpdateGeometry(element.id, { rotation: r })}
                />
              </FieldRow>
            </Stack>
          )}

          {fields.has("area") && (
            <Stack gap="tight">
              <SectionLabel>{t("editor.field.area")}</SectionLabel>
              <div className="px-xxs py-xxxs text-xs text-text-body bg-surface-neutral rounded border border-border-neutral-light">
                {formatArea(dims.width, dims.height, dimensions, t, locale)}
              </div>
            </Stack>
          )}

          {fields.has("length") && (
            <Stack gap="tight">
              <SectionLabel>{t("editor.field.length")}</SectionLabel>
              <div className="px-xxs py-xxxs text-xs text-text-body bg-surface-neutral rounded border border-border-neutral-light">
                {formatMeasurement(dims.length, dimensions, t, locale)}
              </div>
            </Stack>
          )}

          {fields.has("arrowHeadStyle") && element.properties.arrowHead && (
            <Stack gap="tight">
              <SectionLabel>{t("editor.field.arrowStyle")}</SectionLabel>
              <div className="flex">
                {(["triangle", "chevron"] as const).map(style => (
                  <Button
                    key={style}
                    variant="outline"
                    color="neutral"
                    active={element.properties.arrowHead?.style === style}
                    className={`flex-1 py-xxxs ${
                      style === "triangle" ? "rounded-r-none" : "rounded-l-none"
                    }`}
                    onClick={() =>
                      onUpdateProperties(element.id, {
                        arrowHead: { ...element.properties.arrowHead!, style },
                      })
                    }
                  >
                    {t(ARROW_STYLE_LABEL[style])}
                  </Button>
                ))}
              </div>
            </Stack>
          )}

          {fields.has("arrowHeadSize") && element.properties.arrowHead && (
            <Stack gap="tight">
              <SectionLabel>{t("editor.field.arrowSize")}</SectionLabel>
              <FieldRow label={t("common.unit.px")}>
                <NumberInput
                  value={element.properties.arrowHead.size}
                  onChange={v =>
                    onUpdateProperties(element.id, {
                      arrowHead: {
                        ...element.properties.arrowHead!,
                        size: Math.max(4, v),
                      },
                    })
                  }
                />
              </FieldRow>
            </Stack>
          )}
        </Stack>
      )}

      <Stack gap="xxs" className="p-xs border-t border-border-neutral-light">
        {(element.type === "booth" ||
          element.type === "session_area" ||
          element.type === "meeting_room") && (
          <Button
            variant="outline"
            color="neutral"
            className="w-full text-xs"
            onClick={() =>
              onUpdateTypeStyles(
                element.type,
                extractTypeDefaults(element.properties, element.geometry),
              )
            }
          >
            {t("editor.properties.saveDefaultStyle")}
          </Button>
        )}
        <Button
          variant="outline"
          color="negative"
          className="w-full"
          onClick={() => onDelete(element.id)}
        >
          {t("editor.action.delete")}
        </Button>
      </Stack>
    </div>
  );
}
