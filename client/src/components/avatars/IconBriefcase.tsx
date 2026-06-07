import React from 'react';
import Svg, { Path, Rect, Line } from 'react-native-svg';

interface IconBriefcaseProps {
  size?: number;
  color: string;
}

export const IconBriefcase: React.FC<IconBriefcaseProps> = ({ 
  size = 60, 
  color 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Main briefcase body */}
      <Rect
        x="6"
        y="22"
        width="52"
        height="32"
        rx="3"
        fill={color}
      />
      {/* Handle base */}
      <Rect
        x="22"
        y="10"
        width="20"
        height="14"
        rx="2"
        fill="none"
        stroke={color}
        strokeWidth="4"
      />
      {/* Center clasp */}
      <Rect
        x="28"
        y="34"
        width="8"
        height="6"
        rx="1"
        fill={color}
        opacity={0.4}
      />
      {/* Decorative line across middle */}
      <Line
        x1="6"
        y1="38"
        x2="58"
        y2="38"
        stroke={color}
        strokeWidth="2"
        opacity={0.3}
      />
      {/* Corner reinforcements */}
      <Rect
        x="8"
        y="24"
        width="4"
        height="4"
        fill={color}
        opacity={0.3}
      />
      <Rect
        x="52"
        y="24"
        width="4"
        height="4"
        fill={color}
        opacity={0.3}
      />
    </Svg>
  );
};
