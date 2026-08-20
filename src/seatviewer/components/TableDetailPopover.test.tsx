import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nProvider } from "@/i18n/I18nProvider";
import type { Translate } from "@/i18n";
import type { SeatTableState } from "@/seatviewer/types";
import { TableDetailPopover } from "./TableDetailPopover";

const table = (over: Partial<SeatTableState> = {}): SeatTableState => ({
  tableCode: "T1",
  seatCount: 8,
  occupancy: 0,
  isLocked: false,
  eligibleTicketCodes: [],
  tags: [],
  ...over,
});

function show(
  props: Partial<Parameters<typeof TableDetailPopover>[0]> = {},
  translate?: Translate,
) {
  return render(
    <I18nProvider translate={translate}>
      <TableDetailPopover
        table={table()}
        tableName="Table 1"
        occupants={[]}
        assignLabel="Assign"
        assignDisabled={false}
        onAssign={() => {}}
        onUnassign={() => {}}
        onClose={() => {}}
        {...props}
      />
    </I18nProvider>,
  );
}

describe("seats free", () => {
  // Rendered, not unit-tested, because the point is that the plural selection
  // survives the whole t() -> provider -> DOM path.
  it("uses the singular at one seat", () => {
    show({ table: table({ seatCount: 8, occupancy: 7 }) });
    expect(screen.getByText("1 of 8 seat free")).toBeTruthy();
  });

  it("uses the plural at zero and at many", () => {
    const { unmount } = show({ table: table({ seatCount: 8, occupancy: 8 }) });
    expect(screen.getByText("0 of 8 seats free")).toBeTruthy();
    unmount();

    show({ table: table({ seatCount: 8, occupancy: 2 }) });
    expect(screen.getByText("6 of 8 seats free")).toBeTruthy();
  });

  it("never reports negative seats", () => {
    show({ table: table({ seatCount: 4, occupancy: 9 }) });
    expect(screen.getByText("0 of 4 seats free")).toBeTruthy();
  });
});

describe("occupant heading", () => {
  const heading = () =>
    screen.getByText(/Loading|Seated here|Locked|No one seated yet/);

  it("shows each state", () => {
    const { unmount } = show({ occupantsLoading: true });
    expect(heading().textContent).toBe("Loading…");
    unmount();

    const two = show({
      occupants: [
        { code: "a", firstName: "Ada", lastName: "L", email: "a@x.com" },
        { code: "b", firstName: "Bo", lastName: "P", email: "b@x.com" },
      ],
    });
    expect(heading().textContent).toBe("Seated here");
    two.unmount();

    const locked = show({ table: table({ isLocked: true }) });
    expect(heading().textContent).toBe("Locked");
    locked.unmount();

    show();
    expect(heading().textContent).toBe("No one seated yet");
  });
});

describe("assign button", () => {
  it("shows the host-supplied label, and its own in-flight text", () => {
    const { unmount } = show({ assignLabel: "Assign Ada here" });
    expect(
      screen.getByRole("button", { name: "Assign Ada here" }),
    ).toBeTruthy();
    unmount();

    show({ assigning: true });
    expect(screen.getByRole("button", { name: "Assigning…" })).toBeTruthy();
  });
});

describe("translation", () => {
  it("routes its own strings through the host translator", () => {
    const keys: Translate = key => `[${key}]`;
    show({ table: table({ seatCount: 8, occupancy: 7 }) }, keys);

    // The plural base is what reaches the host, not the _one variant.
    expect(screen.getByText("[seatviewer.table.seatsFree]")).toBeTruthy();
    expect(screen.getByLabelText("[seatviewer.table.close]")).toBeTruthy();
  });
});
