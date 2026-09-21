import assert from "node:assert/strict";
import test from "node:test";

import { Linter } from "eslint";

import nextConfig from "./next.mjs";

// The component boundary (Phase 5, item D): applications import components from @nova/ui, the
// application-facing API. @nova/design-system is an implementation detail of @nova/ui and is
// used only from inside packages/ui. This test runs the shared config against real snippets.

const appBlock = nextConfig.find((block) => block.rules?.["no-restricted-imports"]);

function lint(code, filename) {
  const linter = new Linter({ configType: "flat" });
  return linter.verify(
    code,
    [
      {
        ...appBlock,
        languageOptions: { ecmaVersion: 2022, sourceType: "module" },
      },
    ],
    { filename },
  );
}

test("the shared config declares the restriction", () => {
  assert.ok(appBlock, "a config block with no-restricted-imports exists in next.mjs");
});

test("the restriction applies only to applications, never to packages", () => {
  assert.ok(appBlock.files.length > 0);
  for (const pattern of appBlock.files) {
    assert.ok(pattern.startsWith("apps/"), `${pattern} must be scoped to apps/`);
  }
});

for (const source of [
  "@nova/design-system",
  "@nova/design-system/css",
  "@nova/design-system/tokens",
]) {
  test(`rejects importing ${source} from application code`, () => {
    const messages = lint(`import { Button } from "${source}";\n`, "apps/web/src/example.ts");
    assert.equal(messages.length, 1, JSON.stringify(messages));
    assert.equal(messages[0].ruleId, "no-restricted-imports");
    assert.match(messages[0].message, /@nova\/ui/);
  });
}

for (const source of ["@nova/ui", "@nova/ui/charts", "@nova/utils", "@nova/icons"]) {
  test(`allows importing ${source} from application code`, () => {
    const messages = lint(`import { X } from "${source}";\n`, "apps/web/src/example.ts");
    assert.deepEqual(messages, []);
  });
}

test("also rejects a re-export of the design system", () => {
  assert.equal(
    lint(`export { Button } from "@nova/design-system";\n`, "apps/seller/src/example.ts").length,
    1,
  );
});
