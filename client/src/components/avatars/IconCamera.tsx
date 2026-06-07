import React from 'react';
import Svg, { Circle, Path, Rect, Defs, Mask } from 'react-native-svg';

interface IconCameraProps {
  size?: number;
  color: string;
}

export const IconCamera: React.FC<IconCameraProps> = ({ 
  size = 60, 
  color 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        {/* Mask for lens cutout */}
        <Mask id="lensMask">
          <Rect x="6" y="20" width="52" height="32" rx="4" fill="white" />
          <Circle cx="32" cy="36" r="6" fill="black" />
        </Mask>
      </Defs>
      
      {/* Camera body with lens cutout */}
      <Rect
        x="6"
        y="20"
        width="52"
        height="32"
        rx="4"
        fill={color}
        mask="url(#lensMask)"
      />
      {/* Viewfinder bump */}
      <Path
        d="M22 20 L26 12 L38 12 L42 20"
        fill={color}
      />
      {/* Main lens outer ring */}
      <Circle
        cx="32"
        cy="36"
        r="10"
        fill="none"
        stroke={color}
        strokeWidth="3"
      />
      {/* Lens cutout ring (inner) */}
      <Circle
        cx="32"
        cy="36"
        r="6"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity={0.6}
      />
      {/* Flash */}
      <Rect
        x="44"
        y="24"
        width="8"
        height="5"
        rx="1"
        fill={color}
        opacity={0.4}
      />
      {/* Shutter button */}
      <Circle
        cx="50"
        cy="16"
        r="3"
        fill={color}
      />
    </Svg>
  );
};
