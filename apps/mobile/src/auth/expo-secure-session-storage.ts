import * as SecureStore from 'expo-secure-store';
import { createSessionStorage } from './session-storage';

/** The sole mobile adapter permitted to persist authentication credentials. */
export const sessionStorage = createSessionStorage({
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  deleteItem: SecureStore.deleteItemAsync,
});
