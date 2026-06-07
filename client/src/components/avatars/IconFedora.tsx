import React from 'react';
import Svg, { Path, Ellipse } from 'react-native-svg';

interface IconFedoraProps {
  size?: number;
  color: string;
}

export const IconFedora: React.FC<IconFedoraProps> = ({ 
  size = 60, 
  color 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Hat crown - filled solid */}
      <Path
        d="M12 42 Q12 22, 22 18 Q32 14, 42 18 Q52 22, 52 42 Z"
        fill={color}
      />
      {/* Hat band - darker indent */}
      <Path
        d="M14 36 Q32 30, 50 36"
        stroke={color}
        strokeWidth="3"
        fill="none"
        opacity={0.5}
      />
      {/* Front brim only - solid filled */}
      <Path
        d="M4 42 Q32 50, 60 42 L52 42 Q32 46, 12 42 Z"
        fill={color}
      />
      {/* Brim outline - front edge */}
      <Path
        d="M4 42 Q32 50, 60 42"
        stroke={color}
        strokeWidth="3"
        fill="none"
      />
    </Svg>
  );
};
