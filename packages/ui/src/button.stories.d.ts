import type { StoryObj } from "@storybook/react";
import { Button } from "@nova/design-system";
declare const meta: {
    title: string;
    component: typeof Button;
    args: {
        children: string;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const Loading: Story;
export declare const Danger: Story;
export declare const Outline: Story;
