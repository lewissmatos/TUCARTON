import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { api, ApiError } from '../../api/api-client';
import { useSession } from '../../auth/session-context';
import { ActionCard } from '../../components/ActionCard';
import { AppScreen } from '../../components/AppScreen';
import { Notice } from '../../components/Notice';
import { PageHeader } from '../../components/PageHeader';
import { PendingDebtDecision, RelationshipLedgerView } from '../../features/ledger/LedgerViews';
import { colors, radius, spacing } from '../../theme/tokens';
import type { CustomerRelationship, Debt, RelationshipLedger } from '../../types/core';

export function AccountScreen(): React.JSX.Element {
  const router = useRouter();
  const { session } = useSession();
  const [pending, setPending] = useState<Debt[]>([]);
  const [relationships, setRelationships] = useState<CustomerRelationship[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (session) void load();
    }, [session]),
  );
  async function load(): Promise<void> {
    if (!session) return;
    try {
      const [debts, relationList] = await Promise.all([
        api.pendingDebts(session),
        api.customerRelationships(session),
      ]);
      setPending(debts);
      setRelationships(relationList);
    } catch {
      setNotice('No pudimos cargar tu cuenta.');
    }
  }
  async function decide(debtId: string, action: 'confirm' | 'reject', reason = ''): Promise<void> {
    if (!session) return;
    setLoading(true);
    try {
      if (action === 'confirm') await api.acknowledgeDebt(session, debtId);
      else await api.rejectDebt(session, debtId, reason);
      await load();
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : 'No pudimos guardar tu decisión.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <AppScreen>
      <PageHeader subtitle="Revisa lo que tienes pendiente y tus balances." title="Mi cuenta" />
      {pending.length > 0 ? (
        <>
          <Text style={styles.section}>Pendientes por decidir</Text>
          {pending.map((debt) => (
            <PendingDebtDecision
              key={debt.id}
              debt={debt}
              disabled={loading}
              onConfirm={() => void decide(debt.id, 'confirm')}
              onReject={(reason) => void decide(debt.id, 'reject', reason)}
            />
          ))}
        </>
      ) : (
        <Text style={styles.empty}>No tienes pendientes por decidir.</Text>
      )}
      <Text style={styles.section}>Mis relaciones</Text>
      {relationships.length === 0 ? (
        <Text style={styles.empty}>Aún no tienes relaciones con colmados.</Text>
      ) : (
        relationships.map((relationship) => (
          <ActionCard
            key={relationship.businessId}
            description="Ver balance confirmado, pendientes e historial"
            onPress={() => router.push(`/account/${relationship.businessId}` as never)}
            title={relationship.businessName}
          />
        ))
      )}
      <Notice message={notice} />
    </AppScreen>
  );
}

export function CustomerRelationshipScreen(): React.JSX.Element {
  const { businessId } = useLocalSearchParams<{ businessId: string }>();
  const { session } = useSession();
  const [ledger, setLedger] = useState<RelationshipLedger | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (session)
        void api
          .customerLedger(session, businessId)
          .then(setLedger)
          .catch(() => setNotice('No pudimos cargar este historial.'));
    }, [businessId, session]),
  );
  return (
    <AppScreen>
      <PageHeader
        subtitle="Los pendientes no se suman al balance confirmado."
        title="Balance e historial"
      />
      <RelationshipLedgerView ledger={ledger} title="Mi resumen" />
      <Notice message={notice} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    color: colors.mutedInk,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  empty: {
    backgroundColor: colors.glassStrong,
    borderRadius: radius.input,
    color: colors.mutedInk,
    fontSize: 16,
    lineHeight: 23,
    padding: spacing.lg,
  },
});
