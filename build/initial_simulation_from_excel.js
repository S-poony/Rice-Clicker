// INITIAL PARAMETERS FOR THE SIMULATION

const cropsPerLayer = 15 // number of crops in each layer of the crop stack

const initialPestCount = 90
const initialMutantPestCount = 10
const initialParasitoidCount = 12
const initialPredatorCount = 4

var pestReproductionRate = 2*7/10.42 // 1.3
const pestReproductionConstant = 9.8
const parasitoidReproductionRate = 1.25
const predatorReproductionRate = 1.1


const ReproductionBoost = 1.6 //only for pests, when pesticide has been applied

const pestSurvivalRate = 0.3
const parasitoidSurvivalRate = 0.3
const predatorSurvivalRate = 0.5

const pestConsumptionRate = 0.8 //eats crops
const parasitoidConsumptionRate = 1.1 //eats pests
const predatorConsumptionRate = 2.5 //eats pests

// some insects are resistant to pesticides, they have differents stats. 
// If not specified, they have the same stats as normal insects

var mutantPestReproductionRate = 2*7/10.42 // 1.3
const MutantPestReproductionBoost = 1.8 //only for mutant pests when pesticide is applied
const MutantPestPesticideSurvivalRate = 1 //only for mutant pests, they are completely resistant
const MutantParasitoidSurvivalRate = 0.4 //only for mutant parasitoids, currently not used

// SIMULATION

var pestCount = initialPestCount;
var mutantPestCount = initialMutantPestCount;
var pestTotal = pestCount + mutantPestCount;
var parasitoidCount = initialParasitoidCount;
var predatorCount = initialPredatorCount;

var pesticideApplied = false; 
// whether pesticide was applied this week
// pesticideApplied changes when user presses yes or no in the "Spray Pesticide ?" UI

if (pesticideSprayCount > 0) { // pesticideSprayCount = number of times pesticide was applied so far
        pestReproductionRate = ReproductionBoost;
        mutantPestReproductionRate = MutantPestReproductionBoost;
    }

function simulateWeek() {
    // calculate predation and layers to remove (pests eating crops)
    var paraEat = parasitoidCount * parasitoidConsumptionRate;
    var predEat = predatorCount * predatorConsumptionRate;
    var pestEaten = Math.min (pestTotal, (paraEat + predEat)); // parasitoid and predator consumption cannot exceed pest population

    var predationRate = pestCount>0?  pestEaten/pestCount : 0;
    var predationRate = 1 - predationRate // easier to understand the code that way

    var cropsEaten = pestTotal * pestConsumptionRate; // total crops eaten by pests
    var layersToRemove = cropsEaten/cropsPerLayer; // number of layers to remove from the crop stack

    // update populations
    if (pesticideApplied = true) {
        pestCount *= predationRate * pestReproductionRate * pestSurvivalRate + pestReproductionConstant
        mutantPestCount *= mutantPestReproductionRate * MutantPestPesticideSurvivalRate + pestReproductionConstant
        parasitoidCount *= parasitoidReproductionRate * parasitoidSurvivalRate
        predatorCount *= predatorReproductionRate * predatorSurvivalRate
    }

    if (pesticideApplied = false) {
        pestCount *= predationRate * pestReproductionRate + pestReproductionConstant
        mutantPestCount *= mutantPestReproductionRate + pestReproductionConstant
        parasitoidCount *= parasitoidReproductionRate
        predatorCount *= predatorReproductionRate
    }
    
}