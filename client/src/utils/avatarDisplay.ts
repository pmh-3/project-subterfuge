import { getAvatarById, AvatarData } from '@/data/avatars';
import { getAvatarComponent } from '@/components/avatars';

type AvatarComponentType = React.ComponentType<{ size: number; color: string }>;

/**
 * Resolves an avatar ID into display data and its React component.
 * Eliminates the repeated two-step lookup pattern across components.
 */
export function getAvatarDisplay(avatarId?: string): {
  data: AvatarData | null;
  Component: AvatarComponentType | null;
} {
  if (!avatarId) return { data: null, Component: null };
  const data = getAvatarById(avatarId) ?? null;
  if (!data) return { data: null, Component: null };
  return { data, Component: getAvatarComponent(data.id) };
}
