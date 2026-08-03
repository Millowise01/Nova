import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@nova/design-system";

const meta = {
  title: "Design System/Button",
  component: Button,
  args: {
    children: "Continue",
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true, children: "Saving" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Delete" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Cancel" },
};
