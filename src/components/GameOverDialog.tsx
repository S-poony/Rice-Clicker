import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface GameOverDialogProps {
  isOpen: boolean;
  score: number;
  pesticideSprayCount: number;
  weekNumber: number;
  onShare: () => void;
  onClose: () => void;
  onReplay: () => void;
}

export function GameOverDialog({
  isOpen,
  score,
  pesticideSprayCount,
  weekNumber,
  onShare,
  onClose,
  onReplay,
}: GameOverDialogProps) {
  const shareText = `I finished the game with a score of ${score.toFixed(
    2
  )} and used pesticide ${pesticideSprayCount} times! 
  
Try to beat me here: https://s-poony.github.io/Rice-Clicker/`;

  const handleShare = () => {
    navigator.clipboard.writeText(shareText);
    onShare();
  };

  const description =
    weekNumber >= 10
      ? "You have completed all 10 weeks. Here is your final score."
      : `You have completed ${weekNumber} weeks. Here is your final score.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Game Over!</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <p className="font-medium">Final Yield:</p>
            <p className="text-2xl font-bold">{score} tons</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-medium">Total Pesticide Sprays:</p>
            <p className="text-2xl font-bold">{pesticideSprayCount}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant= "outline" onClick={handleShare}>
            Share Score</Button>
          <Button onClick={onReplay}>
          Replay</Button>
          <Button variant= "outline" onClick={onClose}>
            Close </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
