import { useCallback, useState } from "react";
import type { EditorImage } from "@/editor";

function measure(
  url: string,
): Promise<{ width: number | null; height: number | null }> {
  return new Promise(resolve => {
    const img = new window.Image();
    img.onload = () =>
      resolve({
        width: img.naturalWidth || null,
        height: img.naturalHeight || null,
      });
    img.onerror = () => resolve({ width: null, height: null });
    img.src = url;
  });
}

/**
 * Stand-in for a host's image library so the demo app can exercise the gallery
 * with no backend. Object URLs live only for the page, so nothing survives a
 * reload — a real host stores the file and returns a hosted URL.
 */
export function useDemoImageLibrary() {
  const [images, setImages] = useState<EditorImage[]>([]);

  const onUploadImage = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    const { width, height } = await measure(url);
    setImages(current => [
      {
        id: crypto.randomUUID(),
        url,
        name: file.name,
        width,
        height,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  }, []);

  const onDeleteImage = useCallback(async (id: string) => {
    setImages(current => {
      const removed = current.find(image => image.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return current.filter(image => image.id !== id);
    });
  }, []);

  return { images, onUploadImage, onDeleteImage };
}
