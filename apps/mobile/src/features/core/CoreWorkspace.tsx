import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, ApiError } from '../../api/api-client';
import { GlassCard } from '../../components/GlassCard';
import { Notice } from '../../components/Notice';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { colors, radius, spacing, type } from '../../theme/tokens';
import type { Business, Debt, Session, User } from '../../types/core';

export function CoreWorkspace({
  session,
  user,
  onLogout,
}: {
  session: Session;
  user: User;
  onLogout: () => Promise<void>;
}): React.JSX.Element {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessId, setBusinessId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [customerCode, setCustomerCode] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [pending, setPending] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh(): Promise<void> {
    try {
      const [list, debts] = await Promise.all([api.businesses(session), api.pendingDebts(session)]);
      setBusinesses(list);
      if (list[0]) setBusinessId((current) => current || list[0].id);
      setPending(debts);
    } catch {
      setNotice('No pudimos cargar tus pendientes.');
    }
  }

  async function createBusiness(): Promise<void> {
    if (!businessName.trim()) return setNotice('Escribe el nombre del colmado.');
    await run(async () => {
      await api.createBusiness(session, businessName.trim());
      setBusinessName('');
      await refresh();
      setNotice('Tu colmado quedó creado.');
    });
  }

  async function addCustomer(): Promise<void> {
    if (!businessId || !customerCode.trim()) return setNotice('Escribe el código de TuCartón.');
    await run(async () => {
      await api.addCustomer(session, businessId, customerCode.trim());
      setNotice('Persona agregada. Ahora puedes registrar el pendiente.');
    });
  }

  async function createDebt(): Promise<void> {
    const amountMinor = Math.round(Number(amount.replace(',', '.')) * 100);
    if (!businessId || !customerCode.trim() || !Number.isFinite(amountMinor) || amountMinor <= 0)
      return setNotice('Indica código y monto válido.');
    await run(async () => {
      await api.createDebt(session, businessId, customerCode.trim(), amountMinor, note);
      setAmount('');
      setNote('');
      setNotice('Pendiente enviado para confirmación.');
    });
  }

  async function acknowledge(debtId: string): Promise<void> {
    await run(async () => {
      await api.acknowledgeDebt(session, debtId);
      await refresh();
      setNotice('Pendiente confirmado.');
    });
  }
  async function run(action: () => Promise<void>): Promise<void> {
    setLoading(true);
    setNotice(null);
    try {
      await action();
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : 'Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard style={styles.card}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Tu espacio</Text>
        <Text style={styles.copy}>Tu código: {user.tuCartonCode}</Text>
        {pending.length > 0 ? (
          <>
            <Text style={styles.section}>Pendientes por confirmar</Text>
            {pending.map((debt) => (
              <View key={debt.id} style={styles.debt}>
                <View>
                  <Text style={styles.amount}>RD$ {(debt.amountMinor / 100).toFixed(2)}</Text>
                  <Text style={styles.note}>{debt.note || 'Sin nota'}</Text>
                </View>
                <Pressable
                  disabled={loading}
                  onPress={() => void acknowledge(debt.id)}
                  style={styles.confirm}
                >
                  <Text style={styles.confirmText}>Confirmar</Text>
                </Pressable>
              </View>
            ))}
          </>
        ) : null}
        {businesses.length === 0 ? (
          <>
            <Text style={styles.section}>Empieza por tu colmado</Text>
            <TextField
              onChangeText={setBusinessName}
              placeholder="Nombre del colmado"
              value={businessName}
            />
            <PrimaryButton
              disabled={loading}
              label="Crear colmado"
              onPress={() => void createBusiness()}
            />
          </>
        ) : (
          <>
            <Text style={styles.section}>Colmado activo</Text>
            <View style={styles.businesses}>
              {businesses.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setBusinessId(item.id)}
                  style={[styles.business, item.id === businessId && styles.selected]}
                >
                  <Text style={styles.businessText}>{item.name}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.section}>Registrar pendiente</Text>
            <TextField
              autoCapitalize="characters"
              onChangeText={setCustomerCode}
              placeholder="Código de TuCartón"
              value={customerCode}
            />
            <TextField
              keyboardType="decimal-pad"
              onChangeText={setAmount}
              placeholder="Monto en RD$"
              value={amount}
            />
            <TextField onChangeText={setNote} placeholder="Nota (opcional)" value={note} />
            <PrimaryButton
              disabled={loading}
              label="Enviar pendiente"
              onPress={() => void createDebt()}
            />
            <Pressable disabled={loading} onPress={() => void addCustomer()}>
              <Text style={styles.secondary}>Agregar persona primero</Text>
            </Pressable>
          </>
        )}
        <Pressable onPress={() => void onLogout()}>
          <Text style={styles.secondary}>Cerrar sesión</Text>
        </Pressable>
        <Notice message={notice} />
      </ScrollView>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: 0 },
  content: { gap: spacing.md, padding: spacing.xl },
  title: { color: colors.ink, fontSize: type.cardTitle, fontWeight: '800' },
  copy: { color: colors.mutedInk, fontSize: type.body },
  section: {
    color: colors.mutedInk,
    fontSize: type.label,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  businesses: { gap: spacing.xs },
  business: {
    backgroundColor: colors.glassStrong,
    borderRadius: radius.input,
    padding: spacing.md,
  },
  selected: { backgroundColor: colors.accent },
  businessText: { color: colors.ink, fontSize: type.body, fontWeight: '700' },
  debt: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderRadius: radius.input,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  amount: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  note: { color: colors.mutedInk, fontSize: 13, marginTop: 3 },
  confirm: {
    backgroundColor: colors.ink,
    borderRadius: radius.small,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  confirmText: { color: colors.canvas, fontSize: 13, fontWeight: '800' },
  secondary: { color: colors.ink, fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
