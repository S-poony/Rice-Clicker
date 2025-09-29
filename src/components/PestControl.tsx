import React from "react";
import { Button } from "./ui/button";

interface PestControlProps {
  onSpray: () => void;
  onPerilla: () => void;
  onPass: () => void;
}

export function PestControl({ onSpray, onPass, onPerilla }: PestControlProps) {
  return (
    <div className="flex flex-col items-center gap-2 my-4">
      
      <div className="flex gap-4">
        <Button onClick={onSpray} variant="outline">
          <h3 className="text-lg font-semibold">Spray pesticide</h3>
        </Button>
        <Button onClick={onPerilla} variant="outline">
          <h3 className="text-lg font-semibold">Plant perilla flowers</h3>
        </Button>
        <Button onClick={onPass} variant="outline">
          <h3 className="text-lg font-semibold">Pass</h3>
        </Button>
      </div>
    </div>
  );
}
