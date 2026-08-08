import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PieChart } from "./PieChart";

const data = [
  { name: "Electronics", value: 420, color: "primary" as const },
  { name: "Fashion", value: 310, color: "accent" as const },
  { name: "Home", value: 180, color: "info" as const },
  { name: "Other", value: 90, color: "warning" as const },
];

const meta = {
  title: "Dashboard/PieChart",
  component: PieChart,
  parameters: { layout: "padded" },
  args: { data },
} satisfies Meta<typeof PieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Donut: Story = {
  args: { donut: true },
};

export const Loading: Story = {
  args: { loading: true },
};

export const OnDark: Story = {
  render: (args) => (
    <div className="dark bg-[color:var(--color-background)] p-6">
      <PieChart {...args} />
    </div>
  ),
};
