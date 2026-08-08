import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement ResizeObserver, which Recharts' ResponsiveContainer
// requires to mount at all — a minimal no-op stub is the standard fix for
// testing resize-observing libraries under jsdom.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

// Testing Library doesn't auto-register cleanup under Vitest's non-global mode
// (this repo's convention is explicit `import { describe, it } from "vitest"`,
// not `test.globals: true`) — without this, DOM from one test would leak into
// the next within a file. Mirrors apps/web/vitest.setup.ts.
afterEach(() => {
  cleanup();
});
