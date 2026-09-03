import { useState, useEffect, useMemo } from "react";
import {
  PiDesktop,
  PiDeviceMobile,
  PiUser,
  PiStorefront,
} from "react-icons/pi";
import { MapEditor, definePlacementCategory, type Tier } from "@/editor";
import { LocaleSwitcher } from "@/demo/LocaleSwitcher";
import { useDemoLocale } from "@/demo/useDemoLocale";
import { useDemoImageLibrary } from "@/demo/useDemoImageLibrary";
import { ChromeDivider } from "@/demo/ChromeDivider";
import { ViewerRoute, type Viewport } from "./ViewerRoute";
import { ChromeToggle } from "@/demo/ChromeToggle";
import { ProductSwitcher } from "@/components/ProductSwitcher";
import { exhibitionHallMap } from "@/sample-data/exhibition-hall-map";
import { conferenceExpoBooths } from "@/sample-data/sample-booths";
import { sampleSessionLocations } from "@/sample-data/sample-session-locations";
import { sampleMeetingRooms } from "@/sample-data/sample-meeting-rooms";
import type {
  ViewerMode,
  ExhibitorBooth,
  SessionLocation,
  MeetingRoom,
} from "@/viewer/types";

type Mode = "editor" | "viewer";
function getMode(): Mode {
  const hash = window.location.hash.replace("#", "");
  if (hash === "viewer") return "viewer";
  return "editor";
}

export function MapApp() {
  const [mode, setMode] = useState<Mode>(getMode);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [viewerMode, setViewerMode] = useState<ViewerMode>("attendee");
  const [tier, setTier] = useState<Tier>("premium");
  // One toggle drives both the editor and the viewer, so a locale check covers
  // both modes without re-selecting it after switching tabs.
  const { locale, setLocale, translate } = useDemoLocale();
  const { images, onUploadImage, onDeleteImage } = useDemoImageLibrary();

  useEffect(() => {
    const onHashChange = () => setMode(getMode());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // The three records-backed object categories for the exhibition-map product.
  const placementCategories = useMemo(
    () => [
      definePlacementCategory<ExhibitorBooth>({
        id: "booths",
        elementType: "booth",
        linkKey: "boothSlug",
        records: conferenceExpoBooths,
        title: "Booths",
        iconColor: "#3b82f6",
        iconShape: "rect",
        defaultShape: "rect",
        getRecordId: r => r.slug,
        getPrimaryLabel: r => r.code,
      }),
      definePlacementCategory<SessionLocation>({
        id: "sessions",
        elementType: "session_area",
        linkKey: "sessionId",
        records: sampleSessionLocations,
        title: "Session Locations",
        iconColor: "#8b5cf6",
        iconShape: "oval",
        defaultShape: "rect",
        // SessionLocation.id is an integer PK; element sessionId refs are strings.
        getRecordId: r => String(r.id),
        getPrimaryLabel: r => r.title,
      }),
      definePlacementCategory<MeetingRoom>({
        id: "meetingRooms",
        elementType: "meeting_room",
        linkKey: "meetingRoomId",
        records: sampleMeetingRooms,
        title: "Meeting Rooms",
        iconColor: "#f59e0b",
        iconShape: "rect",
        defaultShape: "rect",
        getRecordId: r => r.id,
        getPrimaryLabel: r => r.name,
        getSecondaryLabel: r =>
          r.capacity != null ? `${r.capacity} cap.` : null,
        getExtraProps: r =>
          r.capacity != null ? { capacity: r.capacity } : {},
      }),
    ],
    [],
  );

  const modeTab = (m: Mode, label: string) => (
    <a
      href={`#${m}`}
      className={`px-xs py-xxxs rounded transition-colors ${
        mode === m ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </a>
  );

  return (
    <div className="h-screen flex flex-col">
      <nav className="flex items-center gap-xxxs px-xs py-tight bg-gray-900 text-xs shrink-0">
        <ProductSwitcher current="maps" mode={mode} />
        <ChromeDivider />
        {modeTab("editor", "Editor")}
        {modeTab("viewer", "Viewer")}

        <ChromeDivider />
        <span className="text-gray-500 mr-hair">Tier:</span>
        {(["basic", "advanced", "premium"] as Tier[]).map(t => (
          <ChromeToggle
            key={t}
            active={tier === t}
            onClick={() => setTier(t)}
            className="capitalize"
            title={`Set ${t} tier`}
          >
            {t}
          </ChromeToggle>
        ))}

        <LocaleSwitcher locale={locale} setLocale={setLocale} />

        {mode === "viewer" && (
          <>
            <ChromeDivider />
            <button
              onClick={() => setViewport("desktop")}
              className={`p-xxxs rounded cursor-pointer transition-colors ${
                viewport === "desktop"
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              title="Desktop"
            >
              <PiDesktop size={16} />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={`p-xxxs rounded cursor-pointer transition-colors ${
                viewport === "mobile"
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              title="Mobile (390×844)"
            >
              <PiDeviceMobile size={16} />
            </button>
            <ChromeDivider />
            <ChromeToggle
              active={viewerMode === "attendee"}
              onClick={() => setViewerMode("attendee")}
              className="flex items-center gap-xxxs"
              title="Attendee view"
            >
              <PiUser size={14} />
              <span>Attendee</span>
            </ChromeToggle>
            <ChromeToggle
              active={viewerMode === "exhibitor"}
              onClick={() => setViewerMode("exhibitor")}
              className="flex items-center gap-xxxs"
              title="Exhibitor view"
            >
              <PiStorefront size={14} />
              <span>Exhibitor</span>
            </ChromeToggle>
          </>
        )}
      </nav>
      <div className="flex-1 overflow-hidden">
        {mode === "editor" && (
          <MapEditor
            initialData={exhibitionHallMap}
            placementCategories={placementCategories}
            tier={tier}
            translate={translate}
            images={images}
            onUploadImage={onUploadImage}
            onDeleteImage={onDeleteImage}
            persist
            debug
          />
        )}
        {mode === "viewer" && (
          <ViewerRoute
            viewport={viewport}
            mode={viewerMode}
            tier={tier}
            translate={translate}
          />
        )}
      </div>
    </div>
  );
}
