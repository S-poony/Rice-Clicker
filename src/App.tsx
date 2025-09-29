import { useState, useEffect } from "react";
import { ClickableGrid, ButtonState } from "./components/ClickableGrid";
import { LayerControls } from "./components/LayerControls";
import { PestControl } from "./components/PestControl";
import { Scoreboard } from "./components/Scoreboard";
import { GameOverDialog } from "./components/GameOverDialog";
import { Popup } from "./components/Popup";
import { Button } from "./components/ui/button";

type Tip = {
  title: string;
  content: string;
};

// Simulation Constants
const cropsPerLayer = 30;
const initialPestCount = Math.random() * 200;
const initialMutantPestCount = Math.random() * 20;
const initialParasitoidCount = Math.random() * 24;
const initialPredatorCount = Math.random() * 8;
const perillaPower = 4;
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
  const [insectDiversityOpen, setInsectDiversityOpen] = useState<boolean>(false);

  const [tipsOpen, setTipsOpen] = useState<boolean>(false);
  const [tips, setTips] = useState<Tip[]>([]);
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);

  const [layersToRemove, setLayersToRemove] = useState(0);
  const [layersRemoved, setLayersRemoved] = useState(0);
  const [pesticideSprayCount, setPesticideSprayCount] = useState(0);
  const [weekNumber, setWeekNumber] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [totalPestsEaten, setTotalPestsEaten] = useState(0);

  const [perilla, setPerilla] = useState(false);
  const [averageOutsidePests, setAverageOutsidePests] = useState(6);

  const gridWidth = 5;
  const gridHeight = 5;
  const [buttonStates, setButtonStates] = useState<ButtonState[]>(
    new Array(gridWidth * gridHeight).fill(0)
  );

  // load tips once from public/TipnpsList.json
  useEffect(() => {
    fetch("TipsList.json", { cache: "no-cache" })
      .then((res) => res.json())
      .then((data: Tip[]) => {
        if (Array.isArray(data)) {
          setTips(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load tips:", err);
      });
  }, []);

  const showRandomTip = () => {
    if (tips.length === 0) {
      setCurrentTip({ title: "No tips", content: "No tips available." });
    } else {
      const randomIndex = Math.floor(Math.random() * tips.length);
      setCurrentTip(tips[randomIndex]);
    }
    setTipsOpen(true);
  };

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
  const score = weekNumber * (greenCells + yellowCells / 2);

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

  // IMPORTANT: this handler now accepts one parameter per method to pest control. Keep in mind states are synchronous.
  const handlePestChoice = (pesticideApplied: boolean, perillaApplied = false) => {
    if (weekNumber >= 10) {
      setIsGameOver(true);
      return;
    }

    if (pesticideApplied) {
      setPesticideSprayCount((prev) => prev + 1);
    }

    // Use a local "sprayedCount" that includes this turn's action so the
    // reproduction logic can react immediately if desired.
    const sprayedCount = pesticideApplied ? pesticideSprayCount + 1 : pesticideSprayCount;

    // --- Start of Simulation Logic ---
    // 1. Determine reproduction rates based on pesticide history
    let pestReproductionRate = (2 * 7) / 10.42;
    let mutantPestReproductionRate = (2 * 7) / 10.42;
    if (sprayedCount > 0) {
      pestReproductionRate = ReproductionBoost;
      mutantPestReproductionRate = MutantPestReproductionBoost;
    }

    // 2. Calculate predation
    const pestTotal = pestCount + mutantPestCount;
    const paraEat = parasitoidCount * parasitoidConsumptionRate;
    const predEat = predatorCount * predatorConsumptionRate;
    const totalPestsEaten = Math.min(pestTotal, paraEat + predEat);

    // Pests and mutants are eaten proportionally to their numbers
    const proportionOfPests = pestTotal > 0 ? pestCount / pestTotal : 0;
    const proportionOfMutants = pestTotal > 0 ? mutantPestCount / pestTotal : 0;

    const pestsEaten = totalPestsEaten * proportionOfPests;
    const mutantsEaten = totalPestsEaten * proportionOfMutants;

    const pestsAfterPredation = pestCount - pestsEaten;
    const mutantsAfterPredation = mutantPestCount - mutantsEaten;

    // 3. Calculate survivors after pesticide application (if any)
    const pestSurvival = pesticideApplied ? pestSurvivalRate : 1;
    const parasitoidSurvival = pesticideApplied ? parasitoidSurvivalRate : 1;
    const predatorSurvival = pesticideApplied ? predatorSurvivalRate : 1;
    // Mutants always survive pesticides in this model
    const mutantSurvival = pesticideApplied ? MutantPestPesticideSurvivalRate : 1;

    const survivingPests = pestsAfterPredation * pestSurvival;
    const survivingMutants = mutantsAfterPredation * mutantSurvival;
    const survivingParasitoids = parasitoidCount * parasitoidSurvival;
    const survivingPredators = predatorCount * predatorSurvival;

    // 4. Calculate new population from survivors and reproduction
    // Use an "effective" average outside pests for this turn if Perilla is applied now
    const effectiveAverageOutsidePests = perillaApplied
      ? Math.max(0, averageOutsidePests - perillaPower)
      : averageOutsidePests;

    const outsidePests = Math.random() * effectiveAverageOutsidePests * 2;

    const nextPestCount = survivingPests * pestReproductionRate + outsidePests;
    const nextMutantPestCount = survivingMutants * mutantPestReproductionRate + outsidePests;
    const nextParasitoidCount = survivingParasitoids * parasitoidReproductionRate;
    const nextPredatorCount = survivingPredators * predatorReproductionRate;

    setPestCount(nextPestCount);
    setMutantPestCount(nextMutantPestCount);
    setParasitoidCount(nextParasitoidCount);
    setPredatorCount(nextPredatorCount);

    const nextPestTotal = nextPestCount + nextMutantPestCount;
    const cropsEaten = nextPestTotal * pestConsumptionRate;
    const newLayersToRemove = Math.ceil(((cropsEaten / cropsPerLayer)) / (((gridWidth * gridHeight) * 3) / (greenCells * 3 + yellowCells)));

    setLayersToRemove(newLayersToRemove);
    setWeekNumber((prev) => prev + 1);
    setTotalPestsEaten(Math.ceil(totalPestsEaten));

    // persist the Perilla state / average change so future turns see it
    if (perillaApplied) {
      setAverageOutsidePests(effectiveAverageOutsidePests);
      setPerilla(true);
    }
    // --- End of Simulation Logic ---
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <Popup
        title="Tutorial"
        content={
          <>
            Every week, you have to click on your field to remove the layers of rice that the Brown Plant Hoppers have damaged.
            <br />
            <br />
            After 10 weeks, you will harvest your healthy and damaged rice pads.
          </>
        }
        open={true}
      />
      <Popup
        title="Warning"
        content={
          <>
            More than half of the BPH population are pesticide-resistant mutants. 
            <br />Using pesticides will not reduce their numbers, but it will harm the beneficial insects that control the regular BPH population. 
          </>
        }
        open={pestCount - mutantPestCount < 0}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1>Rice Clicker</h1>
          <p className="text-muted-foreground">
            This field is full of Brown Plant Hoppers, a common pest in rice.
            But there are also wasps and spiders that prey on them. 
          </p>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-6">
          <div className="space-y-4">
            <Button variant="outline" className="w-24">
              Your field
            </Button>
            {layersToRemove === 0 && !isGameOver && (
              <PestControl
                onSpray={() => handlePestChoice(true)}
                onPass={() => handlePestChoice(false)}
                // pass "perillaApplied=true" so the handler computes the perilla effect immediately
                onPerilla={() => handlePestChoice(false, true)}
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
            {weekNumber > 1 && (
              <p className="text-muted-foreground">
                BPH eaten by wasps and spiders: {totalPestsEaten} <br />
                <br />
                Average number of pests coming from neighbouring fields: {averageOutsidePests}
              </p>

            )}
            <Button onClick={() => setInsectDiversityOpen(true)}>Assess insect diversity this week</Button>
            <Popup
              title="Insect Diversity"
              content={<> 
                You place traps in your field and extrapolate the number of insects caught to assess their diversity. <br /><br />
                number of BPH: {Math.ceil(pestCount+mutantPestCount)} <br />
                number of wasps: {Math.ceil(parasitoidCount)} <br />
                number of spiders: {Math.ceil(predatorCount)} <br />  
              </>}
              open={insectDiversityOpen}
              onOpenChange={setInsectDiversityOpen}
            />
            <Scoreboard
              score={score}
              pesticideSprayCount={pesticideSprayCount}
            />

            <Button onClick={showRandomTip}>Tips</Button>
            <Popup
              title={currentTip?.title ?? "Tip"}
              content={<>{currentTip?.content ?? "Loading tips..."}</>}
              open={tipsOpen}
              onOpenChange={setTipsOpen}
            />
            < h3 > Want to learn more? Visit the <a href="https://github.com/S-poony/Rice-Clicker">project repository</a> </h3>

          </div>
        </div>
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
