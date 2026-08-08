import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Button } from "./button";
import { ConfirmDialog } from "./confirm-dialog";

const meta = {
  title: "Design System/ConfirmDialog",
  component: ConfirmDialog,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: false,
    onClose: () => undefined,
    onConfirm: () => undefined,
    title: "Save changes?",
    description: "Your changes will be applied immediately.",
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Save</Button>
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          title="Save changes?"
          description="Your changes will be applied immediately."
        />
      </>
    );
  },
};

export const Destructive: Story = {
  args: { ...Default.args },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete account
        </Button>
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          title="Delete account"
          description="This action cannot be undone. All your data will be permanently removed."
          tone="danger"
          confirmLabel="Delete"
        />
      </>
    );
  },
};

export const Loading: Story = {
  args: { ...Default.args },
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => undefined}
        title="Placing order"
        description="Please wait while we confirm your order."
        loading
      />
    );
  },
};
