import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const storage = {
  save: async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (e) {
      if (__DEV__) console.warn('SecureStore failed, falling back to AsyncStorage', e);
      // Fallback for any SecureStore failure
      await AsyncStorage.setItem(key, value);
    }
  },
  
  get: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (e) {
      if (__DEV__) console.warn('SecureStore failed, falling back to AsyncStorage', e);
      return await AsyncStorage.getItem(key);
    }
  },
  
  delete: async (key: string) => {
    try {
       if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (e) {
      await AsyncStorage.removeItem(key);
    }
  }
};
