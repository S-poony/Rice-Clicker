import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import * as XLSX from "xlsx";

interface LayerControlsProps {
  layersToRemove: number;
  onLayersToRemoveChange: (layers: number) => void;
  pesticideChoice: number | null;
  onPesticideChoiceMade: () => void;
  workbook: XLSX.WorkBook | null;
}

export function LayerControls({
  layersToRemove,
  onLayersToRemoveChange,
  pesticideChoice,
  onPesticideChoiceMade,
  workbook,
}: LayerControlsProps) {
  const [weekNumber, setWeekNumber] = useState(1);
  const offsetToMatchRow = 2;

  useEffect(() => {
    const updateExcelAndLayers = async () => {
      if (pesticideChoice !== null && workbook) {
        try {
          const worksheetName = "BPH";
          const worksheet = workbook.Sheets[worksheetName];

          // Write pesticide choice
          const writeCellAddress = `C${weekNumber + offsetToMatchRow}`;
          XLSX.utils.sheet_add_aoa(worksheet, [[pesticideChoice]], {
            origin: writeCellAddress,
          });

          // Read new layers value
          const readCellAddress = `B${weekNumber + offsetToMatchRow + 1}`;
          const cell = worksheet[readCellAddress];
          const rawValue = cell ? cell.v : 0;
          const value = -1 * parseInt(String(rawValue), 10) || 0;
          onLayersToRemoveChange(value);

          setWeekNumber((prev) => prev + 1);
          onPesticideChoiceMade();
        } catch (error) {
          console.error("Error updating Excel file:", error);
        }
      }
    };

    updateExcelAndLayers();
  }, [pesticideChoice, workbook, weekNumber, onLayersToRemoveChange, onPesticideChoiceMade]);

  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border">
      <div className="flex flex-col gap-2">
        <p>Layers to remove: {layersToRemove}</p>
      </div>
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
