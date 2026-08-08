import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Home, Search, ShoppingCart, User } from "lucide-react";

import { Badge } from "./badge";
import { BottomNav, BottomNavItem } from "./bottom-nav";

const meta = {
  title: "Design System/BottomNav",
  component: BottomNav,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="relative h-64 bg-[color:var(--color-background)]">
      <BottomNav>
        <BottomNavItem href="#" icon={<Home size={20} />} active>
          Home
        </BottomNavItem>
        <BottomNavItem href="#" icon={<Search size={20} />}>
          Search
        </BottomNavItem>
        <BottomNavItem
          href="#"
          icon={<ShoppingCart size={20} />}
          badge={
            <Badge
              tone="error"
              variant="solid"
              size="sm"
              className="h-4 min-w-4 justify-center px-1"
            >
              3
            </Badge>
          }
        >
          Cart
        </BottomNavItem>
        <BottomNavItem href="#" icon={<User size={20} />}>
          Account
        </BottomNavItem>
      </BottomNav>
    </div>
  ),
};

export const OnDark: Story = {
  render: () => (
    <div className="dark relative h-64 bg-[color:var(--color-background)]">
      <BottomNav>
        <BottomNavItem href="#" icon={<Home size={20} />} active>
          Home
        </BottomNavItem>
        <BottomNavItem href="#" icon={<Search size={20} />}>
          Search
        </BottomNavItem>
        <BottomNavItem href="#" icon={<User size={20} />}>
          Account
        </BottomNavItem>
      </BottomNav>
    </div>
  ),
};
