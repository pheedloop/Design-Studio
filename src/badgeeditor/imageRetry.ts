export const MAX_IMAGE_LOAD_ATTEMPTS = 3;

/** Milliseconds to wait before retrying a failed load, or null once the attempts are spent. */
export function imageRetryDelay(failedAttempt: number): number | null {
  return failedAttempt < MAX_IMAGE_LOAD_ATTEMPTS
    ? 500 * 2 ** (failedAttempt - 1)
    : null;
}
