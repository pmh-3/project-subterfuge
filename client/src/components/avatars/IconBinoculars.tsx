import React from 'react';
import Svg, { Circle, Rect, Ellipse, Defs, Mask } from 'react-native-svg';

interface IconBinocularsProps {
  size?: number;
  color: string;
}

export const IconBinoculars: React.FC<IconBinocularsProps> = ({ 
  size = 60, 
  color 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        {/* Mask for left lens cutout */}
        <Mask id="leftLensMask">
          <Ellipse cx="18" cy="34" rx="12" ry="14" fill="white" />
          <Circle cx="18" cy="38" r="5" fill="black" />
        </Mask>
        {/* Mask for right lens cutout */}
        <Mask id="rightLensMask">
          <Ellipse cx="46" cy="34" rx="12" ry="14" fill="white" />
          <Circle cx="46" cy="38" r="5" fill="black" />
        </Mask>
      </Defs>
      
      {/* Left lens body with cutout */}
      <Ellipse
        cx="18"
        cy="34"
        rx="12"
        ry="14"
        fill={color}
        mask="url(#leftLensMask)"
      />
      {/* Right lens body with cutout */}
      <Ellipse
        cx="46"
        cy="34"
        rx="12"
        ry="14"
        fill={color}
        mask="url(#rightLensMask)"
      />
      {/* Bridge connecting both lenses */}
      <Rect
        x="26"
        y="28"
        width="12"
        height="8"
        fill={color}
        rx="2"
      />
      {/* Focus wheel on top */}
      <Rect
        x="28"
        y="18"
        width="8"
        height="12"
        fill={color}
        rx="2"
      />
      {/* Lens ring outlines */}
      <Circle
        cx="18"
        cy="38"
        r="5"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity={0.6}
      />
      <Circle
        cx="46"
        cy="38"
        r="5"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity={0.6}
      />
    </Svg>
  );
};
