import type { Preview } from "@storybook/react";
import "@nova/design-system/css/tokens.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "high-contrast", title: "High Contrast" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals["theme"] ?? "light";
      document.documentElement.className = theme === "light" ? "" : theme;
      return <Story />;
    },
  ],
};

export default preview;
