import React from 'react';
import Svg, { Path, Line, Circle } from 'react-native-svg';

interface IconMartiniProps {
  size?: number;
  color: string;
}

export const IconMartini: React.FC<IconMartiniProps> = ({ 
  size = 60, 
  color 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Glass bowl - triangle */}
      <Path
        d="M8 12 L32 40 L56 12 Z"
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Stem */}
      <Line
        x1="32"
        y1="40"
        x2="32"
        y2="56"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Base */}
      <Line
        x1="20"
        y1="56"
        x2="44"
        y2="56"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Olive */}
      <Circle
        cx="32"
        cy="22"
        r="5"
        fill={color}
      />
    </Svg>
  );
};
