import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';

interface IconGlassesProps {
  size?: number;
  color: string;
}

export const IconGlasses: React.FC<IconGlassesProps> = ({ 
  size = 60, 
  color 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Left lens */}
      <Circle
        cx="18"
        cy="32"
        r="12"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      {/* Right lens */}
      <Circle
        cx="46"
        cy="32"
        r="12"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      {/* Bridge */}
      <Line
        x1="30"
        y1="32"
        x2="34"
        y2="32"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Left arm/stem - extending outward at ~30 deg above horizontal */}
      <Line
        x1="6"
        y1="28"
        x2="-4"
        y2="22"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Right arm/stem - extending outward at ~30 deg above horizontal */}
      <Line
        x1="58"
        y1="28"
        x2="68"
        y2="22"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </Svg>
  );
};
