import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface IconTargetProps {
  size?: number;
  color: string;
}

/** Crosshair / target ring — eliminations made (kills) affordance */
export function IconTarget({ size = 18, color }: IconTargetProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21 12A9 9 0 1 0 3 12A9 9 0 1 0 21 12Z M19 12A7 7 0 1 0 5 12A7 7 0 1 0 19 12Z M17 12A5 5 0 1 0 7 12A5 5 0 1 0 17 12Z M15 12A3 3 0 1 0 9 12A3 3 0 1 0 15 12Z M13.3 12A1.3 1.3 0 1 0 10.7 12A1.3 1.3 0 1 0 13.3 12Z"
        fill={color}
      />
    </Svg>
  );
}
