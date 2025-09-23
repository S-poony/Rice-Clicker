import { useState, useEffect } from "react";
import { ClickableGrid, ButtonState } from "./components/ClickableGrid";
import { LayerControls } from "./components/LayerControls";
import { PesticideControl } from "./components/PesticideControl";
import { DownloadButton } from "./components/DownloadButton";
import { Scoreboard } from "./components/Scoreboard";
import { GameOverDialog } from "./components/GameOverDialog";
import * as XLSX from "xlsx";

export default function App() {
  const [layersToRemove, setLayersToRemove] = useState(0);
  const [layersRemoved, setLayersRemoved] = useState(0);
  const [pesticideSprayCount, setPesticideSprayCount] = useState(0);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [weekNumber, setWeekNumber] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const gridWidth = 5;
  const gridHeight = 5;
  const [buttonStates, setButtonStates] = useState<ButtonState[]>(
    new Array(gridWidth * gridHeight).fill(0)
  );

  const greenCells = buttonStates.filter((state) => state === 0).length;
  const yellowCells = buttonStates.filter((state) => state === 1).length;
  const score = 3 * greenCells + yellowCells;

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

  useEffect(() => {
    if (weekNumber === 10 && layersToRemove === 0) {
      setIsGameOver(true);
    }
    const allRed = buttonStates.every((state) => state === 2);
    if (allRed) {
      setIsGameOver(true);
    }
  }, [layersToRemove, weekNumber, buttonStates]);

  const handleDecrementLayers = () => {
    setLayersToRemove((prev) => Math.max(0, prev - 1));
    setLayersRemoved((prev) => prev + 1);
  };

  const handlePesticideChoice = (choice: number) => {
    if (workbook) {
      if (choice === 1) {
        setPesticideSprayCount((prev) => prev + 1);
      }

      if (weekNumber >= 10) {
        setIsGameOver(true);
        return;
      }

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
          <h1>Rice invasion</h1>
          <p className="text-muted-foreground">
            This field is full of Brown Plant Hoppers, a common pest in rice.
            But there are also wasps and spiders that prey on them. You can only
            see the state of your rice. Use pesticides wisely.
          </p>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-6">
          <div className="space-y-4">
            <h3>Your Field</h3>
            {layersToRemove === 0 && !isGameOver && (
              <PesticideControl
                onYes={() => handlePesticideChoice(1)}
                onNo={() => handlePesticideChoice(0)}
              />
            )}
            <ClickableGrid
              width={gridWidth}
              height={gridHeight}
              layersToRemove={layersToRemove}
              onDecrementLayers={handleDecrementLayers}
              buttonStates={buttonStates}
              setButtonStates={setButtonStates}
            />
          </div>
          <div className="space-y-6">
            <LayerControls
              layersToRemove={layersToRemove}
              weekNumber={weekNumber}
            />
            <Scoreboard
              score={score}
              pesticideSprayCount={pesticideSprayCount}
            />
          </div>
        </div>
        {workbook && <DownloadButton workbook={workbook} />}
      </div>
      <GameOverDialog
        isOpen={isGameOver}
        score={score}
        pesticideSprayCount={pesticideSprayCount}
        weekNumber={weekNumber}
        onShare={() => alert("Score copied to clipboard!")}
        onClose={() => setIsGameOver(false)}
      />
    </div>
  );
}