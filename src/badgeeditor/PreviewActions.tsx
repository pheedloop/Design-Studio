import { useEffect, useRef, useState } from "react";
import { DropdownMenu, MenuButton } from "@/editor/components/ui";
import type { MenuEntry } from "@/editor/components/ui";
import { Row } from "@/components/Row";
import { DownloadIcon, ServicePrinterIcon } from "@/icons/icons";
import type { AttendeeOption, BadgeDownloadFormat } from "./badgeData";
import { badgeFileName, printPdf, saveBlob } from "./badgeFiles";
import { useT } from "./i18n";

type Action = BadgeDownloadFormat | "print";

interface PreviewActionsProps {
  attendee: AttendeeOption;
  download: (id: string, format: BadgeDownloadFormat) => Promise<Blob>;
  /** Called with false when an action starts and true when it fails. */
  onFailedChange: (failed: boolean) => void;
}

/** Download (PDF, PNG) and Print for the badge the server preview shows. */
export function PreviewActions({
  attendee,
  download,
  onFailedChange,
}: PreviewActionsProps) {
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState<Action | null>(null);
  const menuRootRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = async (action: Action) => {
    if (busy) return;
    setBusy(action);
    onFailedChange(false);
    try {
      const format = action === "print" ? "pdf" : action;
      const blob = await download(attendee.id, format);
      if (!mounted.current) return;
      if (action === "print") printPdf(blob);
      else saveBlob(blob, badgeFileName(attendee.name, action));
    } catch {
      if (mounted.current) onFailedChange(true);
    } finally {
      if (mounted.current) setBusy(null);
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    menuRootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  };

  const items: MenuEntry[] = [
    {
      label: t("badgeeditor.preview.downloadPdf"),
      onClick: () => void run("pdf"),
    },
    {
      label: t("badgeeditor.preview.downloadPng"),
      onClick: () => void run("png"),
    },
  ];
  const downloading = busy === "pdf" || busy === "png";

  return (
    <Row gap="xs" align="center">
      <div ref={menuRootRef} className="relative">
        <MenuButton
          open={menuOpen}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-disabled={busy !== null || undefined}
          className="aria-disabled:opacity-50 aria-disabled:cursor-not-allowed"
          onPointerDown={e => e.stopPropagation()}
          onClick={() => {
            if (busy === null) setMenuOpen(o => !o);
          }}
        >
          <DownloadIcon size={14} aria-hidden="true" />
          <span className="text-xs">
            {downloading
              ? t("badgeeditor.preview.preparing")
              : t("badgeeditor.preview.download")}
          </span>
        </MenuButton>
        {menuOpen && <DropdownMenu items={items} onClose={closeMenu} />}
      </div>
      <MenuButton
        aria-disabled={busy !== null || undefined}
        className="aria-disabled:opacity-50 aria-disabled:cursor-not-allowed"
        onClick={() => void run("print")}
      >
        <ServicePrinterIcon size={14} aria-hidden="true" />
        <span className="text-xs">
          {busy === "print"
            ? t("badgeeditor.preview.preparing")
            : t("badgeeditor.preview.print")}
        </span>
      </MenuButton>
    </Row>
  );
}
