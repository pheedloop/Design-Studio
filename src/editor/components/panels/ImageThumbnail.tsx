import { PiTrash } from "react-icons/pi";
import { Stack } from "@/components/Stack";
import { Text } from "@/components/Text";
import { useT } from "@/editor/i18n";
import type { EditorImage } from "@/editor/types";

interface ImageThumbnailProps {
  image: EditorImage;
  isSelected: boolean;
  onSelect: () => void;
  onInsert: () => void;
  onDelete?: () => void;
  /** Reports the browser-measured size when the host supplied none. */
  onMeasure?: (width: number, height: number) => void;
}

export function ImageThumbnail({
  image,
  isSelected,
  onSelect,
  onInsert,
  onDelete,
  onMeasure,
}: ImageThumbnailProps) {
  const t = useT();
  return (
    <Stack gap="xxxs" className="group relative">
      <button
        type="button"
        onClick={onSelect}
        onDoubleClick={onInsert}
        aria-pressed={isSelected}
        className={`h-24 w-24 overflow-hidden rounded border-2 bg-surface-neutral cursor-pointer transition-colors ${
          isSelected
            ? "border-primary-600"
            : "border-transparent hover:border-border-neutral-light"
        }`}
      >
        <img
          src={image.url}
          alt={image.name}
          onLoad={e => {
            if (image.width && image.height) return;
            const { naturalWidth, naturalHeight } = e.currentTarget;
            if (naturalWidth && naturalHeight) {
              onMeasure?.(naturalWidth, naturalHeight);
            }
          }}
          className="h-full w-full object-contain"
        />
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={t("editor.gallery.deleteImage")}
          className={`absolute right-xxxs top-xxxs rounded bg-white/90 p-xxxs text-text-subtle cursor-pointer hover:text-red-600 focus-visible:opacity-100 focus-visible:pointer-events-auto group-hover:opacity-100 group-hover:pointer-events-auto ${
            isSelected ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <PiTrash size={14} />
        </button>
      )}
      <Text
        size="xs"
        color="caption"
        as="span"
        truncate
        title={image.name}
        className="w-24"
      >
        {image.name}
      </Text>
    </Stack>
  );
}
