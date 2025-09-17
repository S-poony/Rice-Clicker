import { useState } from "react";
import { GridControls } from "./components/GridControls";
import { ClickableGrid } from "./components/ClickableGrid";
import { LayerControls } from "./components/LayerControls";

export default function App() {
  const [gridWidth, setGridWidth] = useState(5);
  const [gridHeight, setGridHeight] = useState(5);
  const [gridGenerated, setGridGenerated] = useState(false);
  const [layersToRemove, setLayersToRemove] = useState(0);
  const [isGridClicked, setIsGridClicked] = useState(false);

  const handleGenerateGrid = () => {
    setGridGenerated(true);
  };

  const handleDecrementLayers = () => {
    setLayersToRemove((prev) => Math.max(0, prev - 1));
    setIsGridClicked(true);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1>Interactive Grid Builder</h1>
          <p className="text-muted-foreground">
            Create a customizable grid where squares progress from Green →
            Yellow → Red and cannot go back
          </p>
        </div>

        <GridControls
          width={gridWidth}
          height={gridHeight}
          onWidthChange={setGridWidth}
          onHeightChange={setGridHeight}
          onGenerateGrid={handleGenerateGrid}
        />

        {gridGenerated && (
          <div className="grid grid-cols-[1fr_auto] gap-6">
            <div className="space-y-4">
              <h3>Your Field</h3>
              <ClickableGrid
                width={gridWidth}
                height={gridHeight}
                layersToRemove={layersToRemove}
                onDecrementLayers={handleDecrementLayers}
              />
            </div>
            <LayerControls
              layersToRemove={layersToRemove}
              onLayersToRemoveChange={setLayersToRemove}
              isGridClicked={isGridClicked}
            />
          </div>
        )}
      </div>
    </div>
  );
}