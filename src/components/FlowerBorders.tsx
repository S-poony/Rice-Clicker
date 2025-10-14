import React from 'react';
import { Flower } from './Flower';

interface FlowerBordersProps {
  gridWidth: number;
  gridHeight: number;
}

const FlowerLine: React.FC<{ count: number; isVertical: boolean; flowerSize: number }> = ({ count, isVertical, flowerSize }) => {
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
      {Array.from({ length: count }).map((_, i) => (
        <Flower key={i} style={flowerStyle} color="#e5989b" />
      ))}
    </div>
  );
};

export const FlowerBorders: React.FC<FlowerBordersProps> = ({ gridWidth, gridHeight }) => {
  const flowerScale = 115; // overall scale factor
  const flowerSize = 25 * (flowerScale / 100); // scale flower size proportionally

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 5,
    top: '50%',
    left: '50%',
    width: `${gridWidth * (flowerScale / 100)}px`,
    height: `${gridHeight * (flowerScale / 100)}px`,
    transform: 'translate(-50%, -50%)',
  };

  const borderThickness = `${flowerSize}px`;

  const lineStyles: { [key: string]: React.CSSProperties } = {
    top: { position: 'absolute', top: 0, left: 0, right: 0, height: borderThickness },
    bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: borderThickness },
    left: { position: 'absolute', top: 0, bottom: 0, left: 0, width: borderThickness },
    right: { position: 'absolute', top: 0, bottom: 0, right: 0, width: borderThickness },
  };

  return (
    <div style={containerStyle}>
      <div style={lineStyles.top}><FlowerLine count={gridWidth/40} isVertical={false} flowerSize={flowerSize} /></div>
      <div style={lineStyles.bottom}><FlowerLine count={gridWidth/40} isVertical={false} flowerSize={flowerSize} /></div>
      <div style={lineStyles.left}><FlowerLine count={gridHeight/40} isVertical={true} flowerSize={flowerSize} /></div>
      <div style={lineStyles.right}><FlowerLine count={gridHeight/40} isVertical={true} flowerSize={flowerSize} /></div>
    </div>
  );
};
