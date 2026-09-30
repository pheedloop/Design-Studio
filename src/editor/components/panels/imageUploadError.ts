/** Reject `onUpload` with this to show the host's already-translated message in place of the generic error. */
export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageUploadError";
  }
}
