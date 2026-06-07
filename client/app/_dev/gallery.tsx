import { Redirect } from 'expo-router';
import { Gallery } from '@/design-system/examples/Gallery';

export default function GalleryRoute() {
  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  return <Gallery />;
}
