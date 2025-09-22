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
  const [weekNumber, setWeekNumber] = useState(1);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch("/BPH060225.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        setWorkbook(wb);

        // Read initial layers to remove value
        const worksheetName = "BPH";
        const worksheet = wb.Sheets[worksheetName];
        const offsetToMatchRow = 3;
        const readCellAddress = `B${weekNumber + offsetToMatchRow}`;
        const cell = worksheet[readCellAddress];
        const rawValue = cell ? cell.v : 0;
        const value = -1 * parseInt(String(rawValue), 10) || 0;
        setLayersToRemove(value);
      } catch (error) {
        console.error("Error loading Excel file or initial data:", error);
      }
    };

    loadInitialData();
  }, []);

  const handleGenerateGrid = () => {
    setGridGenerated(true);
  };

  const handleDecrementLayers = () => {
    setLayersToRemove((prev) => Math.max(0, prev - 1));
  };

  const handlePesticideChoice = (choice: number) => {
    if (workbook) {
      try {
        const worksheetName = "BPH";
        const worksheet = workbook.Sheets[worksheetName];
        const offsetToMatchRow = 3;

        // Write pesticide choice for the current week
        const writeCellAddress = `C${weekNumber + offsetToMatchRow}`;
        XLSX.utils.sheet_add_aoa(worksheet, [[choice]], {
          origin: writeCellAddress,
        });

        // Determine the next week and read its value
        const nextWeekNumber = weekNumber + 1;
        const readCellAddress = `B${nextWeekNumber + offsetToMatchRow}`;
        const cell = worksheet[readCellAddress];
        const rawValue = cell ? cell.v : 0;
        const value = -1 * parseInt(String(rawValue), 10) || 0;

        // Update state for the next turn
        setLayersToRemove(value);
        setWeekNumber(nextWeekNumber);
      } catch (error) {
        console.error("Error updating Excel file:", error);
      }
    }
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
              weekNumber={weekNumber}
            />
          </div>
        )}
        {workbook && <DownloadButton workbook={workbook} />}
      </div>
    </div>
  );
}