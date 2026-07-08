import type { StoryObj } from "@storybook/react";
import { Card } from "./index";
declare const meta: {
    title: string;
    component: typeof Card;
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
