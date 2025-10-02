import { useState, useEffect } from "react";
import { ClickableGrid, ButtonState } from "./components/ClickableGrid";
import { LayerControls } from "./components/LayerControls";
import { PestControl } from "./components/PestControl";
import { Scoreboard } from "./components/Scoreboard";
import { GameOverDialog } from "./components/GameOverDialog";
import { Popup } from "./components/Popup";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { FlowerField } from "./components/FlowerField";

type Tip = {
  title: string;
  content: string;
};

// Simulation Constants
const cropsPerLayer = 30;
const initialPestCount = Math.random() * 400;
const initialMutantPestCount = Math.random() * 40;
const initialParasitoidCount = Math.random() * 48;
const initialPredatorCount = Math.random() * 16;
const flowerBoost = 2;
const perillaParasitoidBoost = 2;
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
  const [weekNumber, setWeekNumber] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [totalPestsEaten, setTotalPestsEaten] = useState(0);
  const [pesticideScheduled, setPesticideScheduled] = useState(false);

  const [perilla, setPerilla] = useState(false);
  const [averageOutsidePests, setAverageOutsidePests] = useState(6);
  const [averageOutsideParasitoids, setAverageOutsideParasitoids] = useState(0);

  const gridWidth = 10;
  const gridHeight = 10;
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
  const [pestCount, setPestCount] = useState(0);
  const [mutantPestCount, setMutantPestCount] = useState(0);
  const [parasitoidCount, setParasitoidCount] = useState(initialParasitoidCount);
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
  const brownCells = buttonStates.filter((state) => state === 2).length;
  const score = weekNumber * (greenCells + yellowCells + brownCells / 3);

  useEffect(() => {
    // This effect is now empty as initial calculation is handled in the setup phase
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
    if (weekNumber === 0) {
      // This is the setup turn. Apply agroecological choices.
      let boostedInitialParasitoidCount = initialParasitoidCount;
      if (perillaApplied) {
        setPerilla(true);
        // Boost initial parasitoids and establish outside population
        boostedInitialParasitoidCount *= flowerBoost;
        setAverageOutsideParasitoids(perillaParasitoidBoost);
      }
      if (pesticideApplied) {
        setPesticideScheduled(true);
      }
      // We can add other agroecological methods here in the future
      
      let pestStart = initialPestCount;
      let mutantStart = initialMutantPestCount;
      let parasitoidStart = boostedInitialParasitoidCount;
      let predatorStart = initialPredatorCount;

      if (pesticideApplied) {
        // Apply pesticide effects immediately to the starting populations for week 1
        pestStart *= pestSurvivalRate;
        parasitoidStart *= parasitoidSurvivalRate;
        predatorStart *= predatorSurvivalRate;
        // Mutants are not affected
        mutantStart *= MutantPestPesticideSurvivalRate;
        setPesticideSprayCount((prev) => prev + 1);
      }

      // Now, start the infestation for week 1
      setPestCount(pestStart);
      setMutantPestCount(mutantStart);
      setParasitoidCount(parasitoidStart);
      setPredatorCount(predatorStart);

      const pestTotal = pestStart + mutantStart;
      const cropsEaten = pestTotal * pestConsumptionRate;
      const initialLayers = Math.ceil(cropsEaten / cropsPerLayer);
      setLayersToRemove(initialLayers);

      setWeekNumber(1);
      return;
    }

    let isPesticideAppliedThisTurn = pesticideApplied;
    if (weekNumber === 1 && pesticideScheduled) {
      // This logic is now handled in the week 0 setup.
      // We keep the flag reset for future logic.
      isPesticideAppliedThisTurn = false; 
      setPesticideScheduled(false); // Reset after use
    }

    if (weekNumber >= 10) {
      setIsGameOver(true);
      return;
    }

    if (isPesticideAppliedThisTurn) {
      setPesticideSprayCount((prev) => prev + 1);
    }

    // Use a local "sprayedCount" that includes this turn's action so the
    // reproduction logic can react immediately if desired.
    const sprayedCount = isPesticideAppliedThisTurn ? pesticideSprayCount + 1 : pesticideSprayCount;

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
    const pestSurvival = isPesticideAppliedThisTurn ? pestSurvivalRate : 1;
    const parasitoidSurvival = isPesticideAppliedThisTurn ? parasitoidSurvivalRate : 1;
    const predatorSurvival = isPesticideAppliedThisTurn ? predatorSurvivalRate : 1;
    // Mutants always survive pesticides in this model
    const mutantSurvival = isPesticideAppliedThisTurn ? MutantPestPesticideSurvivalRate : 1;

    const survivingPests = pestsAfterPredation * pestSurvival;
    const survivingMutants = mutantsAfterPredation * mutantSurvival;
    const survivingParasitoids = parasitoidCount * parasitoidSurvival;
    const survivingPredators = predatorCount * predatorSurvival;

    // 4. Calculate new population from survivors and reproduction

    const outsidePests = Math.random() * averageOutsidePests * 2;
    const outsideParasitoids = Math.random() * averageOutsideParasitoids * 2;

    const nextPestCount = survivingPests * pestReproductionRate + outsidePests;
    const nextMutantPestCount = survivingMutants * mutantPestReproductionRate;
    const nextParasitoidCount = survivingParasitoids * parasitoidReproductionRate + outsideParasitoids;
    const nextPredatorCount = survivingPredators * predatorReproductionRate;

    setPestCount(nextPestCount);
    setMutantPestCount(nextMutantPestCount);
    setParasitoidCount(nextParasitoidCount);
    setPredatorCount(nextPredatorCount);

    const nextPestTotal = nextPestCount + nextMutantPestCount;
    const cropsEaten = nextPestTotal * pestConsumptionRate;
    const newLayersToRemove = Math.ceil(((cropsEaten / cropsPerLayer)) / (((gridWidth * gridHeight) * 3) / (greenCells * 3 + yellowCells * 2 + brownCells))) ;

    setLayersToRemove(newLayersToRemove);
    setWeekNumber((prev) => prev + 1);
    setTotalPestsEaten(Math.ceil(totalPestsEaten));

    // --- End of Simulation Logic ---
  };

  return (
    <div className="min-h-screen p-4 relative">
      <div className="absolute inset-0 bg-background -z-20" />
      {perilla && <FlowerField />} 
      <div className="relative z-10">
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

        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Rice Clicker</h1>
            <p className="text-muted-foreground md:text-xl">
              This field is full of Brown Plant Hoppers, a common pest in rice.
              But there are also wasps and spiders that prey on them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center space-y-4 pt-6">
                  {layersToRemove === 0 && !isGameOver && (
                    <PestControl
                      onSpray={() => handlePestChoice(true)}
                      onPass={() => handlePestChoice(false)}
                      onPerilla={() => handlePestChoice(false, true)}
                      weekNumber={weekNumber}
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
                  <h3 className="text-xl font-semibold tracking-tight pt-2">Your Field</h3>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                </CardHeader>
                <CardContent className="space-y-4">
                  <LayerControls
                    layersToRemove={layersToRemove}
                    weekNumber={weekNumber}
                  />
                  {weekNumber > 1 && (
                    <p className="text-sm text-muted-foreground">
                      BPH eaten by wasps and spiders: {totalPestsEaten} <br />
                      Average number of pests coming from neighbouring fields: {averageOutsidePests}
                    </p>
                  )}
                  <Button onClick={() => setInsectDiversityOpen(true)}>Assess Insect Diversity</Button>
                  <Scoreboard
                    score={score}
                    pesticideSprayCount={pesticideSprayCount}
                  />
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Learn More</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-2">
                  <Button onClick={showRandomTip}>Get a Tip</Button>
                  <p className="text-sm text-center text-muted-foreground pt-2">
                    Want to learn more? Visit the <a href="https://github.com/S-poony/Rice-Clicker" className="underline">project repository</a>.
                  </p>
                </CardContent>
              </Card>
              <Popup
                title="Insect Diversity"
                content={<>
                  You place traps in your field and extrapolate the number of insects caught to assess their diversity. <br /><br />
                  Number of BPH: {Math.floor(pestCount + mutantPestCount)} <br />
                  Number of wasps: {Math.floor(parasitoidCount)} <br />
                  Number of spiders: {Math.floor(predatorCount)} <br />
                </>}
                open={insectDiversityOpen}
                onOpenChange={setInsectDiversityOpen}
              />
              <Popup
                title={currentTip?.title ?? "Tip"}
                content={<>{currentTip?.content ?? "Loading tips..."}</>}
                open={tipsOpen}
                onOpenChange={setTipsOpen}
              />
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
    </div>
  );

}
