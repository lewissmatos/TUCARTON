import { describe, expect, it } from 'vitest';
import {
  AUTH_SESSION_KEY,
  createSessionStorage,
  type SecureKeyValueStore,
} from './session-storage';

function memoryStore(): SecureKeyValueStore & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => void values.set(key, value),
    deleteItem: async (key) => void values.delete(key),
  };
}

describe('session storage', () => {
  it('stores and clears credentials only through the supplied secure store', async () => {
    const store = memoryStore();
    const session = createSessionStorage(store);

    await session.save('access-token');
    expect(store.values.get(AUTH_SESSION_KEY)).toBe('access-token');
    expect(await session.read()).toBe('access-token');

    await session.clear();
    expect(await session.read()).toBeNull();
  });
});
