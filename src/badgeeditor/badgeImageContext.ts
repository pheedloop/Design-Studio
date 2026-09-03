import { createContext, useContext } from "react";

export type ResolveImageUrl = (code?: string) => string | undefined;

export const BadgeImageContext = createContext<ResolveImageUrl>(
  () => undefined,
);

export const useBadgeImageUrl = (): ResolveImageUrl =>
  useContext(BadgeImageContext);
