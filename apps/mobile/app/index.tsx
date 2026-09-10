import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sessionStorage } from '../src/auth/expo-secure-session-storage';

type Step = 'phone' | 'code' | 'ready';

interface User {
  tuCartonCode: string;
}

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export default function HomeScreen(): React.JSX.Element {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [code, setCode] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void restoreSession();
  }, []);

  async function restoreSession(): Promise<void> {
    const stored = await sessionStorage.read();
    if (!stored) return;
    try {
      const session = JSON.parse(stored) as StoredSession;
      if (!apiBaseUrl) return;
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/phone-access/me`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (!response.ok) throw new Error('Sesión no válida');
      setUser((await response.json()) as User);
      setStep('ready');
    } catch {
      await sessionStorage.clear();
    }
  }

  async function requestCode(): Promise<void> {
    setNotice(null);
    if (!apiBaseUrl) {
      setNotice('Falta conectar esta app con el servicio local.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/phone-access/start`, {
        body: JSON.stringify({ phone }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const result = (await response.json()) as {
        verificationId?: string;
        developmentCode?: string;
      };
      if (!response.ok || !result.verificationId)
        throw new Error('Revisa el número e inténtalo otra vez.');
      setVerificationId(result.verificationId);
      setStep('code');
      setNotice(result.developmentCode ? `Código de prueba: ${result.developmentCode}` : null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'No pudimos enviar el código.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(): Promise<void> {
    setNotice(null);
    if (!apiBaseUrl) return;
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/phone-access/verify`, {
        body: JSON.stringify({ code, phone, verificationId }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const result = (await response.json()) as StoredSession;
      if (!response.ok || !result.accessToken || !result.refreshToken || !result.user) {
        throw new Error('Ese código no es válido. Inténtalo otra vez.');
      }
      await sessionStorage.save(JSON.stringify(result));
      setUser(result.user);
      setStep('ready');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'No pudimos comprobar el código.');
    } finally {
      setLoading(false);
    }
  }

  async function logout(): Promise<void> {
    await sessionStorage.clear();
    setUser(null);
    setCode('');
    setPhone('');
    setNotice(null);
    setStep('phone');
  }

  const title =
    step === 'phone'
      ? 'Tu cartón,\nsin papel.'
      : step === 'code'
        ? 'Escribe el código'
        : 'Tu acceso está listo';
  const copy =
    step === 'phone'
      ? 'Usa tu número de teléfono para crear tu cuenta o entrar.'
      : step === 'code'
        ? 'Te enviamos un código de seis números.'
        : 'Ya puedes registrar y confirmar lo que se debe.';

  return (
    <View style={styles.page}>
      <View pointerEvents="none" style={[styles.orb, styles.orbTop]} />
      <View pointerEvents="none" style={[styles.orb, styles.orbBottom]} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View accessibilityLabel="Ícono de TuCartón" style={styles.mark}>
              <View style={styles.notebook} />
              <View style={styles.pen} />
            </View>
            <Text style={styles.brand}>TuCartón</Text>
          </View>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>UN REGISTRO QUE AMBOS RECONOCEN</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{copy}</Text>
          </View>
          <BlurView intensity={44} tint="light" style={styles.card}>
            {step === 'phone' ? (
              <>
                <Text style={styles.cardTitle}>Continuar con mi teléfono</Text>
                <Text style={styles.cardCopy}>República Dominicana</Text>
                <View style={styles.phoneRow}>
                  <Text style={styles.prefix}>+1</Text>
                  <TextInput
                    accessibilityLabel="Número de teléfono"
                    autoComplete="tel"
                    keyboardType="phone-pad"
                    onChangeText={setPhone}
                    placeholder="809 000 0000"
                    placeholderTextColor="#78867F"
                    style={styles.input}
                    value={phone}
                  />
                </View>
                <Pressable disabled={loading} onPress={requestCode} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>
                    {loading ? 'Enviando…' : 'Continuar'}
                  </Text>
                  <Text style={styles.arrow}>→</Text>
                </Pressable>
              </>
            ) : step === 'code' ? (
              <>
                <Text style={styles.cardTitle}>Confirma tu número</Text>
                <Text style={styles.cardCopy}>Escribe los seis números del código.</Text>
                <TextInput
                  accessibilityLabel="Código de seis dígitos"
                  keyboardType="number-pad"
                  maxLength={6}
                  onChangeText={setCode}
                  placeholder="000000"
                  placeholderTextColor="#78867F"
                  style={[styles.input, styles.codeInput]}
                  value={code}
                />
                <Pressable
                  disabled={loading || code.length !== 6}
                  onPress={verifyCode}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? 'Comprobando…' : 'Confirmar código'}
                  </Text>
                  <Text style={styles.arrow}>→</Text>
                </Pressable>
                <Pressable onPress={() => setStep('phone')}>
                  <Text style={styles.secondaryAction}>Cambiar número</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>Bienvenido a TuCartón</Text>
                <Text style={styles.cardCopy}>Tu código es {user?.tuCartonCode ?? '—'}.</Text>
                <Pressable onPress={logout} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Cerrar sesión</Text>
                </Pressable>
              </>
            )}
            {notice ? (
              <Text accessibilityLiveRegion="polite" style={styles.notice}>
                {notice}
              </Text>
            ) : null}
          </BlurView>
          <Text style={styles.legal}>Tu número se usa solo para proteger tu cuenta.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: '#F5F6F0', flex: 1, overflow: 'hidden' },
  safeArea: { flex: 1 },
  content: { flex: 1, justifyContent: 'space-between', padding: 20 },
  orb: { borderRadius: 999, position: 'absolute' },
  orbTop: {
    backgroundColor: '#D6E29E',
    height: 310,
    opacity: 0.75,
    right: -115,
    top: -92,
    width: 310,
  },
  orbBottom: {
    backgroundColor: '#C9DDD1',
    bottom: 82,
    height: 260,
    left: -160,
    opacity: 0.7,
    width: 260,
  },
  header: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  mark: {
    alignItems: 'center',
    backgroundColor: '#1E3029',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  notebook: { borderColor: '#D6E29E', borderRadius: 7, borderWidth: 2, height: 22, width: 17 },
  pen: {
    backgroundColor: '#D6E29E',
    height: 3,
    position: 'absolute',
    right: 2,
    top: 5,
    transform: [{ rotate: '-35deg' }],
    width: 16,
  },
  brand: { color: '#1E3029', fontSize: 24, fontWeight: '800' },
  hero: { gap: 16 },
  eyebrow: { color: '#61746B', fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#1E3029', fontSize: 48, fontWeight: '900', letterSpacing: -2, lineHeight: 50 },
  subtitle: { color: '#61746B', fontSize: 21, lineHeight: 29 },
  card: {
    borderColor: 'rgba(255,255,255,0.75)',
    borderRadius: 34,
    borderWidth: 1,
    gap: 15,
    padding: 28,
  },
  cardTitle: { color: '#1E3029', fontSize: 26, fontWeight: '800' },
  cardCopy: { color: '#61746B', fontSize: 17 },
  phoneRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderColor: '#DCE2D8',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    height: 58,
    paddingHorizontal: 16,
  },
  prefix: { color: '#1E3029', fontSize: 19, fontWeight: '800', marginRight: 9 },
  input: { color: '#1E3029', flex: 1, fontSize: 19, fontWeight: '700' },
  codeInput: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderColor: '#DCE2D8',
    borderRadius: 16,
    borderWidth: 1,
    letterSpacing: 9,
    paddingHorizontal: 18,
    textAlign: 'center',
    height: 60,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#D6E29E',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 60,
    paddingHorizontal: 20,
  },
  primaryButtonText: { color: '#1E3029', fontSize: 20, fontWeight: '900' },
  arrow: { color: '#1E3029', fontSize: 29, marginLeft: 12 },
  secondaryAction: { color: '#40564B', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  notice: { color: '#5E695F', fontSize: 15, lineHeight: 21, textAlign: 'center' },
  legal: { color: '#6D7C73', fontSize: 13, textAlign: 'center' },
});
