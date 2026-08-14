import { useState } from "react";
import { Dialog, TabBar } from "../ui";
import { useT, type StringKey, type T } from "../../i18n";

const isMac = navigator.platform.toUpperCase().includes("MAC");
const mod = isMac ? "⌘" : "Ctrl";

type HelpTab = "start" | "shortcuts" | "menus";

interface Shortcut {
  /** Keycap combo, rendered as-is. */
  keys: string;
  /** Set instead of `keys` when the label is words rather than keycaps. */
  keysKey?: StringKey;
  descriptionKey: StringKey;
}

const shortcuts: { categoryKey: StringKey; items: Shortcut[] }[] = [
  {
    categoryKey: "editor.help.category.tools",
    items: [
      { keys: "H", descriptionKey: "editor.help.shortcut.hand" },
      { keys: "V", descriptionKey: "editor.help.shortcut.select" },
      { keys: "R", descriptionKey: "editor.help.shortcut.rectangle" },
      { keys: "O", descriptionKey: "editor.help.shortcut.ellipse" },
      { keys: "L", descriptionKey: "editor.help.shortcut.line" },
      { keys: "A", descriptionKey: "editor.help.shortcut.arrow" },
      { keys: "C", descriptionKey: "editor.help.shortcut.arc" },
      { keys: "P", descriptionKey: "editor.help.shortcut.polygon" },
      { keys: "T", descriptionKey: "editor.help.shortcut.text" },
      { keys: "I", descriptionKey: "editor.help.shortcut.icon" },
      { keys: "M", descriptionKey: "editor.help.shortcut.measure" },
    ],
  },
  {
    categoryKey: "editor.help.category.pathingTools",
    items: [
      { keys: "V", descriptionKey: "editor.help.shortcut.selectPan" },
      { keys: "W", descriptionKey: "editor.help.shortcut.paintWalkable" },
      { keys: "E", descriptionKey: "editor.help.shortcut.paintImpassable" },
      { keys: "R", descriptionKey: "editor.help.shortcut.rectangleFill" },
    ],
  },
  {
    categoryKey: "editor.help.category.edit",
    items: [
      { keys: `${mod}+Z`, descriptionKey: "editor.menu.undo" },
      { keys: `${mod}+Shift+Z`, descriptionKey: "editor.menu.redo" },
      { keys: `${mod}+C`, descriptionKey: "editor.menu.copy" },
      { keys: `${mod}+V`, descriptionKey: "editor.menu.paste" },
      { keys: `${mod}+D`, descriptionKey: "editor.menu.duplicate" },
      { keys: `${mod}+A`, descriptionKey: "editor.help.shortcut.selectAll" },
      { keys: "Delete", descriptionKey: "editor.help.shortcut.deleteSelected" },
      { keys: "Escape", descriptionKey: "editor.help.shortcut.escape" },
    ],
  },
  {
    categoryKey: "editor.help.category.groups",
    items: [
      { keys: `${mod}+G`, descriptionKey: "editor.help.shortcut.group" },
      { keys: `${mod}+Shift+G`, descriptionKey: "editor.group.ungroup" },
      {
        keys: "",
        keysKey: "editor.help.keys.doubleClick",
        descriptionKey: "editor.help.shortcut.enterGroup",
      },
      { keys: "Escape", descriptionKey: "editor.help.shortcut.exitGroup" },
    ],
  },
  {
    categoryKey: "editor.help.category.canvas",
    items: [
      {
        keys: "",
        keysKey: "editor.help.keys.scroll",
        descriptionKey: "editor.help.shortcut.zoom",
      },
      {
        keys: "",
        keysKey: "editor.help.keys.handThenDrag",
        descriptionKey: "editor.help.shortcut.panHand",
      },
      {
        keys: "",
        keysKey: "editor.help.keys.spaceDrag",
        descriptionKey: "editor.help.shortcut.pan",
      },
      {
        keys: "",
        keysKey: "editor.help.keys.shiftDrag",
        descriptionKey: "editor.help.shortcut.constrain",
      },
      {
        keys: "",
        keysKey: "editor.help.keys.shiftRotate",
        descriptionKey: "editor.help.shortcut.snapRotate",
      },
      {
        keys: "",
        keysKey: "editor.help.keys.shiftLineArrow",
        descriptionKey: "editor.help.shortcut.snapLine",
      },
      {
        keys: "",
        keysKey: "editor.help.keys.shiftPolygon",
        descriptionKey: "editor.help.shortcut.snapPolygon",
      },
      {
        keys: "",
        keysKey: "editor.help.keys.shiftMeasure",
        descriptionKey: "editor.help.shortcut.snapMeasure",
      },
      {
        keys: "",
        keysKey: "editor.help.keys.shiftCalibrate",
        descriptionKey: "editor.help.shortcut.snapCalibrate",
      },
    ],
  },
  {
    categoryKey: "editor.help.category.selection",
    items: [
      {
        keys: "",
        keysKey: "editor.help.keys.click",
        descriptionKey: "editor.help.shortcut.selectElement",
      },
      {
        keys: "",
        keysKey: "editor.help.keys.clickGroupMember",
        descriptionKey: "editor.help.shortcut.selectGroup",
      },
      {
        keys: "",
        keysKey: "editor.help.keys.shiftClick",
        descriptionKey: "editor.help.shortcut.addRemove",
      },
      {
        keys: "",
        keysKey: "editor.help.keys.dragEmpty",
        descriptionKey: "editor.help.shortcut.dragSelect",
      },
      {
        keys: "",
        keysKey: "editor.help.keys.rightClick",
        descriptionKey: "editor.help.shortcut.contextMenu",
      },
    ],
  },
];

