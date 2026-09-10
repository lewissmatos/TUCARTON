export const AUTH_SESSION_KEY = 'tucarton.auth.session.v1';

export interface SecureKeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  deleteItem(key: string): Promise<void>;
}

export function createSessionStorage(store: SecureKeyValueStore) {
  return {
    read: (): Promise<string | null> => store.getItem(AUTH_SESSION_KEY),
    save: (credential: string): Promise<void> => store.setItem(AUTH_SESSION_KEY, credential),
    clear: (): Promise<void> => store.deleteItem(AUTH_SESSION_KEY),
  };
}
