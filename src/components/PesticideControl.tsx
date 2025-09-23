import React from "react";
import { Button } from "./ui/button";

interface PesticideControlProps {
  onYes: () => void;
  onNo: () => void;
}

export function PesticideControl({ onYes, onNo }: PesticideControlProps) {
  return (
    <div className="flex flex-col items-center gap-2 my-4">
      <h3 className="text-lg font-semibold">Spray pesticide?</h3>
      <div className="flex gap-4">
        <Button onClick={onYes} variant="outline">
          Yes
        </Button>
        <Button onClick={onNo} variant="outline">
          No
        </Button>
      </div>
    </div>
  );
}
