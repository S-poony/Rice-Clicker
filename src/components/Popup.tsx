import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";

type PopupProps = {
  title: React.ReactNode;                // texte ou JSX pour le titre
  content?: React.ReactNode;             // texte ou JSX pour le contenu (optionnel si children utilisé)
  children?: React.ReactNode;            // alternative : si fourni, children seront utilisés à la place de `content`
  defaultOpen?: boolean;                 // ouvert par défaut (true)
  onOpenChange?: (open: boolean) => void; // callback optionnel quand l'état d'ouverture change
};

export function Popup({
  title,
  content,
  children,
  defaultOpen = true,
  onOpenChange,
}: PopupProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  useEffect(() => {
    if (onOpenChange) onOpenChange(isOpen);
  }, [isOpen, onOpenChange]);

  const handleClose = () => {
    setIsOpen(false);
    // onOpenChange est appelé via useEffect
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => setIsOpen(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {/* si children fournis, les afficher ; sinon afficher content */}
            {children ?? content}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
