import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface IconSkullProps {
  size?: number;
  color: string;
}

/** Skull / downed marker — times eliminated (deaths) affordance */
export function IconSkull({ size = 18, color }: IconSkullProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C7.58 2 4 5.58 4 10c0 2.92 1.56 5.47 3.9 6.87.07.31.1.63.1.97V19a1 1 0 0 0 1 1h1v1.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V20h1a1 1 0 0 0 1-1v-1.16c0-.34.03-.66.1-.97C18.44 15.47 20 12.92 20 10c0-4.42-3.58-8-8-8Z M10.5 10A1.5 1.5 0 1 0 7.5 10A1.5 1.5 0 1 0 10.5 10Z M16.5 10A1.5 1.5 0 1 0 13.5 10A1.5 1.5 0 1 0 16.5 10Z"
        fill={color}
      />
    </Svg>
  );
}
