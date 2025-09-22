import React from "react";
import { Button } from "./ui/button";
import * as XLSX from "xlsx";

interface DownloadButtonProps {
  workbook: XLSX.WorkBook | null;
}

export function DownloadButton({ workbook }: DownloadButtonProps) {
  const handleDownload = () => {
    if (workbook) {
      const newWorkbook = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([newWorkbook], {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "BPH060225.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={!workbook}>
      Download Excel
    </Button>
  );
}
