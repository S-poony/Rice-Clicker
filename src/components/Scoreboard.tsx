import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ScoreboardProps {
  score: number;
  pesticideSprayCount: number;
}

export function Scoreboard({ score, pesticideSprayCount }: ScoreboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scoreboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <p className="font-medium">Score:</p>
          <p className="text-lg font-bold">{score.toFixed(0)}</p>
        </div>
        <div className="flex justify-between">
          <p className="font-medium">Pesticide Sprays:</p>
          <p className="text-lg font-bold">{pesticideSprayCount}</p>
        </div>
      </CardContent>
    </Card>
  );
}
