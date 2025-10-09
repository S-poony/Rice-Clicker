import React from "react";
import { Button } from "./ui/button";

interface PestControlProps {
  weekNumber: number;
  onSpray: () => void;
  onFlower: () => void;
  onPass: () => void;
}

export function PestControl({ weekNumber, onSpray, onPass, onFlower: onFlower }: PestControlProps) {
  const isSetupWeek = weekNumber === 0;

  return (
    <div style={{ width: "100%", boxSizing: "border-box", margin: "12px 0" }}>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "center",
        alignItems: "center",
      }}>
        {isSetupWeek ? (
          <>
            <div style={{ flex: "1 1 120px", minWidth: 0 }}>
              <Button onClick={() => { console.log("PestControl: Plant clicked"); onFlower(); }} variant="outline" style={{ width: "100%" } as any}>
                <h3 style={{ margin: 0, fontSize: 14 }}>Plant flowers</h3>
              </Button>
            </div>

            <div style={{ flex: "1 1 120px", minWidth: 0 }}>
              <Button onClick={() => { console.log("PestControl: Spray clicked"); onSpray(); }} variant="outline" style={{ width: "100%" } as any}>
                <h3 style={{ margin: 0, fontSize: 14 }}>Spray pesticide</h3>
              </Button>
            </div>
          </>
        ) : (
          <div style={{ flex: "1 1 120px", minWidth: 0 }}>
            <Button onClick={() => { console.log("PestControl: Spray clicked"); onSpray(); }} variant="outline" style={{ width: "100%" } as any}>
              <h3 style={{ margin: 0, fontSize: 14 }}>Spray pesticide</h3>
            </Button>
          </div>
        )}

        <div style={{ flex: "1 1 120px", minWidth: 0 }}>
          <Button onClick={() => { console.log("PestControl: Pass clicked"); onPass(); }} variant="outline" style={{ width: "100%" } as any}>
            <h3 style={{ margin: 0, fontSize: 14 }}>Pass</h3>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PestControl;
