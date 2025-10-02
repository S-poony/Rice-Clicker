import { useEffect } from "react";

export type ButtonState = 0 | 1 | 2 | 3; // 0: green, 1: yellow, 2: brown, 3: red (now invisible )

interface ClickableGridProps {
  width: number;
  height: number;
  layersToRemove: number;
  onDecrementLayers: () => void;
  buttonStates: ButtonState[];
  setButtonStates: (states: ButtonState[]) => void;
}

export function ClickableGrid({
  width,
  height,
  layersToRemove,
  onDecrementLayers,
  buttonStates,
  setButtonStates,
}: ClickableGridProps) {
  // Reset grid when dimensions change
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
        return "";//dead (red) cells are not red but invisible
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

  return (
    <div className="flex flex-col gap-4">
      <div
        className="grid gap-1 p-4 bg-muted rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          maxWidth: "fit-content",
        }}
      >
        {buttonStates.map((state, index) => (
          <button
            key={index}
            onClick={() => clickButton(index)}
            className={`
              w-8 h-8 border-2 rounded transition-all duration-150 hover:scale-105 active:scale-95 text-white
              ${getButtonColor(state)}
              ${state === 3 || layersToRemove === 0 ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}
            `}
            title={`Rice pad ${Math.floor(index / width) + 1},${(index % width) + 1} - ${getStateLabel(state)}`}
            disabled={state === 3 || layersToRemove === 0}
          />
        ))}
      </div>
    </div>
  );
}