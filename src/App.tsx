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

// Simulation Constants
const HARVEST_WEEK = 12;
const INVASION_WEEK = 2;
const POPULATION_RANDOMNESS = .5; // 0 = no randomness, 0.1 = ±10%, 0.2 = ±20%, etc.
const cropsPerLayer = 30;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;
const initialPestCount = 198;
const initialMutantPestCount = 2;
const initialParasitoidCount = 25;
const initialPredatorCount = 7;
const FLOWER_IMMIGRATION_BOOST = 3.5; // discuss with scientists for accuracy
const FLOWER_POPULATION_BOOST = 2;
const MUTANT_PEST_REPRODUCTION_RATE = (2 * 7) / 10.42;
const PEST_REPRODUCTION_RATE = (2 * 7) / 10.42;
const AVERAGE_OUTSIDE_PESTS = 9.8;
const AVERAGE_OUTSIDE_MUTANT_PESTS = 0.2;
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

interface AppState {
  // SIMULATION COUNTS
  pestCount: number;
  mutantPestCount: number;
  parasitoidCount: number;
  predatorCount: number;
  // GAME/CHOICE STATE
  weekNumber: number;
  layersToRemove: number;
  layersRemoved: number;
  pesticideSprayCount: number;
  isGameOver: boolean;
  totalPestsEaten: number;
  pesticideScheduled: boolean;
  flower: boolean;
  averageOutsidePests: number;
  averageOutsideMutantPests: number;
  averageOutsideParasitoids: number;
  // GRID & HISTORY
  buttonStates: ButtonState[];
  simulationHistory: WeekData[];
}

type Tip = {
  title: string;
  content: string;
};



const randomize = (baseCount: number, randomnessFactor: number): number => {
  if (randomnessFactor === 0) return baseCount;
  
  // Generate a random multiplier between (1 - randomnessFactor) and (1 + randomnessFactor)
  const minMultiplier = 1 - randomnessFactor;
  const maxMultiplier = 1 + randomnessFactor;
  
  const randomMultiplier = Math.random() * (maxMultiplier - minMultiplier) + minMultiplier;
  
  // Return the randomized count, rounded to the nearest integer and ensuring it's not negative
  return Math.max(0, Math.round(baseCount * randomMultiplier));
};

//initial state for replay without reloading the page
const getInitialState = (): AppState => {

  // 2. Calculate the randomized initial values here:
  const randomizedPestCount = randomize(initialPestCount, POPULATION_RANDOMNESS);
  const randomizedMutantPestCount = randomize(initialMutantPestCount, POPULATION_RANDOMNESS);
  const randomizedParasitoidCount = randomize(initialParasitoidCount, POPULATION_RANDOMNESS);
  const randomizedPredatorCount = randomize(initialPredatorCount, POPULATION_RANDOMNESS);

return ({
  //simulation counts
  weekNumber: 0,
  pestCount: 0, //pests appear on INVASION_WEEK
  mutantPestCount: 0, //pests appear on INVASION_WEEK
  parasitoidCount: randomizedParasitoidCount,
  predatorCount: randomizedPredatorCount,
  averageOutsidePests: AVERAGE_OUTSIDE_PESTS,
  averageOutsideMutantPests: AVERAGE_OUTSIDE_MUTANT_PESTS,
  averageOutsideParasitoids: 0,
  layersToRemove: 0,
  layersRemoved: 0,
  pesticideSprayCount: 0,
  isGameOver: false,
  totalPestsEaten: 0,
  pesticideScheduled: false,
  flower: false,
  buttonStates: new Array(GRID_HEIGHT * GRID_WIDTH).fill(0) as ButtonState[],
  simulationHistory: [{
    week: 0,
    normalPestCount: 0,//pests appear on INVASION_WEEK
    mutantPestCount: 0,//pests appear on INVASION_WEEK
    parasitoidCount: randomizedParasitoidCount,
    predatorCount: randomizedPredatorCount,
    Pest_Immigration: 0,
    yieldDamage: 0,
  }] as WeekData[],
});
}

