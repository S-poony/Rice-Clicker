import React, { useEffect, useState } from 'react';
import { Flower } from './Flower';

interface FlowerInfo {
  id: number;
  style: React.CSSProperties;
}

export const FlowerField: React.FC = () => {
  const [flowers, setFlowers] = useState<FlowerInfo[]>([]);

  useEffect(() => {
    const generateFlowers = () => {
      const newFlowers: FlowerInfo[] = [];
      const numFlowers = 25; // Number of flowers to display
      for (let i = 0; i < numFlowers; i++) {
        const finalOpacity = Math.random() * 0.6 + 0.2;
        const finalTransform = `scale(${Math.random() * 0.4 + 0.6})`;

        newFlowers.push({
          id: i,
          style: {
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: .3,
            zIndex: 1, // Move behind content
          } as React.CSSProperties,
        });
      }
      setFlowers(newFlowers);
    };

    generateFlowers();
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {flowers.map((flower) => (
        <Flower key={flower.id} style={flower.style} className="w-12 h-12" />
      ))}
    </div>
  );
};
