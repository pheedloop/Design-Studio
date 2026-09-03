import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 as uuid } from "uuid";
import { useCanvasControls } from "@/editor/hooks/useCanvasControls";
import { useHistory } from "@/editor/hooks/useHistory";
import { Button } from "@/components/Button";
import { IconButton } from "@/components/IconButton";
import { TabBar, type MenuEntry } from "@/editor/components/ui";
import { Row } from "@/components/Row";
import { Text } from "@/components/Text";
import { BadgeTopBar } from "./BadgeTopBar";
import { modKey } from "@/editor/utils/platform";
import { I18nProvider } from "@/i18n/I18nProvider";
import type { Translate } from "./i18n";
import { BadgeCanvas } from "./BadgeCanvas";
import { BadgeRulers } from "./BadgeRulers";
import { AlignmentControls } from "@/editor/components/panels/AlignmentControls";
import {
  alignLeft,
  alignCenterH,
  alignRight,
  alignTop,
  alignCenterV,
  alignBottom,
  distributeH,
  distributeV,
  type FieldMove,
} from "./badgeAlign";
import { fmtUnit, unitLabel, type Unit } from "./units";
import { BadgeSidebar } from "./BadgeSidebar";
import { BadgePreview } from "./BadgePreview";
import { BadgeSetupDialog, type PanelConfig } from "./BadgeSetupDialog";
import { AttendeePicker } from "./AttendeePicker";
import { PropertiesPanel } from "./PropertiesPanel";
import { createField } from "./factory";
import { BadgeImageProvider } from "./BadgeImageProvider";
import { ImageGallery } from "@/editor/components/panels/ImageGallery";
import type { EditorImage } from "@/editor";
import { placedImageSize } from "@/editor/utils/placedImageSize";
import { flatten, foldInvertForPage } from "./serialize";
import { createSampleDocument } from "./sample";
import type { AttendeeOption, AttendeeProvider, BadgeData } from "./badgeData";
import {
  DPI,
  PAGE_COUNT,
  pxToInch,
  pageRoleForIndex,
  pageRoleLabel,
  type BadgeDocument,
  type BadgeField,
  type FlattenResult,
  type FoldType,
  type SlotType,
} from "./model";

export interface BadgeEditorProps {
  /** Initial document. Defaults to a sample card if omitted. */
  initialDocument?: BadgeDocument;
  /** Persist callback. Receives the rich document + the flattened legacy
   *  badge_layout and template dimensions the backend stores. */
  onSave?: (doc: BadgeDocument, flattened: FlattenResult) => void;
  /** Show the debug affordance (badge_layout JSON viewer). */
  debug?: boolean;
  /** Supplies attendee search + badge-data resolution for the live preview.
   *  When omitted, the picker is hidden and fields show placeholders. */
  attendeeProvider?: AttendeeProvider;
  /** Omit for built-in English. Must be referentially stable. */
  translate?: Translate;
  /** BCP-47 tag for number and list formatting. */
  locale?: string;
  images?: EditorImage[];
  onUploadImage?: (file: File) => Promise<void>;
  onDeleteImage?: (id: string) => Promise<void>;
}

/** Reference-grid spacing, in inches. */
const GRID_SPACING_IN = 0.25;

/** True when a keystroke is going to a form field — don't hijack shortcuts. */
function isEditableTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

/**
 * Badge editor. Shares the map/seatplan editor chrome (TopBar, ToolSidebar-style
 * left panel, OptionsBar strip, StatusBar, ui kit) so it feels like the same
 * tool. Add / select / drag / resize all field kinds, edit via the properties
 * panel, with undo/redo, alignment-guide snapping, and clipboard. Supports
 * multi-page folded badges (front/back/inside) that flatten to the legacy
 * badge_layout on Save.
 */
export function BadgeEditor({ translate, locale, ...rest }: BadgeEditorProps) {
  return (
    <I18nProvider translate={translate} locale={locale}>
      <BadgeImageProvider images={rest.images ?? []}>
        <BadgeEditorInner {...rest} />
      </BadgeImageProvider>
    </I18nProvider>
  );
}

