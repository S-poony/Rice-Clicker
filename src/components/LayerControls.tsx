import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {PestControl} from "./PestControl.tsx";

interface LayerControlsProps {
  layersToRemove: number;
  weekNumber: number;
  //props for pest control
  onSpray: () => void;
  onFlower: ()  => void;
  onPass: () => void;
}

// LayerControls.tsx

export function LayerControls({
  layersToRemove,
  weekNumber,
  onSpray,
  onFlower,
  onPass
}: LayerControlsProps) {
  return (
    <div 
      className="flex flex-col gap-4 p-6 bg-card rounded-lg shadow-xl border"
      style={{ width: '100%' }}
    >
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Button variant="outline" className="w-24">
            Week {weekNumber}
          </Button>
        </div>
        <p>Layers to remove: {layersToRemove}</p>
      </div>
       <PestControl 
        weekNumber={weekNumber}
        onSpray={onSpray}
        onFlower={onFlower}
        onPass={onPass}
        layersToRemove={layersToRemove}// pass layersToRemove down to PestControl for disabled logic
      />
    </div>
  );
}
