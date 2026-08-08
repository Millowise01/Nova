import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Combobox } from "./combobox";

const fruitOptions = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
  { value: "elderberry", label: "Elderberry" },
  { value: "fig", label: "Fig (disabled)", disabled: true },
];

const meta = {
  title: "Design System/Combobox",
  component: Combobox,
  parameters: { layout: "padded" },
  args: { options: fruitOptions, label: "Fruit" },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Search fruit..." },
};

export const Multiple: Story = {
  args: { multiple: true, defaultValue: ["apple", "cherry"], placeholder: "Add fruit..." },
};

export const Loading: Story = {
  args: { loading: true, placeholder: "Search fruit..." },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "banana" },
};

export const WithError: Story = {
  args: { error: "Please choose a fruit", placeholder: "Search fruit..." },
};

export const OnDark: Story = {
  args: { placeholder: "Search fruit..." },
  render: (args) => (
    <div className="dark rounded-lg bg-[color:var(--color-background)] p-6">
      <Combobox {...args} />
    </div>
  ),
};
