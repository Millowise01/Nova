import type { Meta, StoryObj } from "@storybook/react";
import { Button, Card } from "./index";

const meta = {
  title: "UI/Foundations",
  component: Card
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card>
      <Button>Continue</Button>
    </Card>
  )
};
