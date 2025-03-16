'use client';

import { useState, useEffect } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

const RangeSlider = ({ min, max, step, value, onChange }: RangeSliderProps) => {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), localValue[1] - step);
    const newValue: [number, number] = [newMin, localValue[1]];
    setLocalValue(newValue);
    onChange(newValue);
  };
  
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), localValue[0] + step);
    const newValue: [number, number] = [localValue[0], newMax];
    setLocalValue(newValue);
    onChange(newValue);
  };
  
  // Calculate the percentage for the slider track
  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;
  
  return (
    <div className="relative">
      <div className="relative h-2 bg-gray-200 rounded-full">
        {/* Colored track between the two thumbs */}
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`
          }}
        />
      </div>
      
      {/* Min thumb */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={localValue[0]}
        onChange={handleMinChange}
        className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent pointer-events-none"
        style={{
          // Make only the thumb clickable
          pointerEvents: 'auto',
          // Hide the track
          WebkitAppearance: 'none',
          // Custom thumb styling
          '--thumb-color': 'white',
          '--thumb-size': '16px',
          '--thumb-border': '2px solid #3b82f6'
        } as React.CSSProperties}
      />
      
      {/* Max thumb */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={localValue[1]}
        onChange={handleMaxChange}
        className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent pointer-events-none"
        style={{
          // Make only the thumb clickable
          pointerEvents: 'auto',
          // Hide the track
          WebkitAppearance: 'none',
          // Custom thumb styling
          '--thumb-color': 'white',
          '--thumb-size': '16px',
          '--thumb-border': '2px solid #3b82f6'
        } as React.CSSProperties}
      />
    </div>
  );
};

export default RangeSlider; 