import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";

export type PopupProps = {
  title: React.ReactNode;
  content?: React.ReactNode;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Popup({
  title,
  content,
  children,
  open,
  onOpenChange,
}: PopupProps) {
  const isControlled = typeof onOpenChange === "function";

  // internal state used only when not controlled
  const [internalOpen, setInternalOpen] = useState<boolean>(!!open);

  // keep internal state in sync when parent passes a new `open` prop
  useEffect(() => {
    if (!isControlled && typeof open === "boolean") {
      setInternalOpen(open);
    }
  }, [open, isControlled]);

  const actualOpen = isControlled ? !!open : internalOpen;

  function handleOpenChange(next: boolean) {
    if (isControlled) {
      // parent manages state
      onOpenChange!(next);
    } else {
      // we manage state locally
      setInternalOpen(next);
    }
  }

  return (
    <Dialog open={actualOpen} onOpenChange={(o: boolean) => handleOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{children ?? content}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => handleOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
