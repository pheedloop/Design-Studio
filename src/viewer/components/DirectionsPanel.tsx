import { PiX, PiArrowsDownUp, PiFootprints } from "react-icons/pi";
import { IconButton } from "@/components/IconButton";
import type { SearchResult } from "@/viewer/hooks/useSearch";
import type {
  DirectionsLocation,
  RouteStatus,
} from "@/viewer/hooks/useDirections";
import type { Dimensions } from "@/types";
import {
  formatRouteDistance,
  pathDistance,
  pxToReal,
  estimateWalkingTime,
  formatWalkingTime,
} from "@/utils/unitConversion";
import { useLocale, useT } from "@/viewer/i18n";
import { Row } from "@/components/Row";
import { Stack } from "@/components/Stack";
import { Text } from "@/components/Text";
import { LocationField } from "./LocationField";

interface DirectionsPanelProps {
  startLocation: DirectionsLocation | null;
  endLocation: DirectionsLocation | null;
  routeStatus: RouteStatus;
  routePath: { x: number; y: number }[] | null;
  dimensions: Dimensions;
  onSearch: (query: string) => SearchResult[];
  onSelectStart: (result: SearchResult | null) => void;
  onSelectEnd: (result: SearchResult | null) => void;
  onSwap: () => void;
  onClose: () => void;
}

export function DirectionsPanel({
  startLocation,
  endLocation,
  routeStatus,
  routePath,
  dimensions,
  onSearch,
  onSelectStart,
  onSelectEnd,
  onSwap,
  onClose,
}: DirectionsPanelProps) {
  const t = useT();
  const locale = useLocale();

  return (
    <Stack gap="xxs" className="p-3">
      <div className="flex items-center justify-between">
        <Text size="xs" weight="semibold" color="body" as="span">
          {t("viewer.directions.title")}
        </Text>
        <IconButton variant="bare" size="sm" onClick={onClose}>
          <PiX size={16} />
        </IconButton>
      </div>

      <Row gap="xxs">
        <Stack gap="xxs" className="flex-1 min-w-0">
          <LocationField
            label={t("viewer.directions.from")}
            placeholder={t("viewer.directions.fromPlaceholder")}
            t={t}
            value={startLocation}
            onSearch={onSearch}
            onSelect={onSelectStart}
            onClear={() => onSelectStart(null)}
          />
          <LocationField
            label={t("viewer.directions.to")}
            placeholder={t("viewer.directions.toPlaceholder")}
            t={t}
            value={endLocation}
            onSearch={onSearch}
            onSelect={onSelectEnd}
            onClear={() => onSelectEnd(null)}
          />
        </Stack>

        <IconButton
          size="sm"
          onClick={onSwap}
          className="self-center shrink-0"
          title={t("viewer.directions.swap")}
        >
          <PiArrowsDownUp size={16} />
        </IconButton>
      </Row>

      {routeStatus === "no-route" && (
        <div className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
          {t("viewer.directions.noRoute")}
        </div>
      )}
      {routeStatus === "same-location" && (
        <div className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          {t("viewer.directions.sameLocation")}
        </div>
      )}
      {routeStatus === "ready" && routePath && routePath.length > 1 && (
        <Row
          gap="xxs"
          align="center"
          className="text-xs text-text-body bg-surface-neutral rounded-lg px-3 py-2"
        >
          <PiFootprints size={14} className="text-text-subtle shrink-0" />
          <span>{formatRouteDistance(routePath, dimensions, t, locale)}</span>
          {(() => {
            const pxDist = pathDistance(routePath);
            const realDist = pxToReal(pxDist, dimensions.pixelsPerUnit);
            const est = estimateWalkingTime(realDist, dimensions.unit);
            return est ? (
              <span className="text-text-subtle">
                &middot; {formatWalkingTime(est, t)}
              </span>
            ) : null;
          })()}
        </Row>
      )}
    </Stack>
  );
}
