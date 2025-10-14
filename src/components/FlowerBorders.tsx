import React from 'react';
import { Flower } from './Flower';

interface FlowerBordersProps {
  gridWidth: number;
  gridHeight: number;
}

const FlowerLine: React.FC<{ count: number; isVertical: boolean; flowerSize: number }> = ({
  count,
  isVertical,
  flowerSize,
}) => {
  const lineStyle: React.CSSProperties = isVertical
    ? { display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', height: '100%' }
    : { display: 'flex', justifyContent: 'space-evenly', width: '100%' };

  const flowerStyle: React.CSSProperties = {
    width: `${flowerSize}px`,
    height: `${flowerSize}px`,
    flexShrink: 0,
  };

  return (
    <div style={lineStyle}>
      {Array.from({ length: Math.max(1, Math.round(count)) }).map((_, i) => (
        <Flower key={i} style={flowerStyle} color="#e5989b" />
      ))}
    </div>
  );
};

export const FlowerBorders: React.FC<FlowerBordersProps> = ({ gridWidth, gridHeight }) => {
  // --- Dynamic scaling factors ---
  // Scale flowers proportionally to the smaller grid dimension
  const baseSize = Math.min(gridWidth, gridHeight);
  const scaleFactor = baseSize / 300; // adjust this constant to tune global size
  
  const flowerSize = 32 * scaleFactor; // flower visual size
  const containerPadding = flowerSize / 1.1; // consistent offset for even borders

  // Compute number of flowers dynamically
  const spacing = 35 * scaleFactor; // average spacing between flowers
  const horizontalCount = Math.max(3, Math.floor(gridWidth / spacing));
  const verticalCount = Math.max(3, Math.floor(gridHeight / spacing));

  // --- Styles ---
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 5,
    top: '50%',
    left: '50%',
    width: `${gridWidth}px`,
    height: `${gridHeight}px`,
    transform: 'translate(-50%, -50%)',
  };

  const borderThickness = `${flowerSize}px`;

  const lineStyles: { [key: string]: React.CSSProperties } = {
    top: { position: 'absolute', top: -containerPadding, left: 0, right: 0, height: borderThickness },
    bottom: { position: 'absolute', bottom: -containerPadding, left: 0, right: 0, height: borderThickness },
    left: { position: 'absolute', top: 0, bottom: 0, left: -containerPadding, width: borderThickness },
    right: { position: 'absolute', top: 0, bottom: 0, right: -containerPadding, width: borderThickness },
  };

  return (
    <div style={containerStyle}>
      <div style={lineStyles.top}><FlowerLine count={horizontalCount} isVertical={false} flowerSize={flowerSize} /></div>
      <div style={lineStyles.bottom}><FlowerLine count={horizontalCount} isVertical={false} flowerSize={flowerSize} /></div>
      <div style={lineStyles.left}><FlowerLine count={verticalCount} isVertical={true} flowerSize={flowerSize} /></div>
      <div style={lineStyles.right}><FlowerLine count={verticalCount} isVertical={true} flowerSize={flowerSize} /></div>
    </div>
  );
};
