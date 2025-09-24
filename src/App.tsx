import { useState, useEffect } from "react";
import { ClickableGrid, ButtonState } from "./components/ClickableGrid";
import { LayerControls } from "./components/LayerControls";
import { PesticideControl } from "./components/PesticideControl";
import { Scoreboard } from "./components/Scoreboard";
import { GameOverDialog } from "./components/GameOverDialog";

// Simulation Constants
const cropsPerLayer = 30;
const initialPestCount = 90;
const initialMutantPestCount = 10;
const initialParasitoidCount = 12;
const initialPredatorCount = 4;
const pestReproductionConstant = 0;
const parasitoidReproductionRate = 1.25;
const predatorReproductionRate = 1.1;
const ReproductionBoost = 1.6;
const MutantPestReproductionBoost = 1.8;
const pestSurvivalRate = 0.3;
const parasitoidSurvivalRate = 0.3;
const predatorSurvivalRate = 0.5;
const MutantPestPesticideSurvivalRate = 1;
const pestConsumptionRate = 0.8;
const parasitoidConsumptionRate = 1.1;
const predatorConsumptionRate = 2.5;

export default function App() {
  const [layersToRemove, setLayersToRemove] = useState(0);
  const [layersRemoved, setLayersRemoved] = useState(0);
  const [pesticideSprayCount, setPesticideSprayCount] = useState(0);
  const [weekNumber, setWeekNumber] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const gridWidth = 5;
  const gridHeight = 5;
  const [buttonStates, setButtonStates] = useState<ButtonState[]>(
    new Array(gridWidth * gridHeight).fill(0)
  );

  // Simulation state
  const [pestCount, setPestCount] = useState(initialPestCount);
  const [mutantPestCount, setMutantPestCount] = useState(initialMutantPestCount);
  const [parasitoidCount, setParasitoidCount] = useState(
    initialParasitoidCount
  );
  const [predatorCount, setPredatorCount] = useState(initialPredatorCount);

  useEffect(() => {
    console.log({
      week: weekNumber,
      pests: pestCount,
      mutants: mutantPestCount,
      parasitoids: parasitoidCount,
      predators: predatorCount,
    });
  }, [weekNumber, pestCount, mutantPestCount, parasitoidCount, predatorCount]);

  const greenCells = buttonStates.filter((state) => state === 0).length;
  const yellowCells = buttonStates.filter((state) => state === 1).length;
  const score = 3 * greenCells + yellowCells;

  useEffect(() => {
    // Initial layers to remove calculation
    const pestTotal = pestCount + mutantPestCount;
    const cropsEaten = pestTotal * pestConsumptionRate;
    const initialLayers = Math.ceil(cropsEaten / cropsPerLayer);
    setLayersToRemove(initialLayers);
  }, []); // Runs only once on mount

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

  const handlePesticideChoice = (pesticideApplied: boolean) => {
    if (weekNumber >= 10) {
      setIsGameOver(true);
      return;
    }

    if (pesticideApplied) {
      setPesticideSprayCount((prev) => prev + 1);
    }

    // --- Start of Simulation Logic ---
    let pestReproductionRate = (2 * 7) / 10.42;
    let mutantPestReproductionRate = (2 * 7) / 10.42;

    if (pesticideSprayCount > 0) {
      pestReproductionRate = ReproductionBoost;
      mutantPestReproductionRate = MutantPestReproductionBoost;
    }

    const pestTotal = pestCount + mutantPestCount;
    const paraEat = parasitoidCount * parasitoidConsumptionRate;
    const predEat = predatorCount * predatorConsumptionRate;
    const pestEaten = Math.min(pestTotal, paraEat + predEat);
    const predationRate = pestTotal > 0 ? 1 - pestEaten / pestTotal : 1;

    let nextPestCount = pestCount;
    let nextMutantPestCount = mutantPestCount;
    let nextParasitoidCount = parasitoidCount;
    let nextPredatorCount = predatorCount;

    if (pesticideApplied) {
      nextPestCount =
        pestCount * predationRate * pestReproductionRate * pestSurvivalRate +
        pestReproductionConstant;
      nextMutantPestCount =
        mutantPestCount *
          mutantPestReproductionRate *
          MutantPestPesticideSurvivalRate +
        pestReproductionConstant;
      nextParasitoidCount =
        parasitoidCount * parasitoidReproductionRate * parasitoidSurvivalRate;
      nextPredatorCount =
        predatorCount * predatorReproductionRate * predatorSurvivalRate;
    } else {
      nextPestCount =
        pestCount * predationRate * pestReproductionRate +
        pestReproductionConstant;
      nextMutantPestCount =
        mutantPestCount * mutantPestReproductionRate + pestReproductionConstant;
      nextParasitoidCount = parasitoidCount * parasitoidReproductionRate;
      nextPredatorCount = predatorCount * predatorReproductionRate;
    }

    setPestCount(nextPestCount);
    setMutantPestCount(nextMutantPestCount);
    setParasitoidCount(nextParasitoidCount);
    setPredatorCount(nextPredatorCount);

    const nextPestTotal = nextPestCount + nextMutantPestCount;
    const cropsEaten = nextPestTotal * pestConsumptionRate;
    const newLayersToRemove = Math.ceil(cropsEaten / cropsPerLayer);

    setLayersToRemove(newLayersToRemove);
    setWeekNumber((prev) => prev + 1);
    // --- End of Simulation Logic ---
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
                onYes={() => handlePesticideChoice(true)}
                onNo={() => handlePesticideChoice(false)}
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
        {/* The DownloadButton is no longer needed as we are not using the excel file */}
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