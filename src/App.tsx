import { useState, useEffect } from "react";
import { GridControls } from "./components/GridControls";
import { ClickableGrid } from "./components/ClickableGrid";
import { LayerControls } from "./components/LayerControls";
import { PesticideControl } from "./components/PesticideControl";
import { DownloadButton } from "./components/DownloadButton";
import * as XLSX from "xlsx";

export default function App() {
  const [gridWidth, setGridWidth] = useState(5);
  const [gridHeight, setGridHeight] = useState(5);
  const [gridGenerated, setGridGenerated] = useState(false);
  const [layersToRemove, setLayersToRemove] = useState(0);
  const [pesticideChoice, setPesticideChoice] = useState<number | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  useEffect(() => {
    const loadWorkbook = async () => {
      try {
        const response = await fetch("/BPH060225.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        setWorkbook(wb);
      } catch (error) {
        console.error("Error loading Excel file:", error);
      }
    };

    loadWorkbook();
  }, []);

  const handleGenerateGrid = () => {
    setGridGenerated(true);
  };

  const handleDecrementLayers = () => {
    setLayersToRemove((prev) => Math.max(0, prev - 1));
  };

  const handlePesticideChoice = (choice: number) => {
    setPesticideChoice(choice);
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
              {layersToRemove === 0 && (
                <PesticideControl
                  onYes={() => handlePesticideChoice(1)}
                  onNo={() => handlePesticideChoice(0)}
                  disabled={pesticideChoice !== null}
                />
              )}
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
              pesticideChoice={pesticideChoice}
              onPesticideChoiceMade={() => setPesticideChoice(null)}
              workbook={workbook}
            />
          </div>
        )}
        {workbook && <DownloadButton workbook={workbook} />}
      </div>
    </div>
  );
}