import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "./dialog";
import { Button } from "./button";

const meta = {
  title: "Design System/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogHeader>
            <div>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </div>
            <DialogClose onClose={() => setOpen(false)} />
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-[color:var(--color-foreground-muted)]">
              Are you sure you want to proceed? All associated data will be permanently removed.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </DialogFooter>
        </Dialog>
      </>
    );
  },
};