const menus: { nameKey: StringKey; itemKeys: StringKey[] }[] = [
  {
    nameKey: "editor.menu.file",
    itemKeys: ["editor.menu.exportPng", "editor.menu.exportJson", "editor.menu.importJson"],
  },
  {
    nameKey: "editor.menu.edit",
    itemKeys: [
      "editor.menu.undo",
      "editor.menu.redo",
      "editor.menu.copy",
      "editor.menu.paste",
      "editor.menu.duplicate",
    ],
  },
  {
    nameKey: "editor.menu.view",
    itemKeys: [
      "editor.menu.showRulers",
      "editor.menu.showGrid",
      "editor.menu.snapToGrid",
      "editor.menu.snapToObjects",
    ],
  },
  {
    nameKey: "editor.menu.tools",
    itemKeys: ["editor.menu.configureGrid", "editor.menu.canvasSize", "editor.menu.setScale"],
  },
];

const GETTING_STARTED: { headingKey: StringKey; bulletKeys: StringKey[] }[] = [
  {
    headingKey: "editor.help.section.modes",
    bulletKeys: [
      "editor.help.modes.tabs",
      "editor.help.modes.design",
      "editor.help.modes.placement",
    ],
  },
  {
    headingKey: "editor.help.section.placing",
    bulletKeys: [
      "editor.help.placing.switch",
      "editor.help.placing.drag",
      "editor.help.placing.shape",
      "editor.help.placing.drop",
      "editor.help.placing.dimmed",
    ],
  },
  {
    headingKey: "editor.help.section.drawing",
    bulletKeys: [
      "editor.help.drawing.select",
      "editor.help.drawing.click",
      "editor.help.drawing.optionsBar",
      "editor.help.drawing.arrow",
      "editor.help.drawing.arc",
      "editor.help.drawing.polygon",
      "editor.help.drawing.handles",
      "editor.help.drawing.snap",
    ],
  },
  {
    headingKey: "editor.help.section.grouping",
    bulletKeys: [
      "editor.help.grouping.group",
      "editor.help.grouping.selectWhole",
      "editor.help.grouping.enter",
      "editor.help.grouping.exit",
      "editor.help.grouping.ungroup",
    ],
  },
  {
    headingKey: "editor.help.section.layers",
    bulletKeys: [
      "editor.help.layers.open",
      "editor.help.layers.four",
      "editor.help.layers.active",
      "editor.help.layers.selectable",
      "editor.help.layers.visibility",
    ],
  },
  {
    headingKey: "editor.help.section.scale",
    bulletKeys: [
      "editor.help.scale.setScale",
      "editor.help.scale.units",
      "editor.help.scale.snap",
      "editor.help.scale.displayUnits",
      "editor.help.scale.rulers",
      "editor.help.scale.measure",
    ],
  },
  {
    headingKey: "editor.help.section.wayfinding",
    bulletKeys: [
      "editor.help.wayfinding.switch",
      "editor.help.wayfinding.tools",
      "editor.help.wayfinding.cells",
      "editor.help.wayfinding.autoAisles",
      "editor.help.wayfinding.autoObstacles",
      "editor.help.wayfinding.adjust",
      "editor.help.wayfinding.routes",
    ],
  },
];

interface HelpDialogProps {
  onClose: () => void;
}

export function HelpDialog({ onClose }: HelpDialogProps) {
  const t: T = useT();
  const [tab, setTab] = useState<HelpTab>("start");

  return (
    <Dialog title={t("editor.help.title")} onClose={onClose} width="520px" maxHeight="80vh">
      <div className="px-4 pt-3 border-b border-gray-200">
        <TabBar
          tabs={[
            { id: "start", label: t("editor.help.tab.gettingStarted") },
            { id: "shortcuts", label: t("editor.help.tab.shortcuts") },
            { id: "menus", label: t("editor.help.tab.menus") },
          ]}
          value={tab}
          onChange={(id) => setTab(id as HelpTab)}
          itemClassName="px-3 py-1.5 text-xs"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "start" &&
          GETTING_STARTED.map((section, index) => (
            <div key={section.headingKey}>
              <h3
                className={`text-xs font-semibold text-gray-800 mb-2 ${index > 0 ? "mt-4" : ""}`}
              >
                {t(section.headingKey)}
              </h3>
              <ul className="text-xs text-gray-600 space-y-1.5">
                {section.bulletKeys.map((bulletKey) => (
                  <li key={bulletKey}>{t(bulletKey, { mod })}</li>
                ))}
              </ul>
            </div>
          ))}

        {tab === "shortcuts" &&
          shortcuts.map((section) => (
            <div key={section.categoryKey} className="mb-4">
              <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                {t(section.categoryKey)}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <div
                    key={item.descriptionKey}
                    className="flex items-center justify-between py-0.5"
                  >
                    <span className="text-xs text-gray-600">{t(item.descriptionKey)}</span>
                    <kbd className="text-[10px] font-mono text-gray-500 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">
                      {item.keysKey ? t(item.keysKey) : item.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

        {tab === "menus" && (
          <>
            <p className="text-xs text-gray-500 mb-4">{t("editor.help.menusIntro")}</p>
            {menus.map((menu) => (
              <div key={menu.nameKey} className="mb-4">
                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                  {t(menu.nameKey)}
                </div>
                <div className="space-y-1">
                  {menu.itemKeys.map((itemKey) => (
                    <div key={itemKey} className="text-xs text-gray-600 py-0.5 pl-2">
                      {t(itemKey)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </Dialog>
  );
}
