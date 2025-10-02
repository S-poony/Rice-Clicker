import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface LayerControlsProps {
  layersToRemove: number;
  weekNumber: number;
}

export function LayerControls({
  layersToRemove,
  weekNumber,
}: LayerControlsProps) {
  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border">
      <div className="flex flex-col gap-2">
        {weekNumber >= 0 && (
        <div className="relative">
          <Button variant="outline" className="w-24">
            Week {weekNumber}
          </Button>
        </div>
      )}
        <p>Layers to remove: {layersToRemove}</p>
      </div>
      
    </div>
  );
}
