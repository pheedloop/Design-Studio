import { JSONTree } from "react-json-tree";

const theme = {
  scheme: "pheedloop",
  base00: "#ffffff",
  base01: "#f5f8fc",
  base02: "#e9edf6",
  base03: "#8295ac",
  base04: "#5b708b",
  base05: "#263b5a",
  base06: "#152841",
  base07: "#09203a",
  base08: "#eb5757",
  base09: "#f39c12",
  base0A: "#f1c40f",
  base0B: "#27ae60",
  base0C: "#3498db",
  base0D: "#007bff",
  base0E: "#9b59b6",
  base0F: "#e74c3c",
};

interface JsonDebugViewProps {
  data: unknown;
  label?: string;
}

export function JsonDebugView({ data, label }: JsonDebugViewProps) {
  return (
    <div className="text-xs overflow-auto">
      <JSONTree
        data={data}
        theme={theme}
        invertTheme={false}
        hideRoot={!label}
        labelRenderer={
          label
            ? ([key]) => <strong>{key === "root" ? label : key}:</strong>
            : undefined
        }
        shouldExpandNodeInitially={(_keyPath, _data, level) => level < 2}
      />
    </div>
  );
}
