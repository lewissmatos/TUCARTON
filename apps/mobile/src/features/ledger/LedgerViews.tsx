import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { formatDopMinor } from '../../lib/money';
import { colors, radius, spacing, type } from '../../theme/tokens';
import type { Debt, RelationshipLedger } from '../../types/core';

export function PendingDebtDecision({
  debt,
  disabled,
  onConfirm,
  onReject,
}: {
  debt: Debt;
  disabled: boolean;
  onConfirm: () => void;
  onReject: (reason: string) => void;
}): React.JSX.Element {
  const [reason, setReason] = useState('');
  return (
    <View style={styles.pendingCard}>
      <Text style={styles.amount}>{formatDopMinor(debt.amountMinor)}</Text>
      <Text style={styles.note}>{debt.note || 'Sin nota'}</Text>
      <TextField
        editable={!disabled}
        maxLength={500}
        onChangeText={setReason}
        placeholder="Razón para rechazar (opcional)"
        value={reason}
      />
      <View style={styles.decisionRow}>
        <Pressable disabled={disabled} onPress={() => onReject(reason)}>
          <Text style={styles.reject}>Rechazar</Text>
        </Pressable>
        <PrimaryButton disabled={disabled} label="Confirmar" onPress={onConfirm} />
      </View>
    </View>
  );
}

export function RelationshipLedgerView({
  title,
  ledger,
  onLoadMore,
}: {
  title: string;
  ledger: RelationshipLedger | null;
  onLoadMore?: () => void;
}): React.JSX.Element | null {
  if (!ledger) return null;
  return (
    <View style={styles.ledger}>
      <Text style={styles.section}>{title}</Text>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Balance confirmado</Text>
        <Text style={styles.balance}>{formatDopMinor(ledger.summary.confirmedBalanceMinor)}</Text>
        <Text style={styles.pending}>
          Pendientes: {formatDopMinor(ledger.summary.pendingDebtMinor)}
        </Text>
      </View>
      <Text style={styles.section}>Historial</Text>
      {ledger.history.items.map((debt) => (
        <View key={debt.id} style={styles.historyRow}>
          <View>
            <Text style={styles.historyAmount}>{formatDopMinor(debt.amountMinor)}</Text>
            <Text style={styles.historyNote}>{debt.note || 'Sin nota'}</Text>
          </View>
          <Text style={styles.status}>{statusLabel(debt.status)}</Text>
        </View>
      ))}
      {ledger.history.nextCursor && onLoadMore ? (
        <Pressable onPress={onLoadMore}>
          <Text style={styles.more}>Ver más movimientos</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function statusLabel(status: string): string {
  if (status === 'CONFIRMED') return 'Confirmado';
  if (status === 'REJECTED') return 'Rechazado';
  return 'Pendiente';
}

const styles = StyleSheet.create({
  pendingCard: {
    backgroundColor: colors.softGreen,
    borderRadius: radius.input,
    gap: spacing.sm,
    padding: spacing.md,
  },
  amount: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  note: { color: colors.mutedInk, fontSize: 14 },
  decisionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  reject: { color: colors.error, fontSize: 15, fontWeight: '800' },
  ledger: { gap: spacing.sm },
  section: {
    color: colors.mutedInk,
    fontSize: type.label,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  balanceCard: {
    backgroundColor: colors.accent,
    borderRadius: radius.input,
    gap: spacing.xs,
    padding: spacing.md,
  },
  balanceLabel: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  balance: { color: colors.ink, fontSize: 30, fontWeight: '900' },
  pending: { color: colors.mutedInk, fontSize: 14, fontWeight: '700' },
  historyRow: {
    alignItems: 'center',
    backgroundColor: colors.glassStrong,
    borderRadius: radius.small,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  historyAmount: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  historyNote: { color: colors.mutedInk, fontSize: 13, marginTop: 2 },
  status: { color: colors.mutedInk, fontSize: 13, fontWeight: '800' },
  more: { color: colors.ink, fontSize: 15, fontWeight: '800', textAlign: 'center' },
});
