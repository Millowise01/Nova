export default [
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  // Component boundary (docs/19-governance/NOVA_PHASE_5_FOUNDATION_PLAN.md, item D):
  // application -> @nova/ui -> @nova/design-system. Applications import components from
  // @nova/ui, the application-facing API; @nova/design-system is an implementation detail of
  // @nova/ui and is used only from inside packages/ui. Scoped to apps/ so packages/ui can
  // still import it. (Design tokens reach the apps through CSS @import, which this rule
  // does not touch.)
  {
    files: ["apps/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@nova/design-system", "@nova/design-system/*"],
              message:
                "Import components from @nova/ui, the application-facing component API. @nova/design-system is an implementation detail of @nova/ui.",
            },
          ],
        },
      ],
    },
  },
];
