// Testing Library registers its own afterEach(cleanup) only when Vitest runs
// with `globals: true`. This suite keeps globals off — imports are explicit
// everywhere else in the repo — so unmount between tests explicitly, or rendered
// trees stack up and every getByTestId finds several matches.

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);
