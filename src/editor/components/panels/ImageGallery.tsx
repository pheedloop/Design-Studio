import { useMemo, useRef, useState } from "react";
import { PiMagnifyingGlass, PiUploadSimple } from "react-icons/pi";
import { Button } from "@/components/Button";
import { Row } from "@/components/Row";
import { Stack } from "@/components/Stack";
import { Text } from "@/components/Text";
import { Dialog, TabBar, TextInput } from "@/editor/components/ui";
import { useLocale, useT, type StringKey } from "@/editor/i18n";
import type { EditorImage } from "@/editor/types";
import { filterAndSortImages, type GallerySort } from "./galleryFilter";
import { ImageThumbnail } from "./ImageThumbnail";

const ACCEPT = "image/png,image/jpeg,image/gif,image/svg+xml";

const SORTS: { id: GallerySort; labelKey: StringKey }[] = [
  { id: "recent", labelKey: "editor.gallery.sortRecent" },
  { id: "name", labelKey: "editor.gallery.sortName" },
  { id: "type", labelKey: "editor.gallery.sortType" },
];

interface ImageGalleryProps {
  images: EditorImage[];
  onUpload?: (file: File) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onConfirm: (image: EditorImage) => void;
  onClose: () => void;
}

export function ImageGallery({
  images,
  onUpload,
  onDelete,
  onConfirm,
  onClose,
}: ImageGalleryProps) {
  const t = useT();
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<GallerySort>("recent");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<StringKey | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(
    () => filterAndSortImages(images, query, sort, locale),
    [images, query, sort, locale],
  );
  const selected = visible.find(image => image.id === selectedId) ?? null;

  const upload = async (file: File | undefined) => {
    if (!file || !onUpload) return;
    setPending(true);
    setError(null);
    try {
      await onUpload(file);
    } catch {
      setError("editor.error.uploadFailed");
    } finally {
      setPending(false);
    }
  };

  const remove = async (id: string) => {
    if (!onDelete) return;
    setError(null);
    try {
      await onDelete(id);
      setSelectedId(current => (current === id ? null : current));
    } catch {
      setError("editor.error.imageDelete");
    }
  };

  const dropHandlers = onUpload
    ? {
        onDragOver: (e: React.DragEvent) => {
          e.preventDefault();
          setIsDragging(true);
        },
        onDragLeave: () => setIsDragging(false),
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          setIsDragging(false);
          void upload(e.dataTransfer.files[0]);
        },
      }
    : {};

  return (
    <Dialog
      title={t("editor.gallery.title")}
      onClose={onClose}
      width="800px"
      footer={
        <>
          {onUpload && (
            <Text size="xs" color="caption" as="span" className="mr-auto">
              {t("editor.gallery.dropHint")}
            </Text>
          )}
          <Button variant="outline" color="neutral" onClick={onClose}>
            {t("editor.action.cancel")}
          </Button>
          {selected ? (
            <Button
              variant="solid"
              color="primary"
              onClick={() => onConfirm(selected)}
            >
              {t("editor.gallery.insert")}
            </Button>
          ) : (
            onUpload && (
              <Button
                variant="solid"
                color="primary"
                disabled={pending}
                onClick={() => fileRef.current?.click()}
              >
                {pending
                  ? t("editor.gallery.uploading")
                  : t("editor.gallery.browse")}
              </Button>
            )
          )}
        </>
      }
    >
      <Stack gap="s" className="p-s">
        <Row gap="xs" align="center">
          <div className="relative flex-1">
            <TextInput
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t("editor.gallery.searchPlaceholder")}
              aria-label={t("editor.gallery.searchPlaceholder")}
              className="pr-6"
            />
            <PiMagnifyingGlass
              size={16}
              className="pointer-events-none absolute right-xxs top-1/2 -translate-y-1/2 text-text-subtle"
            />
          </div>
          <Row gap="xxs" align="center">
            <Text size="xs" color="caption" as="span">
              {t("editor.gallery.sort")}
            </Text>
            <TabBar
              tabs={SORTS.map(option => ({
                id: option.id,
                label: t(option.labelKey),
              }))}
              value={sort}
              onChange={id => setSort(id as GallerySort)}
              itemClassName="px-xs py-tight text-xs"
            />
          </Row>
        </Row>

        {images.length === 0 && !onUpload ? (
          <Row align="center" justify="center" className="h-80">
            <Text size="sm" color="caption" as="span">
              {t("editor.gallery.empty")}
            </Text>
          </Row>
        ) : images.length === 0 ? (
          <Stack
            gap="none"
            align="center"
            justify="center"
            {...dropHandlers}
            onClick={() => fileRef.current?.click()}
            className={`h-80 cursor-pointer rounded-lg border-2 border-dashed transition-colors hover:border-primary-400 ${
              isDragging
                ? "border-primary-400 bg-primary-100"
                : "border-border-neutral bg-surface-neutral"
            }`}
          >
            <PiUploadSimple size={24} className="mb-xxs text-text-subtle" />
            <Text size="sm" color="body" as="span">
              {t("editor.gallery.uploadCta")}
            </Text>
            <Text size="xs" color="subtle" as="span">
              {t("editor.gallery.uploadHint")}
            </Text>
            <Text size="xs" color="subtle" as="span">
              {t("editor.gallery.uploadFormats")}
            </Text>
          </Stack>
        ) : visible.length === 0 ? (
          <Row align="center" justify="center" className="h-80">
            <Text size="sm" color="caption" as="span">
              {t("editor.gallery.noResults")}
            </Text>
          </Row>
        ) : (
          <div
            {...dropHandlers}
            className={`grid max-h-80 grid-cols-6 gap-s overflow-y-auto rounded-lg p-xxs ${
              isDragging ? "bg-primary-100" : ""
            }`}
          >
            {visible.map(image => (
              <ImageThumbnail
                key={image.id}
                image={image}
                isSelected={image.id === selectedId}
                onSelect={() => setSelectedId(image.id)}
                onInsert={() => onConfirm(image)}
                onDelete={onDelete ? () => void remove(image.id) : undefined}
              />
            ))}
          </div>
        )}

        {error && <p className="text-xs text-red-600">{t(error)}</p>}

        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          onChange={e => {
            void upload(e.target.files?.[0]);
            e.target.value = "";
          }}
          className="hidden"
        />
      </Stack>
    </Dialog>
  );
}
