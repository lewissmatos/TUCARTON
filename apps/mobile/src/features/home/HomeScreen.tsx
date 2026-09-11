import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api/api-client';
import { useSession } from '../../auth/session-context';
import { ActionCard } from '../../components/ActionCard';
import { AppScreen } from '../../components/AppScreen';
import { BrandMark } from '../../components/BrandMark';
import { colors, spacing, type } from '../../theme/tokens';
import type { Business } from '../../types/core';

export function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const { logout, session, user } = useSession();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  useFocusEffect(
    useCallback(() => {
      if (session) void load();
    }, [session]),
  );
  async function load(): Promise<void> {
    if (!session) return;
    const [businessList, pending] = await Promise.all([
      api.businesses(session),
      api.pendingDebts(session),
    ]);
    setBusinesses(businessList);
    setPendingCount(pending.length);
  }
  return (
    <AppScreen>
      <View style={styles.header}>
        <BrandMark />
        <Text style={styles.brand}>TuCartón</Text>
        <Pressable onPress={() => void logout()}>
          <Text style={styles.logout}>Salir</Text>
        </Pressable>
      </View>
      <View>
        <Text style={styles.eyebrow}>INICIO</Text>
        <Text style={styles.title}>Hola{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}</Text>
        <Text style={styles.copy}>Tu código: {user?.tuCartonCode ?? '—'}</Text>
      </View>
      {pendingCount > 0 ? (
        <ActionCard
          description={`${pendingCount} pendiente${pendingCount === 1 ? '' : 's'} espera${pendingCount === 1 ? '' : 'n'} tu decisión.`}
          onPress={() => go(router, '/account')}
          title="Tienes pendientes"
        />
      ) : null}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis colmados</Text>
        <Pressable onPress={() => go(router, '/business/new')}>
          <Text style={styles.link}>Crear colmado</Text>
        </Pressable>
      </View>
      {businesses.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Aún no tienes un colmado.</Text>
          <Text style={styles.emptyCopy}>
            Crea uno para empezar a registrar pendientes con tus clientes.
          </Text>
        </View>
      ) : (
        businesses.map((business) => (
          <ActionCard
            key={business.id}
            description="Registrar pendientes, clientes e historial"
            onPress={() => go(router, `/business/${business.id}`)}
            title={business.name}
          />
        ))
      )}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mi cuenta</Text>
      </View>
      <ActionCard
        description="Revisa tus pendientes, balances e historial."
        onPress={() => go(router, '/account')}
        title="Ver mi cuenta"
      />
    </AppScreen>
  );
}

function go(router: ReturnType<typeof useRouter>, href: string): void {
  router.push(href as never);
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  brand: { color: colors.ink, flex: 1, fontSize: 24, fontWeight: '800' },
  logout: { color: colors.mutedInk, fontSize: 15, fontWeight: '800' },
  eyebrow: { color: colors.mutedInk, fontSize: type.label, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: colors.ink, fontSize: 36, fontWeight: '900' },
  copy: { color: colors.mutedInk, fontSize: 16, marginTop: spacing.xs },
  section: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  link: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  empty: {
    backgroundColor: colors.glassStrong,
    borderRadius: 16,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  emptyCopy: { color: colors.mutedInk, fontSize: 15, lineHeight: 21 },
});
