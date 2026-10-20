import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { AttendeePicker } from "./AttendeePicker";
import type { AttendeeProvider, AttendeeSearchPage } from "./badgeData";

type Deferred = {
  query: string;
  page: number;
  resolve: (r: AttendeeSearchPage) => void;
  reject: (e: Error) => void;
};

function setup() {
  const pending: Deferred[] = [];
  const provider: AttendeeProvider = {
    search: vi.fn(
      (query: string, page: number) =>
        new Promise<AttendeeSearchPage>((resolve, reject) => {
          pending.push({ query, page, resolve, reject });
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
const page = (names: string[], hasMore = false): AttendeeSearchPage => ({
  options: names.map(n => ({ id: n, name: n })),
  hasMore,
});

function scrollToBottom() {
  const list = screen.getByText("A").closest(".overflow-y-auto")!;
  Object.defineProperty(list, "scrollHeight", {
    value: 500,
    configurable: true,
  });
  Object.defineProperty(list, "clientHeight", {
    value: 256,
    configurable: true,
  });
  list.scrollTop = 240;
  fireEvent.scroll(list);
}

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
    await act(async () => pending[1].resolve(page(["Bo"])));
    await act(async () => pending[0].resolve(page(["Stale"])));
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

  it("loads the next page at the bottom and appends without duplicates", async () => {
    vi.useFakeTimers();
    const { pending } = setup();
    await advance();
    await act(async () => pending[0].resolve(page(["A", "B"], true)));
    scrollToBottom();
    expect(pending[1]).toMatchObject({ query: "", page: 2 });
    expect(screen.getByText("Searching…")).toBeTruthy();
    scrollToBottom();
    expect(pending).toHaveLength(2);
    await act(async () => pending[1].resolve(page(["B", "C"])));
    expect(screen.getAllByRole("button", { name: "B" })).toHaveLength(1);
    expect(screen.getByText("C")).toBeTruthy();
    scrollToBottom();
    expect(pending).toHaveLength(2);
  });

  it("keeps loaded options on a failed page and retries on the next scroll", async () => {
    vi.useFakeTimers();
    const { pending } = setup();
    await advance();
    await act(async () => pending[0].resolve(page(["A"], true)));
    scrollToBottom();
    await act(async () => pending[1].reject(new Error("boom")));
    expect(screen.getByText("A")).toBeTruthy();
    expect(
      screen.getByText("Couldn't search attendees. Try again."),
    ).toBeTruthy();
    scrollToBottom();
    expect(pending[2]).toMatchObject({ page: 2 });
  });

  it("resets to page 1 on a new query and drops a late page for the old one", async () => {
    vi.useFakeTimers();
    const { pending } = setup();
    await advance();
    await act(async () => pending[0].resolve(page(["A"], true)));
    scrollToBottom();
    fireEvent.change(screen.getByPlaceholderText("Search attendee…"), {
      target: { value: "z" },
    });
    await advance();
    expect(pending[2]).toMatchObject({ query: "z", page: 1 });
    await act(async () => pending[2].resolve(page(["Z"])));
    await act(async () => pending[1].resolve(page(["Late"])));
    expect(screen.getByText("Z")).toBeTruthy();
    expect(screen.queryByText("A")).toBeNull();
    expect(screen.queryByText("Late")).toBeNull();
  });
});
