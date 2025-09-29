import React from "react";
import { Button } from "./ui/button";

interface PestControlProps {
  onSpray: () => void;
  onPerilla: () => void;
  onPass: () => void;
}

export function PestControl({ onSpray, onPass, onPerilla }: PestControlProps) {
  const [AgroEco, setAgroEco] = React.useState(false);
  return (
    <div className="flex flex-col items-center gap-2 my-4">
      
      <div className="flex gap-4">
        <Button onClick={onSpray} variant="outline">
          <h3 className="text-lg font-semibold">Spray pesticide</h3>
        </Button>

       {/*  {AgroEco === false &&(
        <Button className="ml-4"
          onClick={setAgroEco}>
          <h3 className="text-lg font-semibold">Unlock agro-ecological methods</h3>
          </Button>
        )} */}

        {AgroEco && (
          <div className="flex gap-2">
            <Button onClick={onPerilla} variant="outline">Plant perilla flowers</Button>
            <Button onClick={onPass} variant="outline">Apply mulches</Button>
          </div>
        )}

        <Button onClick={onPass} variant="outline">
          <h3 className="text-lg font-semibold">Pass</h3>
        </Button>
      </div>
    </div>
  );
}
