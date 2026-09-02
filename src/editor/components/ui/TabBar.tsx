import { Button } from "@/components/Button";

interface TabDef {
  id: string;
  label: string;
}

interface TabBarProps {
  tabs: TabDef[];
  value: string;
  onChange: (id: string) => void;
  /** Extra className applied to each tab button (e.g. custom padding) */
  itemClassName?: string;
  className?: string;
}

export function TabBar({
  tabs,
  value,
  onChange,
  itemClassName,
  className,
}: TabBarProps) {
  return (
    <div className={["flex", className].filter(Boolean).join(" ")}>
      {tabs.map((tab, i) => {
        const isFirst = i === 0;
        const isLast = i === tabs.length - 1;
        const shapeClass = isFirst
          ? "rounded-r-none"
          : isLast
            ? "rounded-l-none border-l-0"
            : "rounded-none border-l-0";
        return (
          <Button
            key={tab.id}
            variant="outline"
            color="primary"
            active={value === tab.id}
            className={[shapeClass, itemClassName].filter(Boolean).join(" ")}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}
