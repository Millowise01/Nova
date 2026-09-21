// Pulls in jest-dom's ambient matcher augmentation (toBeInTheDocument, etc.) for `tsc --noEmit`.
// test-setup.ts registers the runtime side effects; this file makes the type augmentation part of
// the `src` program too.
import "@testing-library/jest-dom";
