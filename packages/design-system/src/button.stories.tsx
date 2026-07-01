import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./components/button";

const meta = {
  title: "Design System/Button",
  component: Button,
  args: {
    children: "Continue"
  }
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true, children: "Saving" }
};
