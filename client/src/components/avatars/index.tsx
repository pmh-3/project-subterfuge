import React from 'react';
import { IconBinoculars } from './IconBinoculars';
import { IconMartini } from './IconMartini';
import { IconGlasses } from './IconGlasses';
import { IconBriefcase } from './IconBriefcase';
import { IconFedora } from './IconFedora';
import { IconCamera } from './IconCamera';

interface AvatarProps {
  size?: number;
  color: string;
}

const avatarComponents: Record<string, React.FC<AvatarProps>> = {
  'icon-binoculars': IconBinoculars,
  'icon-martini': IconMartini,
  'icon-glasses': IconGlasses,
  'icon-briefcase': IconBriefcase,
  'icon-fedora': IconFedora,
  'icon-camera': IconCamera,
};

export const getAvatarComponent = (id: string): React.FC<AvatarProps> => {
  return avatarComponents[id] || IconBinoculars;
};

export {
  IconBinoculars,
  IconMartini,
  IconGlasses,
  IconBriefcase,
  IconFedora,
  IconCamera,
};
