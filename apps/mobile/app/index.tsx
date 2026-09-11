import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../src/api/api-client';
import { BrandMark } from '../src/components/BrandMark';
import { PhoneAccessForm } from '../src/features/auth/PhoneAccessForm';
import { CoreWorkspace } from '../src/features/core/CoreWorkspace';
import { colors, spacing } from '../src/theme/tokens';
import type { Session, User } from '../src/types/core';
import { sessionStorage } from '../src/auth/expo-secure-session-storage';

export default function HomeScreen(): React.JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [restoring, setRestoring] = useState(true);

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
    setRestoring(false);
  }
  async function authenticated(current: Session): Promise<void> {
    await sessionStorage.save(JSON.stringify(current));
    setSession(current);
    setUser(current.user);
  }
  async function logout(): Promise<void> {
    await sessionStorage.clear();
    setSession(null);
    setUser(null);
  }

  return (
    <View style={styles.page}>
      <View pointerEvents="none" style={styles.topOrb} />
      <View pointerEvents="none" style={styles.bottomOrb} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.header}>
            <BrandMark />
            <Text style={styles.brand}>TuCartón</Text>
          </View>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>UN REGISTRO QUE AMBOS RECONOCEN</Text>
            <Text style={styles.title}>
              {session ? 'Tu cartón,\nlisto para usar.' : 'Tu cartón,\nsin papel.'}
            </Text>
            <Text style={styles.subtitle}>
              {session
                ? 'Registra y confirma lo que se debe junto a la otra persona.'
                : 'Usa tu número de teléfono para crear tu cuenta o entrar.'}
            </Text>
          </View>
          {restoring ? (
            <Text style={styles.loading}>Cargando…</Text>
          ) : session && user ? (
            <CoreWorkspace onLogout={logout} session={session} user={user} />
          ) : (
            <PhoneAccessForm onAuthenticated={authenticated} />
          )}
          <Text style={styles.legal}>Tu número se usa solo para proteger tu cuenta.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.canvas, flex: 1, overflow: 'hidden' },
  safe: { flex: 1 },
  content: { flex: 1, gap: spacing.xl, padding: spacing.lg },
  topOrb: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 310,
    opacity: 0.75,
    position: 'absolute',
    right: -115,
    top: -92,
    width: 310,
  },
  bottomOrb: {
    backgroundColor: colors.softGreen,
    borderRadius: 999,
    bottom: 82,
    height: 260,
    left: -160,
    opacity: 0.7,
    position: 'absolute',
    width: 260,
  },
  header: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  brand: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  hero: { gap: spacing.md },
  eyebrow: { color: colors.mutedInk, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  title: { color: colors.ink, fontSize: 48, fontWeight: '900', letterSpacing: -2, lineHeight: 50 },
  subtitle: { color: colors.mutedInk, fontSize: 21, lineHeight: 29 },
  loading: { color: colors.mutedInk, fontSize: 17, textAlign: 'center' },
  legal: { color: colors.subtleInk, fontSize: 13, textAlign: 'center' },
});
