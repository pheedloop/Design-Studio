import { useMemo, type ReactNode } from "react";
import type { EditorImage } from "@/editor";
import { BadgeImageContext, type ResolveImageUrl } from "./badgeImageContext";

export function BadgeImageProvider({
  images,
  children,
}: {
  images: EditorImage[];
  children: ReactNode;
}) {
  const resolve = useMemo<ResolveImageUrl>(() => {
    const urlByCode = new Map(images.map(image => [image.id, image.url]));
    return code => (code ? urlByCode.get(code) : undefined);
  }, [images]);

  return (
    <BadgeImageContext.Provider value={resolve}>
      {children}
    </BadgeImageContext.Provider>
  );
}
