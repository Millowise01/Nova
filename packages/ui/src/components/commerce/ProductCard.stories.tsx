import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ShoppingCart } from "lucide-react";

import { Button } from "@nova/design-system";

import { ProductCard } from "./ProductCard";

const meta = {
  title: "Commerce/ProductCard",
  component: ProductCard,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Premium Wireless Headphones",
    brand: "SoundWave",
    price: 79.99,
    originalPrice: 129.99,
    rating: 4.5,
    reviewCount: 1284,
    badge: "Sale",
    badgeTone: "accent",
    actions: (
      <Button size="sm" variant="accent" icon={<ShoppingCart size={14} />}>
        Add
      </Button>
    ),
  },
};

export const Loading: Story = {
  args: { ...Default.args, loading: true },
};

export const NoImage: Story = {
  args: { ...Default.args, image: undefined },
};

export const Grid: Story = {
  args: { title: "Product", price: 0 },
  render: () => (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ProductCard
          key={i}
          title={`Product ${i + 1}`}
          brand="Nova Brand"
          price={49.99 + i * 10}
          originalPrice={i % 2 === 0 ? 79.99 + i * 10 : undefined}
          rating={4 + i * 0.1}
          reviewCount={100 + i * 50}
        />
      ))}
    </div>
  ),
};
