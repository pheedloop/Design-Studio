// Testing Library only auto-registers cleanup when Vitest runs with globals on.
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);
