import React from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

interface GridControlsProps {
  width: number;
  height: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onGenerateGrid: () => void;
}

export function GridControls({
  width,
  height,
  onWidthChange,
  onHeightChange,
  onGenerateGrid,
}: GridControlsProps) {
  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border">
      <h2>Grid Configuration</h2>

      <div className="flex gap-4 items-end flex-wrap">
        <div className="flex flex-col gap-2">
          <Label htmlFor="width">Width</Label>
          <Input
            id="width"
            type="number"
            min="1"
            max="20"
            value={width}
            onChange={(e) =>
              onWidthChange(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="height">Height</Label>
          <Input
            id="height"
            type="number"
            min="1"
            max="20"
            value={height}
            onChange={(e) =>
              onHeightChange(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-20"
          />
        </div>
        <Button onClick={onGenerateGrid} variant="default">
          Generate Grid
        </Button>
      </div>

      <div className="space-y-1">
        <p className="text-muted-foreground">
          Grid size: {width} × {height} ({width * height} buttons)
        </p>
      </div>
    </div>
  );
}
