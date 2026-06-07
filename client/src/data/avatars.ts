export interface AvatarData {
  id: string;
  color: string;
}

// Muted, theme-consistent colors that are still distinct
export const AVATARS: AvatarData[] = [
  {
    id: 'icon-binoculars',
    color: '#8B7355', // Muted brass/khaki
  },
  {
    id: 'icon-martini',
    color: '#5C6B7A', // Slate blue-gray
  },
  {
    id: 'icon-glasses',
    color: '#8B5A5A', // Dusty rose/burgundy
  },
  {
    id: 'icon-briefcase',
    color: '#5D7A5D', // Muted forest green
  },
  {
    id: 'icon-fedora',
    color: '#6B5B7A', // Muted purple-gray
  },
  {
    id: 'icon-camera',
    color: '#7A6B5B', // Warm taupe
  },
];

export const getAvatarById = (id: string): AvatarData | undefined => {
  return AVATARS.find(avatar => avatar.id === id);
};

export const getDefaultAvatar = (): AvatarData => {
  return AVATARS[0];
};
