import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import "@testing-library/jest-dom/vitest";

// Testing Library doesn't auto-register cleanup under Vitest's non-global mode
// (this repo's convention is explicit `import { describe, it } from "vitest"`,
// not `test.globals: true`) — without this, DOM from one test would leak into
// the next within a file. Mirrors apps/web/vitest.setup.ts and packages/ui's.
afterEach(() => {
  cleanup();
});
