import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { api, ApiError } from '../../api/api-client';
import { useSession } from '../../auth/session-context';
import { ActionCard } from '../../components/ActionCard';
import { AppScreen } from '../../components/AppScreen';
import { Notice } from '../../components/Notice';
import { PageHeader } from '../../components/PageHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { RelationshipLedgerView } from '../../features/ledger/LedgerViews';
import { colors, radius, spacing, type } from '../../theme/tokens';
import type { Business, Customer, RelationshipLedger } from '../../types/core';

function useBusinessId(): string {
  const { businessId } = useLocalSearchParams<{ businessId: string }>();
  return businessId;
}

export function CreateBusinessScreen(): React.JSX.Element {
  const router = useRouter();
  const { session } = useSession();
  const [name, setName] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function create(): Promise<void> {
    if (!session || !name.trim()) return setNotice('Escribe el nombre del colmado.');
    setLoading(true);
    try {
      const business = await api.createBusiness(session, name.trim());
      replace(router, `/business/${business.id}`);
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : 'No pudimos crear el colmado.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <AppScreen>
      <PageHeader
        subtitle="Tu negocio tendrá su propio espacio para clientes, pendientes e historial."
        title="Crear colmado"
      />
      <TextField autoFocus onChangeText={setName} placeholder="Nombre del colmado" value={name} />
      <PrimaryButton
        disabled={loading}
        label={loading ? 'Creando…' : 'Crear colmado'}
        onPress={() => void create()}
      />
      <Notice message={notice} />
    </AppScreen>
  );
}

export function BusinessOverviewScreen(): React.JSX.Element {
  const router = useRouter();
  const businessId = useBusinessId();
  const { session } = useSession();
  const [business, setBusiness] = useState<Business | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      void api
        .businesses(session)
        .then((list) => setBusiness(list.find((item) => item.id === businessId) ?? null));
    }, [businessId, session]),
  );
  return (
    <AppScreen>
      <PageHeader subtitle="Elige una tarea." title={business?.name ?? 'Colmado'} />
      <ActionCard
        description="Registra una compra pendiente para un cliente vinculado."
        onPress={() => go(router, `/business/${businessId}/debt`)}
        title="Registrar pendiente"
      />
      <ActionCard
        description="Agrega clientes y revisa sus balances."
        onPress={() => go(router, `/business/${businessId}/people`)}
        title="Clientes"
      />
      <ActionCard
        description="Consulta movimientos por cliente."
        onPress={() => go(router, `/business/${businessId}/history`)}
        title="Historial"
      />
    </AppScreen>
  );
}

export function PeopleScreen(): React.JSX.Element {
  const router = useRouter();
  const businessId = useBusinessId();
  const { session } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      void api
        .customers(session, businessId)
        .then(setCustomers)
        .catch(() => setNotice('No pudimos cargar los clientes.'));
    }, [businessId, session]),
  );
  return (
    <AppScreen>
      <PageHeader
        subtitle="Solo usuarios con cuenta TuCartón pueden agregarse como clientes."
        title="Clientes"
      />
      <PrimaryButton
        label="Agregar cliente"
        onPress={() => go(router, `/business/${businessId}/people/add`)}
      />
      {customers.length === 0 ? (
        <Text style={styles.empty}>Aún no has agregado clientes.</Text>
      ) : (
        customers.map((customer) => (
          <ActionCard
            key={customer.relationshipId}
            description={`Código: ${customer.tuCartonCode}`}
            onPress={() => go(router, `/business/${businessId}/people/${customer.tuCartonCode}`)}
            title={customer.displayName ?? customer.tuCartonCode}
          />
        ))
      )}
      <Notice message={notice} />
    </AppScreen>
  );
}

