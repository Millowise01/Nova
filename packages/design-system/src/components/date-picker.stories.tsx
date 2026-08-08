import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DatePicker } from "./date-picker";

const meta = {
  title: "Design System/DatePicker",
  component: DatePicker,
  parameters: { layout: "padded" },
  args: { label: "Delivery date" },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: new Date() },
};

export const WithMinMax: Story = {
  args: {
    minDate: new Date(),
    maxDate: new Date(new Date().setDate(new Date().getDate() + 14)),
    helperText: "Choose a date within the next 2 weeks",
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: new Date() },
};

export const WithError: Story = {
  args: { error: "A delivery date is required" },
};

export const OnDark: Story = {
  render: (args) => (
    <div className="dark rounded-lg bg-[color:var(--color-background)] p-6">
      <DatePicker {...args} />
    </div>
  ),
};