export default function App() {
  const initialValues = getInitialState();
  const [simulationHistory, setSimulationHistory] = useState<WeekData[]>( initialValues.simulationHistory);
  const handleReplay = () => {
    const resetValues = getInitialState();
    setWeekNumber(resetValues.weekNumber);
    setPestCount(resetValues.pestCount);
    setMutantPestCount(resetValues.mutantPestCount);
    setParasitoidCount(resetValues.parasitoidCount);
    setPredatorCount(resetValues.predatorCount);
    setAverageOutsidePests(resetValues.averageOutsidePests);
    setAverageOutsideMutantPests(resetValues.averageOutsideMutantPests);
    setAverageOutsideParasitoids(resetValues.averageOutsideParasitoids);
    setLayersToRemove(resetValues.layersToRemove);
    setLayersRemoved(resetValues.layersRemoved);
    setPesticideSprayCount(resetValues.pesticideSprayCount);
    setIsGameOver(resetValues.isGameOver);
    setTotalPestsEaten(resetValues.totalPestsEaten);
    setPesticideScheduled(resetValues.pesticideScheduled);
    setFlower(resetValues.flower);
    setButtonStates(resetValues.buttonStates);
    setSimulationHistory(resetValues.simulationHistory);
    setIsGameOver(false);
 };
  const downloadDataCSV = () => {
    if (simulationHistory.length === 0) {
      alert("No simulation data to download yet.");
      return;
    }

    // Define the mapping from internal variable names (keys) to descriptive column names (values)
    const columnMap = {
      week: 'Week',
      normalPestCount: 'BPH (Normal)',
      mutantPestCount: 'BPH (Resistant)',
      parasitoidCount: 'Parasitoids (Wasps)',
      predatorCount: 'Predators (Spiders)',
      Pest_Immigration: 'BPH Immigration Rate',
      yieldDamage: 'Yield Damage',
      pesticideScheduled: 'Pesticide Sprayed This Week',
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

  const [flower, setFlower] = useState(false);
  const [averageOutsidePests, setAverageOutsidePests] = useState(AVERAGE_OUTSIDE_PESTS);
  const [averageOutsideMutantPests, setAverageOutsideMutantPests] = useState(AVERAGE_OUTSIDE_MUTANT_PESTS);
  const [averageOutsideParasitoids, setAverageOutsideParasitoids] = useState(0);

  const gridWidth = GRID_WIDTH;
  const gridHeight = GRID_HEIGHT;
  const [buttonStates, setButtonStates] = useState<ButtonState[]>(
    new Array(gridWidth * gridHeight).fill(0)
  );


  // Simulation state
  const [pestCount, setPestCount] = useState(initialValues.pestCount);
  const [mutantPestCount, setMutantPestCount] = useState(initialValues.mutantPestCount);
  const [parasitoidCount, setParasitoidCount] = useState(initialValues.parasitoidCount);
  const [predatorCount, setPredatorCount] = useState(initialValues.predatorCount);

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
  const scoreInPoints = GREEN_YIELD * greenCells + YELLOW_YIELD * yellowCells + BROWN_YIELD * brownCells;
  const score = (scoreInPoints * 5) / 300; // score in tons of rice

  useEffect(() => {
    // This effect is now empty as initial calculation is handled in the setup phase
  }, []); // Runs only once on mount

  useEffect(() => {
    if (weekNumber === HARVEST_WEEK && layersToRemove === 0) {
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
  const handlePestChoice = (pesticideApplied: boolean, flowerApplied = false) => {
    console.log("handlePestChoice called:", { weekNumber, pesticideApplied, flowerApplied: flowerApplied, layersToRemove, averageOutsideParasitoids,  }); //debug
    // SETUP PHASE
    // IMPORTANT: This block now simulates all weeks up to INVASION_WEEK - 1.
  if (weekNumber === 0) {
      // 1. Initial Beneficial Insect Setup
      let currentParasitoid = parasitoidCount;
      let currentPredator = predatorCount;

      if (flowerApplied) {
          setFlower(true);
          currentParasitoid *= FLOWER_POPULATION_BOOST;
          setAverageOutsideParasitoids(Math.random() * FLOWER_IMMIGRATION_BOOST * 2);
      }
      
      // Schedule pesticide for Week 1 (if applied now)
      if (pesticideApplied) {
          setPesticideScheduled(true);
          setPesticideSprayCount((prev) => prev + 1); // Increment count now
      }
      
      const newHistory: WeekData[] = [];
      
      // 2. Simulate Pre-Invasion Weeks (Week 1 up to INVASION_WEEK - 1)
      for (let w = 1; w < INVASION_WEEK; w++) {
          let isPesticideAppliedThisWeek = pesticideApplied && w === 1; // Only spray if scheduled and it's Week 1
          
          // a. Calculate Survival (Pests are 0, only beneficials affected)
          const parasitoidSurvival = isPesticideAppliedThisWeek ? parasitoidSurvivalRate : 1;
          const predatorSurvival = isPesticideAppliedThisWeek ? predatorSurvivalRate : 1;
          currentParasitoid *= parasitoidSurvival;
          currentPredator *= predatorSurvival;

          // b. Calculate Reproduction (Only beneficials)
          const nextParasitoid = currentParasitoid * parasitoidReproductionRate;
          const nextPredator = currentPredator * predatorReproductionRate;

          newHistory.push({
              week: w,
              normalPestCount: 0,
              mutantPestCount: 0,
              parasitoidCount: nextParasitoid,
              predatorCount: nextPredator,
              Pest_Immigration: 0,
              yieldDamage: 0, // no pests = no damage (for now at least)
              pesticideScheduled: isPesticideAppliedThisWeek,
          });

          // Update populations for the next week's calculation
          currentParasitoid = nextParasitoid;
          currentPredator = nextPredator;
      }
      
      // 3. Update State to End of Pre-Invasion Period
      setPestCount(0); // Still 0 pests
      setMutantPestCount(0);
      setParasitoidCount(currentParasitoid);
      setPredatorCount(currentPredator);
      
      setSimulationHistory((prevHistory) => [...prevHistory, ...newHistory]);
      setLayersToRemove(0);
      setPesticideScheduled(false); // Reset schedule flag

      // Set the week number to the last pre-invasion week
      setWeekNumber(INVASION_WEEK - 1); 
      return;
    }
  

    let isPesticideAppliedThisTurn = pesticideApplied;
    if (weekNumber === 1 && pesticideScheduled) {
      // This logic is now handled in the week 0 setup.
      // We keep the flag reset for future logic.
      isPesticideAppliedThisTurn = false; 
      setPesticideScheduled(false); // Reset after use
    }

    if (weekNumber >= HARVEST_WEEK) {
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
    let pestReproductionRate = PEST_REPRODUCTION_RATE
    let mutantPestReproductionRate = MUTANT_PEST_REPRODUCTION_RATE  
    
    if (sprayedCount > 0) {
      //intended logic: pesticide applied only once boost reproduction permanently
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
    const isPestInvasionWeek = weekNumber === (INVASION_WEEK - 1); // Trigger invasion when moving to INVASION_WEEK
    const outsidePests = Math.random() * averageOutsidePests * 2;
    const outsideMutantPests = Math.random() * averageOutsideMutantPests * 2;
    const outsideParasitoids = Math.random() * averageOutsideParasitoids * 2;

    let nextPestCount = survivingPests * pestReproductionRate + outsidePests;
    let nextMutantPestCount = survivingMutants * mutantPestReproductionRate + outsideMutantPests;

    // INVASION LOGIC: If this is the week before the invasion, override the pest counts
    // with the randomized initial invasion amount.
    if (isPestInvasionWeek) {
        nextPestCount = randomize(initialPestCount, POPULATION_RANDOMNESS);
        nextMutantPestCount = randomize(initialMutantPestCount, POPULATION_RANDOMNESS);
    }

    const nextParasitoidCount = survivingParasitoids * parasitoidReproductionRate + outsideParasitoids;
    const nextPredatorCount = survivingPredators * predatorReproductionRate;

    setPestCount(nextPestCount);
    setMutantPestCount(nextMutantPestCount);
    setParasitoidCount(nextParasitoidCount);
    setPredatorCount(nextPredatorCount);

    const nextPestTotal = nextPestCount + nextMutantPestCount;
    const cropsEaten = nextPestTotal * pestConsumptionRate;
    const baseDamageInLayers = (nextPestTotal * pestConsumptionRate) / cropsPerLayer;
    const newLayersToRemove = Math.ceil(baseDamageInLayers * fieldDamage);

    setLayersToRemove(newLayersToRemove);

  //Create data object (nextWeekData is defined here)
    const nextWeekData: WeekData = {
      week: weekNumber + 1,
      normalPestCount: nextPestCount,
      mutantPestCount: nextMutantPestCount,
      parasitoidCount: nextParasitoidCount,
      predatorCount: nextPredatorCount,
      Pest_Immigration: outsidePests, 
      yieldDamage: newLayersToRemove, 
      pesticideScheduled: isPesticideAppliedThisTurn,
    };

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
          backgroundColor: 'light gray',
          zIndex: -20 
        }} 
      />
      {flower && <FlowerField />} 
      <div style={{ position: 'relative', zIndex: 10 }}>
        {weekNumber == INVASION_WEEK && (
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
          open={pestCount - mutantPestCount < 0 && weekNumber > 0}
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
                <Card style={{ backgroundColor: 'white' }} >
                  <CardContent 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'stretch', 
                      gap: '1rem', // space-y-4
                      paddingTop: '1.5rem' // pt-6
                    }}
                  >
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
                       
                        <ClickableGrid
                          width={gridWidth}
                          height={gridHeight}
                          layersToRemove={layersToRemove}
                          onDecrementLayers={handleDecrementLayers}
                          buttonStates={buttonStates}
                          setButtonStates={setButtonStates}
                          flower={flower}
                        >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "6px 8px",
                                maxWidth: 650,
                                margin: "0 auto",
                              }}
                            >
                              <LayerControls
                                layersToRemove={layersToRemove}
                                weekNumber={weekNumber}
                                onSpray={() => handlePestChoice(true)}
                                onPass={() => handlePestChoice(false)}
                                onFlower={() => handlePestChoice(false, true)}
                              />
                          </div>
                      </ClickableGrid>
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
          onReplay={handleReplay}
          onDownloadData={downloadDataCSV}
        />
      </div>
    </div>
  );
}