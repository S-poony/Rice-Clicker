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
import { PopulationGraph, WeekData } from "./components/Graph"; 
import { Header } from "./components/ui/dialog";

type Tip = {
  title: string;
  content: string;
};

// Simulation Constants
const cropsPerLayer = 30;
const initialPestCount = Math.random() * 400;
const initialMutantPestCount = Math.random() * 40;
const initialParasitoidCount = Math.random() * 20;
const initialPredatorCount = Math.random() * 10;
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
  const [simulationHistory, setSimulationHistory] = useState<WeekData[]>([]); 
 // --- Paste this updated function inside the 'App' functional component ---

  const downloadDataCSV = () => {
    if (simulationHistory.length === 0) {
      alert("No simulation data to download yet.");
      return;
    }

    // Define the mapping from internal variable names (keys) to descriptive column names (values)
    const columnMap = {
      week: 'Week',
      normalPestCount: 'BPH (Normal)',
      mutantPestCount: 'BPH (Mutant)',
      parasitoidCount: 'Parasitoids (Wasps)',
      predatorCount: 'Predators (Spiders)',
      Pest_Immigration: 'BPH Immigration Rate',
      Parasitoid_Immigration: 'Parasitoid Immigration Rate',
    };

    // Get the keys in the defined order to ensure columns are consistent
    const keysInOrder = Object.keys(columnMap) as (keyof WeekData)[];

    // 1. Generate the CSV Headers from the map's DESCRIPTIVE VALUES
    const csvHeaders = Object.values(columnMap).join(',');

    // 2. Convert the data array to CSV rows
    const csvRows = simulationHistory.map(row => {
      // Use the keysInOrder array to extract the data values in the correct order
      const values = keysInOrder.map(key => {
        const value = row[key]; // Access data using the defined key
        
        // Handle floating point numbers by rounding to 2 decimal places
        if (typeof value === 'number') {
          return Math.round(value * 100) / 100;
        }
        return value;
      });
      return values.join(',');
    });

    // 3. Combine headers and rows
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    // 4. Create a Blob and trigger the download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'rice_bph_simulation_data.csv');
    
    // Append the link to the body, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

// Define the breakpoint for 'md' (medium screen)
  const MD_BREAKPOINT = 768;

  // --- Responsive State Hook ---
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= MD_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= MD_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
  const [parasitoidCount, setParasitoidCount] = useState(initialParasitoidCount);
  const [predatorCount, setPredatorCount] = useState(initialPredatorCount);

  // Initialize simulationHistory with the Week 0 data
  const initialWeek0Data: WeekData = {
    week: 0,
    normalPestCount: initialPestCount,
    mutantPestCount: initialMutantPestCount,
    parasitoidCount: initialParasitoidCount,
    predatorCount: initialPredatorCount,
    Pest_Immigration: 0, 
    Parasitoid_Immigration: 0,
  };

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
  const totalCells = gridHeight * gridWidth;
  const GREEN_YIELD = 3;
  const YELLOW_YIELD = 2;
  const BROWN_YIELD = 1;
  const currentFieldYield = greenCells * GREEN_YIELD + yellowCells * YELLOW_YIELD + brownCells * BROWN_YIELD;
  const MAX_FIELD_YIELD = totalCells * GREEN_YIELD;
  const fieldDamage = Math.max(
    1,
    MAX_FIELD_YIELD / currentFieldYield
  );
  const score = (6 * greenCells + 3 * yellowCells + brownCells) * weekNumber;

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
    console.log("handlePestChoice called:", { weekNumber, pesticideApplied, perillaApplied, layersToRemove, averageOutsideParasitoids,  }); //debug
    // SETUP PHASE
    if (weekNumber === 0) {
      let boostedInitialParasitoidCount = initialParasitoidCount;
      let nextWeekParasitoidImmigration = 0;
      if (perillaApplied) {
        setPerilla(true);
        boostedInitialParasitoidCount *= flowerBoost;
        const perillaBoostValue = perillaParasitoidBoost;
        setAverageOutsideParasitoids(perillaBoostValue);
        nextWeekParasitoidImmigration = Math.random() * perillaBoostValue * 2;
      }
      if (pesticideApplied) {
        setPesticideScheduled(true);
      }
      
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

        const weekOneData: WeekData = {
          week: 1, // This is the data after the initial choices and the first 'turn'
          normalPestCount: pestStart,
          mutantPestCount: mutantStart,
          parasitoidCount: parasitoidStart,
          predatorCount: predatorStart,
          Pest_Immigration: 0, // No immigration yet for the first calculated step
          Parasitoid_Immigration: nextWeekParasitoidImmigration
        };
      setSimulationHistory((prevHistory) => [...prevHistory, weekOneData]);
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

    // 1. Create the new data object (nextWeekData is defined here)
    const nextWeekData: WeekData = {
      week: weekNumber + 1,
      normalPestCount: nextPestCount,
      mutantPestCount: nextMutantPestCount,
      parasitoidCount: nextParasitoidCount,
      predatorCount: nextPredatorCount,
      // Ensure these values are also calculated in your logic:
      Pest_Immigration: outsidePests, 
      Parasitoid_Immigration: outsideParasitoids, 
    };

    setPestCount(nextPestCount);
    setMutantPestCount(nextMutantPestCount);
    setParasitoidCount(nextParasitoidCount);
    setPredatorCount(nextPredatorCount);

    const nextPestTotal = nextPestCount + nextMutantPestCount;
    const cropsEaten = nextPestTotal * pestConsumptionRate;
    const baseDamageInLayers = (nextPestTotal * pestConsumptionRate) / cropsPerLayer;
    const newLayersToRemove = Math.ceil(baseDamageInLayers * fieldDamage);

    setLayersToRemove(newLayersToRemove);

    // Append the new data to the history array
    setSimulationHistory((prevHistory) => [...prevHistory, nextWeekData]);
    setWeekNumber((prev) => prev + 1);
    setTotalPestsEaten(Math.ceil(totalPestsEaten));

    // --- End of Simulation Logic ---
  };

  return (
    <div style={{ minHeight: '100vh', padding: '1rem', position: 'relative' }}>
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          bottom: 0, 
          left: 0, 
          backgroundColor: '#f8f8f8', // Approximation of bg-background
          zIndex: -20 
        }} 
      />
      {perilla && <FlowerField />} 
      <div style={{ position: 'relative', zIndex: 10 }}>
        {weekNumber>0 && (
          <Popup
          title="Your field is infested!"
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
        )}
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

        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' /* space-y-6 */ }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' /* space-y-2 */ }}>
            <h1 
              style={{ 
                fontSize: '2.5rem', // Approximation of text-5xl
                fontWeight: '700', 
                letterSpacing: '-0.05em' 
              }}
            >
              Rice Clicker
            </h1>
            <p 
              style={{ 
                color: '#6b7280', // Approximation of text-muted-foreground
                fontSize: '1.25rem' // Approximation of md:text-xl
              }}
            >
              {weekNumber=== 0 ? 
              "Welcome to your rice field! There is currently no pest infestation, decide what to do before starting the first week." :
              "This field is full of Brown Plant Hoppers, a common pest in rice. But there are also wasps and spiders that prey on them."}
              
            </p>
            
          </div>
        
          <LayerControls
            layersToRemove={layersToRemove}
            weekNumber={weekNumber}
          />
          {weekNumber > 1 && (
            <p style={{ fontSize: '0.875rem', color: '#6b7280' /* text-sm text-muted-foreground */ }}>
              BPH eaten by wasps and spiders: {totalPestsEaten} <br />
            </p>
          )}
          
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: isLargeScreen ? 'repeat(3, 1fr)' : '1fr',
              gap: '1.5rem' // gap-6
            }}
          >
            <div 
              style={{ 
                gridColumn: 'span 2', // Approximation of md:col-span-2
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem' /* space-y-4 */ 
              }}
            >
                <Card style={{ backgroundColor: 'white' }}>
                  <CardContent 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'stretch', 
                      gap: '1rem', // space-y-4
                      paddingTop: '1.5rem' // pt-6
                    }}
                  >
                    {layersToRemove === 0 && !isGameOver && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                        data-pest-root="true"
                      >
                        <div
                          style={{
                            width: "100%",
                            maxWidth: 640,
                            boxSizing: "border-box",
                            minWidth: 0, // <-- empêche le contenu d'imposer une largeur minimale
                            padding: "6px 8px",
                          }}
                          data-pest-inner="true"
                        >
                          <PestControl
                            onSpray={() => handlePestChoice(true)}
                            onPass={() => handlePestChoice(false)}
                            onPerilla={() => handlePestChoice(false, true)}
                            weekNumber={weekNumber}
                          />
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                      data-grid-root="true"
                    >
                      <div
                        style={{
                          width: "100%",
                          maxWidth: 450, // cap on large screens
                          padding: "0 8px", // small horizontal padding on mobile
                          boxSizing: "border-box",
                          minWidth: 0, //allow the grid to shrink inside flex parents
                        }}
                        data-grid-inner="true"
                      >
                       <CardHeader/>
                        <ClickableGrid
                          width={gridWidth}
                          height={gridHeight}
                          layersToRemove={layersToRemove}
                          onDecrementLayers={handleDecrementLayers}
                          buttonStates={buttonStates}
                          setButtonStates={setButtonStates}
                        />
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.025em', paddingTop: '0.5rem' /* text-xl font-semibold tracking-tight pt-2 */ }}>Your Field</h3>
                  </CardContent>
                </Card>

            </div>

            

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' /* space-y-6 */ }}>
              {weekNumber > 0 && (
              <PopulationGraph 
              data={simulationHistory} 
              onDownloadData={downloadDataCSV}
              />
              )}
             <br />
              <Card style={{ backgroundColor: 'white' }}>
                <CardHeader>
                  <CardTitle>Learn More</CardTitle>
                </CardHeader>
                <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' /* space-y-2 */ }}>
                  <Button onClick={showRandomTip}>Get a Tip</Button>
                  <p style={{ fontSize: '0.875rem', textAlign: 'center', color: '#6b7280', paddingTop: '0.5rem' /* text-sm text-center text-muted-foreground pt-2 */ }}>
                    Want to learn more? Visit the <a href="https://github.com/S-poony/Rice-Clicker" style={{ textDecoration: 'underline' }}>project repository</a>.
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