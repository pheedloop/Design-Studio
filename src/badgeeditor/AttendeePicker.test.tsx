import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { AttendeePicker } from "./AttendeePicker";
import type { AttendeeOption, AttendeeProvider } from "./badgeData";

type Deferred = {
  resolve: (r: AttendeeOption[]) => void;
  reject: (e: Error) => void;
};

function setup() {
  const pending: Deferred[] = [];
  const provider: AttendeeProvider = {
    search: vi.fn(
      () =>
        new Promise<AttendeeOption[]>((resolve, reject) => {
          pending.push({ resolve, reject });
        }),
    ),
    resolve: vi.fn(),
  };
  render(
    <AttendeePicker provider={provider} value={null} onChange={() => {}} />,
  );
  fireEvent.click(screen.getByText("Preview data…"));
  return { pending, provider };
}

const advance = () => act(() => vi.advanceTimersByTimeAsync(250));

describe("AttendeePicker search", () => {
  afterEach(() => vi.useRealTimers());

  it("ignores a slow response for an earlier query", async () => {
    vi.useFakeTimers();
    const { pending } = setup();
    await advance();
    fireEvent.change(screen.getByPlaceholderText("Search attendee…"), {
      target: { value: "bo" },
    });
    await advance();
    await act(async () => pending[1].resolve([{ id: "2", name: "Bo" }]));
    await act(async () => pending[0].resolve([{ id: "1", name: "Stale" }]));
    expect(screen.getByText("Bo")).toBeTruthy();
    expect(screen.queryByText("Stale")).toBeNull();
  });

  it("shows an error when the search fails", async () => {
    vi.useFakeTimers();
    const { pending } = setup();
    await advance();
    await act(async () => pending[0].reject(new Error("boom")));
    expect(
      screen.getByText("Couldn't search attendees. Try again."),
    ).toBeTruthy();
  });
});
