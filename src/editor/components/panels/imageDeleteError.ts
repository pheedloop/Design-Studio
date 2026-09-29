import type { CommonKey } from "@/i18n/types";

/** Reject `onDelete` with this to show `messageKey` in place of the generic error. */
export class ImageDeleteError extends Error {
  readonly messageKey: CommonKey;

  constructor(messageKey: CommonKey) {
    super(messageKey);
    this.name = "ImageDeleteError";
    this.messageKey = messageKey;
  }
}
