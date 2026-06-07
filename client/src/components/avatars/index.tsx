import React from 'react';
import { IconBinoculars } from '@/components/avatars/IconBinoculars';
import { IconMartini } from '@/components/avatars/IconMartini';
import { IconGlasses } from '@/components/avatars/IconGlasses';
import { IconBriefcase } from '@/components/avatars/IconBriefcase';
import { IconFedora } from '@/components/avatars/IconFedora';
import { IconCamera } from '@/components/avatars/IconCamera';

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
