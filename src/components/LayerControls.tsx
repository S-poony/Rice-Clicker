import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

interface LayerControlsProps {
  layersToRemove: number;
  onLayersToRemoveChange: (layers: number) => void;
  isGridClicked: boolean;
}

export function LayerControls({
  layersToRemove,
  onLayersToRemoveChange,
  isGridClicked,
}: LayerControlsProps) {
  const [localLayers, setLocalLayers] = useState<string>(
    String(layersToRemove)
  );
  const [locked, setLocked] = useState<boolean>(layersToRemove > 0);
  const [focused, setFocused] = useState(false);
  const [weekNumber, setWeekNumber] = useState(0);

  useEffect(() => {
    if (isGridClicked && !locked) {
      const clamped = parseAndClamp(localLayers);
      if (clamped > 0) {
        setLocked(true);
        onLayersToRemoveChange(clamped);
        setWeekNumber((prev) => prev + 1);
      }
    }
  }, [isGridClicked]);

  useEffect(() => {
    setLocalLayers(String(layersToRemove));
    if (layersToRemove === 0) {
      setLocked(false);
    }
  }, [layersToRemove]);

  const parseAndClamp = (raw: string) => {
    const parsed = raw === "" ? 0 : parseInt(raw, 10) || 0;
    return Math.max(0, Math.min(999, parsed));
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border">
      <div className="flex flex-col gap-2">
        <Label htmlFor="layers">Layers to remove</Label>
        <Input
          id="layers"
          type="number"
          min="0"
          max="999"
          disabled={locked && !focused}
          value={localLayers}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            const clamped = parseAndClamp(localLayers);
            if (clamped > 0) {
              setLocked(true);
              onLayersToRemoveChange(clamped);
              setWeekNumber((prev) => prev + 1);
            } else {
              setLocked(false);
              onLayersToRemoveChange(clamped);
            }
            setLocalLayers(String(clamped));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
          onChange={(e) => {
            setLocalLayers(e.target.value);
          }}
          className="w-24"
          placeholder="0"
        />
      </div>
      {locked && (
        <p className="text-muted-foreground text-sm">
          Layers locked at {layersToRemove}. They will unlock once the value
          reaches 0.
        </p>
      )}
      {weekNumber > 0 && (
        <div className="relative">
          <Button variant="outline" className="w-24">
            Week {weekNumber}
          </Button>
        </div>
      )}
    </div>
  );
}
