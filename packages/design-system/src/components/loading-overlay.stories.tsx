import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LoadingOverlay } from "./loading-overlay";

const meta = {
  title: "Design System/LoadingOverlay",
  component: LoadingOverlay,
  parameters: { layout: "padded" },
} satisfies Meta<typeof LoadingOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="relative h-64 w-full rounded-lg border border-[color:var(--color-border)]">
      <p className="p-4 text-sm text-[color:var(--color-foreground-muted)]">
        Section content behind the overlay.
      </p>
      <LoadingOverlay {...args} />
    </div>
  ),
};

export const CustomLabel: Story = {
  args: { label: "Placing your order..." },
  render: Default.render,
};

export const Hidden: Story = {
  args: { visible: false },
  render: Default.render,
};

export const OnDark: Story = {
  render: (args) => (
    <div className="dark relative h-64 w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-background)]">
      <p className="p-4 text-sm text-[color:var(--color-foreground-muted)]">
        Section content behind the overlay.
      </p>
      <LoadingOverlay {...args} />
    </div>
  ),
};
