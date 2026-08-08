import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";
import {
  EmptyState,
  NoProductsEmptyState,
  NoOrdersEmptyState,
  NoResultsEmptyState,
  NoNotificationsEmptyState,
} from "./empty-state";

const meta = {
  title: "Design System/EmptyState",
  component: EmptyState,
  parameters: { layout: "padded" },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: "Nothing here yet", description: "Content will appear once available." },
};

export const NoProducts: Story = {
  args: { title: "No products found" },
  render: () => <NoProductsEmptyState action={<Button variant="outline">Clear filters</Button>} />,
};

export const NoOrders: Story = {
  args: { title: "No orders yet" },
  render: () => <NoOrdersEmptyState action={<Button variant="primary">Start shopping</Button>} />,
};

export const NoResults: Story = {
  args: { title: "No results found" },
  render: () => <NoResultsEmptyState />,
};

export const NoNotifications: Story = {
  args: { title: "You're all caught up" },
  render: () => <NoNotificationsEmptyState />,
};

export const OnDark: Story = {
  args: { title: "No products found" },
  render: () => (
    <div className="dark bg-[color:var(--color-background)] p-6">
      <NoProductsEmptyState />
    </div>
  ),
};
