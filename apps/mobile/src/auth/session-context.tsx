import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/api-client';
import type { Session, User } from '../types/core';
import { sessionStorage } from './expo-secure-session-storage';

interface SessionContextValue {
  isRestoring: boolean;
  session: Session | null;
  user: User | null;
  establish: (session: Session) => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    void restore();
  }, []);

  async function restore(): Promise<void> {
    const stored = await sessionStorage.read();
    if (stored) {
      try {
        const current = JSON.parse(stored) as Session;
        setUser(await api.me(current));
        setSession(current);
      } catch {
        await sessionStorage.clear();
      }
    }
    setIsRestoring(false);
  }

  async function establish(current: Session): Promise<void> {
    await sessionStorage.save(JSON.stringify(current));
    setSession(current);
    setUser(current.user);
  }

  async function logout(): Promise<void> {
    if (session) await api.logout(session).catch(() => undefined);
    await sessionStorage.clear();
    setSession(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ establish, isRestoring, logout, session, user }),
    [isRestoring, session, user],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider.');
  return context;
}
