import type { Meta, StoryObj } from "@storybook/react";
import { LayoutGrid, List, Settings } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

const meta = {
  title: "Design System/Tabs",
  component: Tabs,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {
  args: { defaultValue: "overview" },
  render: () => (
    <Tabs defaultValue="overview" variant="line">
      <TabsList>
        <TabsTrigger value="overview" icon={<LayoutGrid size={14} />}>
          Overview
        </TabsTrigger>
        <TabsTrigger value="analytics" icon={<List size={14} />}>
          Analytics
        </TabsTrigger>
        <TabsTrigger value="settings" icon={<Settings size={14} />}>
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-[color:var(--color-foreground-muted)]">Overview content</p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="text-sm text-[color:var(--color-foreground-muted)]">Analytics content</p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-[color:var(--color-foreground-muted)]">Settings content</p>
      </TabsContent>
    </Tabs>
  ),
};

export const Pill: Story = {
  args: { defaultValue: "all" },
  render: () => (
    <Tabs defaultValue="all" variant="pill">
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <p className="text-sm text-[color:var(--color-foreground-muted)]">All items</p>
      </TabsContent>
      <TabsContent value="active">
        <p className="text-sm text-[color:var(--color-foreground-muted)]">Active items</p>
      </TabsContent>
      <TabsContent value="archived">
        <p className="text-sm text-[color:var(--color-foreground-muted)]">Archived items</p>
      </TabsContent>
    </Tabs>
  ),
};
