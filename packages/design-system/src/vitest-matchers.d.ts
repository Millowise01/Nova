// Pulls in jest-dom's ambient matcher augmentation (toBeInTheDocument, etc.)
// for `tsc --noEmit`. vitest.setup.ts imports the runtime side-effects; this
// file exists purely so the type augmentation is part of the `src` program
// too, since vitest.setup.ts itself sits outside `include: ["src"]`.
import "@testing-library/jest-dom";
