import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LineChart } from "./LineChart";

const data = [
  { month: "Jan", revenue: 4200, orders: 240 },
  { month: "Feb", revenue: 5100, orders: 280 },
  { month: "Mar", revenue: 4800, orders: 260 },
  { month: "Apr", revenue: 6200, orders: 310 },
  { month: "May", revenue: 7000, orders: 340 },
  { month: "Jun", revenue: 6700, orders: 330 },
];

const meta = {
  title: "Dashboard/LineChart",
  component: LineChart,
  parameters: { layout: "padded" },
  args: {
    data,
    xKey: "month",
    series: [{ key: "revenue", label: "Revenue", color: "primary" }],
  },
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultiSeries: Story = {
  args: {
    series: [
      { key: "revenue", label: "Revenue", color: "primary" },
      { key: "orders", label: "Orders", color: "accent" },
    ],
  },
};

export const Loading: Story = {
  args: { loading: true },
};

export const OnDark: Story = {
  render: (args) => (
    <div className="dark bg-[color:var(--color-background)] p-6">
      <LineChart {...args} />
    </div>
  ),
};
