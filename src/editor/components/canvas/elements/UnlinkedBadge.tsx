import { Text } from "react-konva";
import { useT } from "../../../i18n";

/** Corner marker on a shape with no record linked to it. */
export function UnlinkedBadge() {
  const t = useT();
  return (
    <Text
      text={t("editor.properties.unlinked")}
      x={3}
      y={14}
      fontSize={9}
      fill="#ef4444"
      listening={false}
    />
  );
}