/** Split so the body can consume the context the wrapper provides. */
function BadgeEditorInner({
  initialDocument,
  onSave,
  debug,
  images = [],
  onUploadImage,
  onDeleteImage,
  attendeeProvider,
}: Omit<BadgeEditorProps, "translate" | "locale">) {
  const [initial] = useState<BadgeDocument>(
    () => initialDocument ?? createSampleDocument(),
  );
  const {
    present: doc,
    set: setDoc,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<BadgeDocument>(initial);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activePageIndex, setActivePageIndex] = useState(0);
  // View options (mirror the map editor): a reference grid, snap-to-grid, and
  // inch rulers. Rulers are shown by default; the grid and snapping are opt-in
  // so the canvas stays clean and free dragging (with alignment guides) is the
  // default feel.
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(true);
  // User-facing measurement unit. The model stays inch-based internally; this
  // only affects rulers, the setup dialog, and size readouts.
  const [unit, setUnit] = useState<Unit>("in");
  const [showLayout, setShowLayout] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewAttendee, setPreviewAttendee] = useState<AttendeeOption | null>(
    null,
  );
  const [previewData, setPreviewData] = useState<BadgeData | null>(null);
  const clipboard = useRef<BadgeField[]>([]);
  // Mirrors `clipboard.current.length > 0` as real state — the ref itself is
  // only readable in event handlers/effects, never during render (the "Paste"
  // menu item's `disabled` needs to react to a copy immediately, not wait for
  // some unrelated re-render to catch up).
  const [hasClipboard, setHasClipboard] = useState(false);

  // Resolve the selected attendee's badge data (or clear it).
  const selectAttendee = useCallback(
    (option: AttendeeOption | null) => {
      setPreviewAttendee(option);
      if (!option || !attendeeProvider) {
        setPreviewData(null);
        return;
      }
      attendeeProvider
        .resolve(option.id)
        .then(d => setPreviewData(d))
        .catch(() => setPreviewData(null));
    },
    [attendeeProvider],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useCanvasControls(containerRef);

  // Center the badge in the canvas (with a margin), scaling down large badges to
  // fit — used for the initial load and the zoom-reset button, so neither pins
  // the badge to the top-left corner.
  const { fitToBounds, hasMeasured } = controls;
  const fitBadge = useCallback(() => {
    fitToBounds(
      { width: doc.panelSize.width * DPI, height: doc.panelSize.height * DPI },
      { padding: 56, maxScale: 1 },
    );
  }, [fitToBounds, doc.panelSize.width, doc.panelSize.height]);

  // On first load, fit once the viewport has been measured. useLayoutEffect so
  // the fit is applied before the browser paints (no zoom/pan flash).
  const didFit = useRef(false);
  useLayoutEffect(() => {
    if (didFit.current || !hasMeasured) return;
    didFit.current = true;
    fitBadge();
  }, [hasMeasured, fitBadge]);

  // Active page (clamped — fold changes can shrink the page count).
  const pageIndex = Math.min(activePageIndex, doc.pages.length - 1);
  const activePage = doc.pages[pageIndex];

  // Properties panel edits the field only when exactly one is selected.
  const selectedField =
    selectedIds.size === 1
      ? (activePage.fields.find(f => selectedIds.has(f.id)) ?? null)
      : null;
  const flattened = useMemo(() => flatten(doc), [doc]);

  const selectPage = useCallback((i: number) => {
    setActivePageIndex(i);
    setSelectedIds(new Set());
  }, []);

  // --- Selection ---
  const selectField = useCallback((id: string, additive: boolean) => {
    setSelectedIds(prev => {
      if (additive) {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }
      if (prev.has(id) && prev.size > 1) return prev; // keep group for drag
      return new Set([id]);
    });
  }, []);

  const marqueeSelect = useCallback((ids: string[], additive: boolean) => {
    setSelectedIds(prev => {
      if (!additive) return new Set(ids);
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // --- Mutations (target the active page) ---

  const setName = useCallback(
    (name: string) => setDoc(d => ({ ...d, name })),
    [setDoc],
  );

  /** Replace the active page's fields via a transform. */
  const mutateActivePage = useCallback(
    (fn: (fields: BadgeField[]) => BadgeField[]) => {
      setDoc(d => ({
        ...d,
        pages: d.pages.map((p, i) =>
          i === pageIndex ? { ...p, fields: fn(p.fields) } : p,
        ),
      }));
    },
    [setDoc, pageIndex],
  );

  const addField = useCallback(
    (fieldKey: string) => {
      const field = createField(fieldKey);
      mutateActivePage(fields => [...fields, field]);
      setSelectedIds(new Set([field.id]));
    },
    [mutateActivePage],
  );

  const addImageField = useCallback(
    (image: EditorImage) => {
      const { width, height } = placedImageSize(image);
      const field: BadgeField = {
        ...createField("image"),
        code: image.id,
        width: pxToInch(width),
        height: pxToInch(height),
      };
      mutateActivePage(fields => [...fields, field]);
      setSelectedIds(new Set([field.id]));
    },
    [mutateActivePage],
  );

  const updateField = useCallback(
    (id: string, patch: Partial<BadgeField>) => {
      mutateActivePage(fields =>
        fields.map(f => (f.id === id ? { ...f, ...patch } : f)),
      );
    },
    [mutateActivePage],
  );

  /** Commit a (possibly multi-field) move in one history entry. */
  const moveMany = useCallback(
    (updates: { id: string; top: number; left: number }[]) => {
      const byId = new Map(updates.map(u => [u.id, u]));
      mutateActivePage(fields =>
        fields.map(f => {
          const u = byId.get(f.id);
          return u ? { ...f, top: u.top, left: u.left } : f;
        }),
      );
    },
    [mutateActivePage],
  );

  // Alignment — operate on the currently-selected fields, committing the moved
  // positions in one history entry (reuses moveMany).
  const selectedFields = useMemo(
    () => activePage.fields.filter(f => selectedIds.has(f.id)),
    [activePage.fields, selectedIds],
  );
  const runAlign = useCallback(
    (fn: (fields: BadgeField[]) => FieldMove[]) => {
      const moves = fn(selectedFields);
      if (moves.length) moveMany(moves);
    },
    [selectedFields, moveMany],
  );

  const deleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    mutateActivePage(fields => fields.filter(f => !selectedIds.has(f.id)));
    setSelectedIds(new Set());
  }, [mutateActivePage, selectedIds]);

  const copySelected = useCallback(() => {
    const picked = activePage.fields.filter(f => selectedIds.has(f.id));
    if (picked.length) {
      clipboard.current = picked.map(f => ({ ...f }));
      setHasClipboard(true);
    }
  }, [activePage, selectedIds]);

  const pasteClipboard = useCallback(() => {
    if (!clipboard.current.length) return;
    const pasted = clipboard.current.map(src => ({
      ...src,
      id: uuid(),
      top: src.top + 0.15,
      left: src.left + 0.15,
    }));
    mutateActivePage(fields => [...fields, ...pasted]);
    setSelectedIds(new Set(pasted.map(f => f.id)));
  }, [mutateActivePage]);

  // Apply fold/panel-size changes: rebuild the pages array, preserving existing
  // pages' fields and applying the per-panel invert overrides from the dialog.
  const applySetup = useCallback(
    (
      fold: FoldType,
      panelSize: { width: number; height: number },
      panelCfgs: PanelConfig[],
      slots: SlotType,
    ) => {
      setDoc(d => {
        const count = PAGE_COUNT[fold];
        const pages = Array.from({ length: count }, (_, i) => {
          const role = pageRoleForIndex(count, i);
          const cfg = panelCfgs[i];
          const props = {
            role,
            inverted: cfg?.inverted ?? foldInvertForPage(fold, i),
            tearaway: cfg?.tearaway ?? false,
            tearawayCount: cfg?.tearawayCount ?? 3,
          };
          const existing = d.pages[i];
          return existing
            ? { ...existing, ...props }
            : { id: uuid(), fields: [], ...props };
        });
        return { ...d, fold, panelSize, slots, pages };
      });
      setActivePageIndex(idx => Math.min(idx, PAGE_COUNT[fold] - 1));
      setSelectedIds(new Set());
    },
    [setDoc],
  );

  const handleSave = useCallback(() => {
    onSave?.(doc, flatten(doc));
  }, [doc, onSave]);

  // Keyboard: delete, undo/redo, copy/paste (ignored while typing in a form).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      } else if (mod && e.key.toLowerCase() === "c") {
        copySelected();
      } else if (mod && e.key.toLowerCase() === "v") {
        e.preventDefault();
        pasteClipboard();
      } else if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedIds.size
      ) {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    selectedIds,
    deleteSelected,
    undo,
    redo,
    copySelected,
    pasteClipboard,
    handleSave,
  ]);

  // --- Menus ---

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${doc.name || "badge"}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const fileMenu: MenuEntry[] = [
    { label: "Badge Setup…", onClick: () => setShowSetup(true) },
    { type: "divider" },
    ...(onSave
      ? [
          { label: "Save", shortcut: `${modKey}S`, onClick: handleSave },
          { type: "divider" as const },
        ]
      : []),
    { label: "Export as JSON", onClick: exportJson },
  ];

  // Page tabs (front/back/inside) + per-page invert state.
  const pageInverts = doc.pages.map(
    (p, i) => p.inverted ?? foldInvertForPage(doc.fold, i),
  );
  const pageTabs = doc.pages.map((p, i) => ({
    id: String(i),
    label: `${pageRoleLabel(p.role)}${pageInverts[i] ? " ⤓" : ""}`,
  }));

  // Fold edges in the EDITOR view. On the flat sheet panels stack top→bottom, so
  // a page's crease is its top edge (if a panel sits above) and/or bottom edge
  // (if one sits below). But pages are authored upright, and an inverted
  // (folded-back) page prints rotated 180° — which swaps its top/bottom — so its
  // crease shows on the OPPOSITE edge in the editor.
  const physFoldTop = pageIndex > 0;
  const physFoldBottom = pageIndex < doc.pages.length - 1;
  const activeInverted = pageInverts[pageIndex];
  const foldTop = activeInverted ? physFoldBottom : physFoldTop;
  const foldBottom = activeInverted ? physFoldTop : physFoldBottom;

  const editMenu: MenuEntry[] = [
    {
      label: "Undo",
      shortcut: `${modKey}Z`,
      disabled: !canUndo,
      onClick: undo,
    },
    {
      label: "Redo",
      shortcut: `${modKey}⇧Z`,
      disabled: !canRedo,
      onClick: redo,
    },
    { type: "divider" },
    {
      label: selectedIds.size > 1 ? `Copy (${selectedIds.size})` : "Copy",
      shortcut: `${modKey}C`,
      disabled: selectedIds.size === 0,
      onClick: copySelected,
    },
    {
      label: "Paste",
      shortcut: `${modKey}V`,
      disabled: !hasClipboard,
      onClick: pasteClipboard,
    },
    {
      label: selectedIds.size > 1 ? `Delete (${selectedIds.size})` : "Delete",
      shortcut: "⌫",
      disabled: selectedIds.size === 0,
      onClick: deleteSelected,
    },
  ];

  const viewMenu: MenuEntry[] = [
    {
      label: `${showRulers ? "✓ " : "   "}Show Rulers`,
      onClick: () => setShowRulers(s => !s),
    },
    {
      label: `${showGrid ? "✓ " : "   "}Show Grid`,
      onClick: () => setShowGrid(s => !s),
    },
    {
      label: `${snapToGrid ? "✓ " : "   "}Snap to Grid`,
      onClick: () => setSnapToGrid(s => !s),
    },
  ];

  return (
    <div className="pl-map-editor flex flex-col h-full overflow-hidden">
      <BadgeTopBar
        fileMenuItems={fileMenu}
        editMenuItems={editMenu}
        viewMenuItems={viewMenu}
        rightActions={
          <>
            {attendeeProvider && (
              <AttendeePicker
                provider={attendeeProvider}
                value={previewAttendee}
                onChange={selectAttendee}
              />
            )}
            <Button
              variant={previewMode ? "solid" : "outline"}
              color="neutral"
              size="sm"
              onClick={() => setPreviewMode(p => !p)}
            >
              {previewMode ? "Exit preview" : "Full preview"}
            </Button>
          </>
        }
        debug={debug}
        onDebugClick={() => setShowLayout(s => !s)}
      />

      <div className="flex flex-1 overflow-hidden">
        <BadgeSidebar
          name={doc.name ?? "Untitled Badge"}
          onNameChange={setName}
          onAddField={addField}
          onOpenImageGallery={() => setShowImageGallery(true)}
        />

        {/* Main column — OptionsBar on top, [canvas | properties] below, so the
            sidebar and OptionsBar sit side by side (like the map editor). */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          {/* OptionsBar — page tabs (multi-page), the preview banner, and the
              alignment tools (multi-select). Hidden when it would be empty. */}
          {(() => {
            const showAlign = !previewMode && selectedFields.length > 1;
            if (!previewMode && doc.pages.length <= 1 && !showAlign)
              return null;
            return (
              <Row
                gap="xs"
                align="center"
                className="relative z-20 px-xs h-[43px] bg-white border-b border-border-neutral-light shrink-0"
              >
                {!previewMode && doc.pages.length > 1 && (
                  <TabBar
                    tabs={pageTabs}
                    value={String(pageIndex)}
                    onChange={id => selectPage(Number(id))}
                    itemClassName="px-xs py-tight text-xs"
                  />
                )}
                {previewMode && (
                  <span className="text-xs text-text-caption">
                    Full preview · as printed (read-only)
                  </span>
                )}
                <div className="flex-1" />
                {showAlign && (
                  <Row gap="hair" align="center">
                    <AlignmentControls
                      onAlignLeft={() => runAlign(alignLeft)}
                      onAlignCenterH={() => runAlign(alignCenterH)}
                      onAlignRight={() => runAlign(alignRight)}
                      onAlignTop={() => runAlign(alignTop)}
                      onAlignCenterV={() => runAlign(alignCenterV)}
                      onAlignBottom={() => runAlign(alignBottom)}
                      onDistributeH={
                        selectedFields.length >= 3
                          ? () => runAlign(distributeH)
                          : undefined
                      }
                      onDistributeV={
                        selectedFields.length >= 3
                          ? () => runAlign(distributeV)
                          : undefined
                      }
                    />
                  </Row>
                )}
              </Row>
            );
          })()}

          {/* Inner row — canvas + properties, below the OptionsBar */}
          <div className="flex flex-1 overflow-hidden">
            <div className="flex flex-col flex-1 min-w-0 min-h-0">
              {/* Invert ribbon — contextual to the active folded-back panel. */}
              {!previewMode && pageInverts[pageIndex] && (
                <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-xs py-tight text-xs text-amber-700">
                  ⤓ This panel prints upside-down automatically.
                </div>
              )}

              {previewMode ? (
                <div className="flex-1 min-h-0 overflow-hidden">
                  <BadgePreview
                    doc={doc}
                    data={previewData}
                    showRulers={showRulers}
                    unit={unit}
                  />
                </div>
              ) : (
                <div
                  ref={containerRef}
                  className="relative flex-1 min-h-0 overflow-hidden bg-surface-neutral"
                >
                  <BadgeCanvas
                    page={activePage}
                    panelSize={doc.panelSize}
                    data={previewData}
                    slots={doc.slots ?? "none"}
                    isFrontPage={pageIndex === 0}
                    foldTop={foldTop}
                    foldBottom={foldBottom}
                    showGrid={showGrid}
                    snapToGrid={snapToGrid}
                    gridSpacingPx={GRID_SPACING_IN * DPI}
                    selectedIds={selectedIds}
                    onFieldMouseDown={selectField}
                    onClearSelection={clearSelection}
                    onMarqueeSelect={marqueeSelect}
                    onChangeField={updateField}
                    onMoveMany={moveMany}
                    scale={controls.scale}
                    position={controls.position}
                    stageSize={controls.stageSize}
                    stageRef={controls.stageRef}
                    onWheel={controls.handleWheel}
                    onPositionChange={controls.setPosition}
                  />
                  <BadgeRulers
                    visible={showRulers}
                    scale={controls.scale}
                    position={controls.position}
                    stageSize={controls.stageSize}
                    ppi={DPI}
                    unit={unit}
                  />
                </div>
              )}
              {/* Footer — page + overall badge size, and zoom (mirrors StatusBar) */}
              <Row
                align="center"
                justify="between"
                px="xs"
                py="tight"
                className="relative z-20 bg-white border-t border-border-neutral-light text-xs text-text-caption"
              >
                <Row gap="xxs" align="center">
                  <span>
                    Page {fmtUnit(doc.panelSize.width, unit)} ×{" "}
                    {fmtUnit(doc.panelSize.height, unit)} {unitLabel[unit]}
                  </span>
                  <span className="text-text-disabled">·</span>
                  <span>
                    Badge {fmtUnit(doc.panelSize.width, unit)} ×{" "}
                    {fmtUnit(doc.panelSize.height * doc.pages.length, unit)}{" "}
                    {unitLabel[unit]}
                  </span>
                </Row>
                <IconButton
                  size="sm"
                  onClick={fitBadge}
                  className="px-xxs w-auto text-xs text-text-caption"
                  title="Click to fit badge in view"
                >
                  {Math.round(controls.scale * 100)}%
                </IconButton>
              </Row>
            </div>

            {showLayout ? (
              <aside className="w-72 shrink-0 border-l border-border-neutral-light bg-white flex flex-col">
                <div className="px-xs py-xxs border-b border-border-neutral-light text-xs font-medium text-text-body">
                  badge_layout · {flattened.width}" × {flattened.height}"
                </div>
                <pre className="flex-1 overflow-auto text-xs leading-tight p-xs text-text-body">
                  {JSON.stringify(flattened.layout, null, 2)}
                </pre>
              </aside>
            ) : previewMode ? null : selectedIds.size > 1 ? (
              <aside className="w-52 shrink-0 border-l border-border-neutral-light bg-white flex flex-col">
                <Row
                  px="xs"
                  py="xxs"
                  align="center"
                  justify="between"
                  className="border-b border-border-neutral-light"
                >
                  <Text size="xs" weight="medium" color="body" as="span">
                    {selectedIds.size} fields selected
                  </Text>
                  <Button
                    variant="ghost"
                    color="negative"
                    size="sm"
                    onClick={deleteSelected}
                  >
                    Delete
                  </Button>
                </Row>
                <p className="p-xs text-xs text-text-subtle">
                  Drag to move them together, or select a single field to edit
                  its properties.
                </p>
              </aside>
            ) : (
              <PropertiesPanel
                field={selectedField}
                onChange={patch =>
                  selectedField && updateField(selectedField.id, patch)
                }
                onDelete={deleteSelected}
              />
            )}
          </div>
        </div>
      </div>

      {showImageGallery && (
        <ImageGallery
          images={images}
          onUpload={onUploadImage}
          onDelete={onDeleteImage}
          onConfirm={image => {
            addImageField(image);
            setShowImageGallery(false);
          }}
          onClose={() => setShowImageGallery(false)}
        />
      )}

      {showSetup && (
        <BadgeSetupDialog
          fold={doc.fold}
          panelSize={doc.panelSize}
          pages={doc.pages}
          slots={doc.slots ?? "none"}
          unit={unit}
          onUnitChange={setUnit}
          onApply={applySetup}
          onClose={() => setShowSetup(false)}
        />
      )}
    </div>
  );
}
