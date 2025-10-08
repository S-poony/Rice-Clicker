import React, { useRef, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";

// --- Data Type Definition ---
// Exported so App.tsx can use it for the simulationHistory state
export interface WeekData {
  week: number;
  normalPestCount: number;
  mutantPestCount: number;
  parasitoidCount: number;
  predatorCount: number;
  Pest_Immigration: number;
  Parasitoid_Immigration: number;
}

// --- Custom Tooltip Component ---
// This provides readable labels when hovering over the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Determine the label type based on the dataKey used
    const isImmigrationChart = payload.some((p: any) => p.dataKey.includes('Immigration'));

    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-xl text-sm">
        <p className="font-bold text-gray-700 mb-1">Week {label}</p>
        {payload.map((p: any, index: number) => (
          <p key={index} style={{ color: p.color }} className="flex justify-between">
            <span className="mr-4">{p.name}:</span>
            <span className="font-semibold">{Math.round(p.value)}</span>
          </p>
        ))}
        {!isImmigrationChart && (
            <p className="text-xs text-gray-500 mt-2">Total Population: {Math.round(payload.reduce((sum: number, p: any) => sum + p.value, 0))}</p>
        )}
      </div>
    );
  }

  return null;
};

// --- Population Graph Component (Main Export) ---

export  const PopulationGraph = ({ data }: { data: WeekData[] }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // Placeholder function for downloading the chart
  const downloadChart = useCallback(() => {
    console.log('Download functionality triggered. Implement image export logic here.');
    alert('Download feature is a placeholder. See console for details.');
  }, [data.length]);
  
  // Guard clause for no data
  if (!data || data.length === 0) {
      return (
        <Card className="shadow-lg h-[600px] flex items-center justify-center chart-container-style">
            <CardContent className="p-12">
                <p className="text-gray-400 text-lg text-center">
                    No population data recorded yet. Run the simulation using "Next Week"!
                </p>
            </CardContent>
        </Card>
      );
  }

  // --- Rendered Chart Structure ---

  return (
    // Use className to apply styling, including the custom chart-container-style
    <Card className="shadow-lg p-4 h-full flex flex-col max-w-full chart-container-style">
      <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between border-b">
        <CardTitle className="text-xl font-bold text-gray-800">
          Population Dynamics
        </CardTitle>
        <Button 
            variant="outline" 
            size="sm"
            onClick={downloadChart}
            className="text-sm border-gray-300 hover:bg-gray-50"
        >
            💾 Download Data
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col w-full h-full space-y-4 p-0 pt-4">

        {/* --- 1. Population Totals (Pests and mutants are stacked) --- */}
        <div className="flex-1 w-full min-h-[300px]">
          <h4 className="text-base font-semibold text-gray-700 mb-2">Population Counts</h4>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart 
                data={data} 
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <defs>
                {/* Gradient for Normal Pest */}
                <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff1833ff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#c11e39ff" stopOpacity={0.1}/>
                </linearGradient>
                {/* Gradient for Mutant Pest */}
                <linearGradient id="colorMutant" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#840568ff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a909e4ff" stopOpacity={0.1}/>
                </linearGradient>
                {/* Gradient for Parasitoid */}
                <linearGradient id="colorParasitoid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                {/* Gradient for Predator */}
                <linearGradient id="colorPredator" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e10b9ff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3710b9ff" stopOpacity={0.1}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                  dataKey="week" 
                  label={{ value: 'Week', position: 'bottom', offset: 0, style: { fontWeight: '600', fill: '#4b5563' } }}
                  stroke="#9ca3af"
              />
              <YAxis //removed label for cleaner look
                  label={{ value: '', angle: -90, position: 'left', offset: '-25', style: { fontWeight: '600', fill: '#4b5563' } }}
                  stroke="#9ca3af"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Area 
                  type="monotone" 
                  dataKey="mutantPestCount" 
                  stackId={1}
                  stroke="#8d0075ff" 
                  fill="url(#colorMutant)" 
                  name="Mutant Pests" 
                  strokeWidth={2}
              />
              <Area 
                  type="monotone" //todo: normalize colors, stack mutant and normal pests, parasitoids and predators w/stackID= "1"
                  dataKey="normalPestCount" 
                  stackId={1}
                  stroke="#ff2c2cff" 
                  fill="url(#colorNormal)" 
                  name="Pests" 
                  strokeWidth={2}
              />
              
              <Area 
                  type="monotone" 
                  dataKey="parasitoidCount" 
                  stroke="#10b981" 
                  fill="url(#colorParasitoid)" 
                  name="Parasitoids" 
                  strokeWidth={2}
              />
              <Area 
                  type="monotone" 
                  dataKey="predatorCount" 
                  stroke="#2110b9ff" 
                  fill="url(#colorPredator)" 
                  name="Predators" 
                  strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* --- 2. Immigration Line Chart --- */}
        <div className="flex-1 w-full min-h-[200px] border-t pt-4 border-gray-200">
          <h4 className="text-base font-semibold text-gray-700 mb-2">Immigration Rates</h4>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart 
                data={data} 
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                    dataKey="week" 
                    label={{ value: 'Week', position: 'bottom', offset: 0, style: { fontWeight: '600', fill: '#4b5563' } }}
                    stroke="#9ca3af"
                />
                <YAxis //removed label for cleaner look
                    label={{ value: '', angle: -90, position: 'left', offset: '-25', style: { fontWeight: '600', fill: '#4b5563' } }}
                    stroke="#9ca3af"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                
                <Line 
                    type="monotone" 
                    dataKey="Pest_Immigration" 
                    stroke="#d81d58ff" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Pest Immigration" 
                />
                <Line 
                    type="monotone" 
                    dataKey="Parasitoid_Immigration" 
                    stroke="#2b24fbff" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Parasitoid Immigration" 
                />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </CardContent>
    </Card>
  );
};
