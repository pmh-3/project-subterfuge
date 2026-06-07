import '@testing-library/jest-native/extend-expect';

// @ts-expect-error test runtime global
global.__DEV__ = true;

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const mock = (name: string) => {
    const Comp = (props: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement(name, props, props.children);
    Comp.displayName = name;
    return Comp;
  };
  return {
    __esModule: true,
    default: mock('Svg'),
    Svg: mock('Svg'),
    Circle: mock('Circle'),
    Rect: mock('Rect'),
    Ellipse: mock('Ellipse'),
    Defs: mock('Defs'),
    Mask: mock('Mask'),
    Path: mock('Path'),
    G: mock('G'),
  };
});

jest.mock('@/services/firebase', () => ({
  db: {},
  auth: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  collection: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  onSnapshot: jest.fn(),
}));
