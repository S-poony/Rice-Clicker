import { useEffect } from "react";

export type ButtonState = 0 | 1 | 2;

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
    // Only advance if not already at red (2)
    if (newStates[index] < 2 && layersToRemove > 0) {
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
        return "bg-red-500 hover:bg-red-600 border-red-500";
      default:
        return "bg-green-500 hover:bg-green-600 border-green-500";
    }
  };

  const getStateLabel = (state: ButtonState) => {
    switch (state) {
      case 0:
        return "Green";
      case 1:
        return "Yellow";
      case 2:
        return "Red";
      default:
        return "Green";
    }
  };

  if (buttonStates.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        Configure grid dimensions and click "Generate Grid" to start
      </div>
    );
  }

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
              ${state === 2 ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}
            `}
            title={`Button ${Math.floor(index / width) + 1},${(index % width) + 1} - ${getStateLabel(state)}${state === 2 ? ' (Final state)' : ''}`}
            disabled={state === 2}
          />
        ))}
      </div>
    </div>
  );
}