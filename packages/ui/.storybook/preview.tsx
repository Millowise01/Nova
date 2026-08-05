import type { Decorator, Preview } from "@storybook/nextjs-vite";
import "@nova/design-system/css/tokens.css";

const withTheme: Decorator = (Story, context: { globals: Record<string, unknown> }) => {
  const theme = (context.globals["theme"] as string | undefined) ?? "light";
  document.documentElement.className = theme === "light" ? "" : theme;
  return <Story />;
};

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
  decorators: [withTheme],
};

export default preview;
