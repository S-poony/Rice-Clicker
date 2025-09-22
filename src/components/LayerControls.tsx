import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import * as XLSX from "xlsx";

interface LayerControlsProps {
  layersToRemove: number;
  onLayersToRemoveChange: (layers: number) => void;
  gridClickCount: number;
}

export function LayerControls({
  layersToRemove,
  onLayersToRemoveChange,
  gridClickCount,
}: LayerControlsProps) {
  const [weekNumber, setWeekNumber] = useState(1);
  const offsetToMatchRow = 3;

  useEffect(() => {
    if (layersToRemove === 0) {
      setWeekNumber((prev) => prev + 1);
    }
  }, [layersToRemove]);

  useEffect(() => {
    const readExcel = async () => {
      try {
        const response = await fetch("/BPH060225.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheetName = "BPH";
        const worksheet = workbook.Sheets[worksheetName];
        const cellAddress = `B${weekNumber + offsetToMatchRow}`;
        const cell = worksheet[cellAddress];
        const rawValue = cell ? cell.v : 0;
        const value = -1 * parseInt(String(rawValue), 10) || 0;
        onLayersToRemoveChange(value);
      } catch (error) {
        console.error("Error reading Excel file:", error);
      }
    };

    readExcel();
  }, [weekNumber, onLayersToRemoveChange]);

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
