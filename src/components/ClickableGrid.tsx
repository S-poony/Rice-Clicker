import { useEffect } from "react";
import { FlowerBorders } from "./FlowerBorders";
export type ButtonState = 0 | 1 | 2 | 3; // 0: green, 1: yellow, 2: brown, 3: red (now invisible )

interface ClickableGridProps {
  width: number;
  height: number;
  layersToRemove: number;
  onDecrementLayers: () => void;
  buttonStates: ButtonState[];
  setButtonStates: (states: ButtonState[]) => void;
  children?: React.ReactNode; //for layers to remove
  flower: boolean; //whether to show flower borders
}

export function ClickableGrid({
  width,
  height,
  layersToRemove,
  onDecrementLayers,
  buttonStates,
  setButtonStates,
  children,
  flower,
}: ClickableGridProps) {
  // Reset grid if dimensions change
  useEffect(() => {
    const totalButtons = width * height;
    setButtonStates(new Array(totalButtons).fill(0));
  }, [width, height, setButtonStates]);

  const clickButton = (index: number) => {
    const newStates = [...buttonStates];
    // Only advance if not already at red (3) AND there are layers to remove
    if (newStates[index] < 3 && layersToRemove > 0) {
      newStates[index] = (newStates[index] + 1) as ButtonState;
      // Decrement layers counter when a square is clicked
      if (layersToRemove > 0) {
        onDecrementLayers();
      }
    }
    setButtonStates(newStates);
  };

  const getButtonColor = (state: ButtonState) => {
    switch (state) {
      case 0:
        return "bg-green-500 hover:bg-green-600 border-green-500";
      case 1:
        return "bg-yellow-500 hover:bg-yellow-600 border-yellow-500";
      case 2:
        return "bg-amber-800 hover:bg-amber-900 border-amber-800"; 
      case 3:
        return ""; // dead (red) cells are not red but invisible
      default:
        return "bg-green-500 hover:bg-green-600 border-green-500";
    }
  };

  const getStateLabel = (state: ButtonState) => {
    switch (state) {
      case 0:
        return "Healthy";
      case 1:
        return "Damaged";
      case 2:
        return "Withered";
      case 3:
        return "Dead";
      default:
        return "Healthy";
    }
  };

  // total buttons (defensive)
  const total = width * height;
  const normalizedStates =
    buttonStates.length === total
      ? buttonStates
      : new Array(total).fill(0).map((_, i) => buttonStates[i] ?? 0);

  return (
    <div className="flex flex-col gap-4">
      {}
        {children}
      <div
        className="grid gap-1 p-4 bg-muted rounded-lg shadow-xl box-border w-full mx-auto" // max-w-[640px] has been removed
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          position: "relative",
          zIndex: 1, // Ensure grid is above flower borders
        }}
      >
        {flower && (
          <FlowerBorders 
            // Use the max-width of the container (e.g., 450px from App.tsx or 640px from class)
            // Let's assume 450px from the parent's maxWidth for consistent sizing:
            gridWidth={450} 
            gridHeight={450} 
          />
        )}
        {normalizedStates.map((state, index) => {
          // state === 3 => invisible/dead: keep DOM element but visually hidden and non-interactive
          const invisible = state === 3;
          return (
            <button
              key={index}
              onClick={() => clickButton(index)}
              className={`
                w-full aspect-square border-2 rounded transition-all duration-150 hover:scale-105 active:scale-95 text-white
                flex items-center justify-center text-xs sm:text-sm select-none focus:outline-none focus:ring-2 focus:ring-offset-1
                ${getButtonColor(state)}
                ${invisible ? "opacity-0 pointer-events-none" : ""}
                ${state === 3 || layersToRemove === 0 ? "cursor-not-allowed opacity-90" : "cursor-pointer"}
              `}
              title={`Rice pad ${Math.floor(index / width) + 1},${(index % width) + 1} - ${getStateLabel(state)}`}
              disabled={state === 3 || layersToRemove === 0}
              aria-hidden={invisible}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ClickableGrid;
