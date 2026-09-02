import type { ReactNode } from "react";
import { useT } from "@/editor/i18n";
import { Row } from "@/components/Row";
import { Heading } from "@/components/Heading";

interface DialogProps {
  title: string;
  onClose: () => void;
  width?: string;
  maxHeight?: string;
  headerActions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function Dialog({
  title,
  onClose,
  width = "360px",
  // Cap to the viewport so the dialog never extends off-screen; the body
  // scrolls when content is taller than this.
  maxHeight = "90vh",
  headerActions,
  footer,
  children,
}: DialogProps) {
  const t = useT();
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative bg-white rounded-lg shadow-xl flex flex-col max-w-full"
        style={{ width, maxHeight }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-neutral-light shrink-0">
          <Heading level={2}>{title}</Heading>
          <Row gap="xxs" align="center">
            {headerActions}
            <button
              onClick={onClose}
              aria-label={t("editor.action.close")}
              className="text-text-subtle hover:text-text-body text-lg leading-none cursor-pointer"
            >
              &times;
            </button>
          </Row>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
        {footer && (
          <Row
            gap="xxs"
            align="center"
            justify="end"
            className="px-4 py-3 border-t border-border-neutral-light shrink-0"
          >
            {footer}
          </Row>
        )}
      </div>
    </div>
  );
}
