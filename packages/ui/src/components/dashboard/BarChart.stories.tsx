import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BarChart } from "./BarChart";

const data = [
  { day: "Mon", sales: 1200, returns: 80 },
  { day: "Tue", sales: 1900, returns: 60 },
  { day: "Wed", sales: 1500, returns: 100 },
  { day: "Thu", sales: 2100, returns: 70 },
  { day: "Fri", sales: 2600, returns: 90 },
  { day: "Sat", sales: 3000, returns: 120 },
  { day: "Sun", sales: 2200, returns: 75 },
];

const meta = {
  title: "Dashboard/BarChart",
  component: BarChart,
  parameters: { layout: "padded" },
  args: {
    data,
    xKey: "day",
    series: [{ key: "sales", label: "Sales", color: "success" }],
  },
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultiSeries: Story = {
  args: {
    series: [
      { key: "sales", label: "Sales", color: "success" },
      { key: "returns", label: "Returns", color: "error" },
    ],
  },
};

export const Stacked: Story = {
  args: {
    stacked: true,
    series: [
      { key: "sales", label: "Sales", color: "success" },
      { key: "returns", label: "Returns", color: "error" },
    ],
  },
};

export const Loading: Story = {
  args: { loading: true },
};

export const OnDark: Story = {
  render: (args) => (
    <div className="dark bg-[color:var(--color-background)] p-6">
      <BarChart {...args} />
    </div>
  ),
};
