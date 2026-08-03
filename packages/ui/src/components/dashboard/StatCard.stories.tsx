import type { Meta, StoryObj } from "@storybook/react";
import { ShoppingCart, Users, DollarSign, TrendingUp } from "lucide-react";

import { StatCard } from "./StatCard";

const meta = {
  title: "Dashboard/StatCard",
  component: StatCard,
  parameters: { layout: "padded" },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Total Revenue",
    value: "$48,295",
    trend: 12.5,
    trendLabel: "vs last month",
    icon: <DollarSign size={18} />,
  },
};

export const Loading: Story = {
  args: { ...Default.args, loading: true },
};

export const Grid: Story = {
  args: { title: "Stat", value: 0 },
  render: () => (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        title="Revenue"
        value="$48,295"
        trend={12.5}
        trendLabel="vs last month"
        icon={<DollarSign size={18} />}
        tone="default"
      />
      <StatCard
        title="Orders"
        value="1,284"
        trend={8.2}
        trendLabel="vs last month"
        icon={<ShoppingCart size={18} />}
        tone="primary"
      />
      <StatCard
        title="Customers"
        value="9,420"
        trend={-2.1}
        trendLabel="vs last month"
        icon={<Users size={18} />}
        tone="warning"
      />
      <StatCard
        title="Growth"
        value="24.8%"
        trend={4.6}
        trendLabel="vs last month"
        icon={<TrendingUp size={18} />}
        tone="success"
      />
    </div>
  ),
};
