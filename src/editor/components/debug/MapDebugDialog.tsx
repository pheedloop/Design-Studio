import { useState } from "react";
import { Button } from "@/components/Button";
import { Dialog, TabBar } from "@/editor/components/ui";
import type { FloorPlanData } from "@/types";
import { JsonDebugView } from "./JsonDebugView";
import { useT } from "@/editor/i18n";

interface MapDebugDialogProps {
  data: FloorPlanData;
  onClose: () => void;
}

export function MapDebugDialog({ data, onClose }: MapDebugDialogProps) {
  const t = useT();
  const [tab, setTab] = useState<"tree" | "raw">("tree");

  const tabs = (
    <TabBar
      tabs={[
        { id: "tree", label: t("editor.debug.tree") },
        { id: "raw", label: t("editor.debug.raw") },
      ]}
      value={tab}
      onChange={id => setTab(id as typeof tab)}
      itemClassName="px-2 py-1"
    />
  );

  return (
    <Dialog
      title={t("editor.debug.title")}
      onClose={onClose}
      width="640px"
      maxHeight="80vh"
      headerActions={tabs}
      footer={
        <Button
          variant="ghost"
          color="primary"
          className="px-0"
          onClick={() =>
            navigator.clipboard.writeText(JSON.stringify(data, null, 2))
          }
        >
          {t("editor.debug.copy")}
        </Button>
      }
    >
      <div className="flex-1 overflow-auto p-4">
        {tab === "tree" ? (
          <JsonDebugView data={data} label="FloorPlanData" />
        ) : (
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </Dialog>
  );
}