export function AddPersonScreen(): React.JSX.Element {
  const router = useRouter();
  const businessId = useBusinessId();
  const { session } = useSession();
  const [identifier, setIdentifier] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function add(): Promise<void> {
    if (!session || !identifier.trim()) return setNotice('Escribe el código o número del cliente.');
    setLoading(true);
    try {
      await api.addCustomer(session, businessId, identifier.trim());
      router.back();
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : 'No pudimos agregar a este cliente.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <AppScreen>
      <PageHeader
        subtitle="Pídele al cliente su código de TuCartón o su número de teléfono."
        title="Agregar cliente"
      />
      <TextField
        autoCapitalize="characters"
        autoFocus
        keyboardType="default"
        onChangeText={setIdentifier}
        placeholder="Código o número de teléfono"
        value={identifier}
      />
      <PrimaryButton
        disabled={loading}
        label={loading ? 'Agregando…' : 'Vincular cliente'}
        onPress={() => void add()}
      />
      <Notice message={notice} />
    </AppScreen>
  );
}

export function CreateDebtScreen(): React.JSX.Element {
  const router = useRouter();
  const businessId = useBusinessId();
  const { session } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      void api
        .customers(session, businessId)
        .then((list) => {
          setCustomers(list);
          if (list[0]) setSelected((current) => current ?? list[0].tuCartonCode);
        })
        .catch(() => setNotice('No pudimos cargar los clientes.'));
    }, [businessId, session]),
  );
  async function create(): Promise<void> {
    const amountMinor = Math.round(Number(amount.replace(',', '.')) * 100);
    if (!session || !selected || !Number.isFinite(amountMinor) || amountMinor <= 0)
      return setNotice('Elige un cliente e indica un monto válido.');
    setLoading(true);
    try {
      await api.createDebt(session, businessId, selected, amountMinor, note);
      replace(router, `/business/${businessId}`);
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : 'No pudimos registrar el pendiente.');
    } finally {
      setLoading(false);
    }
  }
  if (customers.length === 0)
    return (
      <AppScreen>
        <PageHeader
          subtitle="Primero vincula al cliente que recibirá el pendiente."
          title="Registrar pendiente"
        />
        <PrimaryButton
          label="Ir a Clientes"
          onPress={() => replace(router, `/business/${businessId}/people`)}
        />
      </AppScreen>
    );
  return (
    <AppScreen>
      <PageHeader
        subtitle="El cliente deberá confirmar este registro."
        title="Registrar pendiente"
      />
      <Text style={styles.label}>Cliente</Text>
      {customers.map((customer) => (
        <Pressable
          key={customer.relationshipId}
          onPress={() => setSelected(customer.tuCartonCode)}
          style={[styles.choice, selected === customer.tuCartonCode && styles.choiceSelected]}
        >
          <Text style={styles.choiceText}>{customer.displayName ?? customer.tuCartonCode}</Text>
          <Text style={styles.choiceCode}>{customer.tuCartonCode}</Text>
        </Pressable>
      ))}
      <TextField
        keyboardType="decimal-pad"
        onChangeText={setAmount}
        placeholder="Monto en RD$"
        value={amount}
      />
      <TextField onChangeText={setNote} placeholder="Nota (opcional)" value={note} />
      <PrimaryButton
        disabled={loading}
        label={loading ? 'Enviando…' : 'Enviar pendiente'}
        onPress={() => void create()}
      />
      <Notice message={notice} />
    </AppScreen>
  );
}

export function BusinessLedgerScreen(): React.JSX.Element {
  const { businessId, customerCode } = useLocalSearchParams<{
    businessId: string;
    customerCode: string;
  }>();
  const { session } = useSession();
  const [ledger, setLedger] = useState<RelationshipLedger | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      void api
        .businessLedger(session, businessId, customerCode)
        .then(setLedger)
        .catch(() => setNotice('No pudimos cargar este historial.'));
    }, [businessId, customerCode, session]),
  );
  return (
    <AppScreen>
      <PageHeader subtitle={`Cliente: ${customerCode}`} title="Balance e historial" />
      <RelationshipLedgerView ledger={ledger} title="Resumen" />
      <Notice message={notice} />
    </AppScreen>
  );
}

export function BusinessHistoryScreen(): React.JSX.Element {
  const router = useRouter();
  const businessId = useBusinessId();
  const { session } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  useFocusEffect(
    useCallback(() => {
      if (session) void api.customers(session, businessId).then(setCustomers);
    }, [businessId, session]),
  );
  return (
    <AppScreen>
      <PageHeader subtitle="El historial se consulta por cliente." title="Historial" />
      {customers.length === 0 ? (
        <Text style={styles.empty}>No hay clientes vinculados todavía.</Text>
      ) : (
        customers.map((customer) => (
          <ActionCard
            key={customer.relationshipId}
            description={`Código: ${customer.tuCartonCode}`}
            onPress={() => go(router, `/business/${businessId}/people/${customer.tuCartonCode}`)}
            title={customer.displayName ?? customer.tuCartonCode}
          />
        ))
      )}
    </AppScreen>
  );
}

function go(router: ReturnType<typeof useRouter>, href: string): void {
  router.push(href as never);
}
function replace(router: ReturnType<typeof useRouter>, href: string): void {
  router.replace(href as never);
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: colors.glassStrong,
    borderRadius: radius.input,
    color: colors.mutedInk,
    fontSize: 16,
    lineHeight: 23,
    padding: spacing.lg,
  },
  label: {
    color: colors.mutedInk,
    fontSize: type.label,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  choice: { backgroundColor: colors.glassStrong, borderRadius: radius.input, padding: spacing.md },
  choiceSelected: { backgroundColor: colors.accent },
  choiceText: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  choiceCode: { color: colors.mutedInk, fontSize: 14, fontWeight: '700' },
});
