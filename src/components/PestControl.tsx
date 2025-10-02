import React from "react";
import { Button } from "./ui/button";

interface PestControlProps {
  weekNumber: number;
  onSpray: () => void;
  onPerilla: () => void;
  onPass: () => void;
}

export function PestControl({ weekNumber, onSpray, onPass, onPerilla }: PestControlProps) {
  const isSetupWeek = weekNumber === 0;

  return (
    <div className="flex flex-col items-center gap-2 my-4">
      <div className="flex gap-4">
        {isSetupWeek ? (
          <>
            <Button onClick={onPerilla} variant="outline">
              <h3 className="text-lg font-semibold">Plant flowers</h3>
            </Button>
            <Button onClick={onSpray} variant="outline">
              <h3 className="text-lg font-semibold">Spray pesticide</h3>
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onSpray} variant="outline">
              <h3 className="text-lg font-semibold">Spray pesticide</h3>
            </Button>
          </>
        )}
           <Button onClick={onPass} variant="outline">
              <h3 className="text-lg font-semibold">Pass</h3>
            </Button>
      </div>
    </div>
  );
}
