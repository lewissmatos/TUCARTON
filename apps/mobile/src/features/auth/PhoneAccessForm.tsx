import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { api, ApiError } from '../../api/api-client';
import { GlassCard } from '../../components/GlassCard';
import { Notice } from '../../components/Notice';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { colors, spacing, type } from '../../theme/tokens';
import type { Session } from '../../types/core';

export function PhoneAccessForm({
  onAuthenticated,
}: {
  onAuthenticated: (session: Session) => Promise<void>;
}): React.JSX.Element {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [challenge, setChallenge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  async function requestCode(): Promise<void> {
    setLoading(true);
    setNotice(null);
    try {
      const result = await api.startPhone(phone);
      setVerificationId(result.verificationId);
      setChallenge(true);
      setNotice(result.developmentCode ? `Código de prueba: ${result.developmentCode}` : null);
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : 'No pudimos enviar el código.');
    } finally {
      setLoading(false);
    }
  }
  async function verifyCode(): Promise<void> {
    setLoading(true);
    setNotice(null);
    try {
      await onAuthenticated(await api.verifyPhone(phone, verificationId, code));
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : 'No pudimos comprobar el código.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <GlassCard>
      {challenge ? (
        <>
          <Text style={styles.title}>Confirma tu número</Text>
          <Text style={styles.copy}>Escribe los seis números del código.</Text>
          <TextField
            accessibilityLabel="Código de seis dígitos"
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={setCode}
            placeholder="000000"
            style={styles.code}
            value={code}
          />
          <PrimaryButton
            disabled={loading || code.length !== 6}
            label={loading ? 'Comprobando…' : 'Confirmar código'}
            onPress={() => void verifyCode()}
          />
          <Pressable onPress={() => setChallenge(false)}>
            <Text style={styles.secondary}>Cambiar número</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.title}>Continuar con mi teléfono</Text>
          <Text style={styles.copy}>República Dominicana</Text>
          <View style={styles.phoneRow}>
            <Text style={styles.prefix}>+1</Text>
            <TextField
              accessibilityLabel="Número de teléfono"
              autoComplete="tel"
              keyboardType="phone-pad"
              onChangeText={setPhone}
              placeholder="809 000 0000"
              style={styles.phone}
              value={phone}
            />
          </View>
          <PrimaryButton
            disabled={loading}
            label={loading ? 'Enviando…' : 'Continuar'}
            onPress={() => void requestCode()}
          />
        </>
      )}
      <Notice message={notice} />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: type.cardTitle, fontWeight: '800' },
  copy: { color: colors.mutedInk, fontSize: type.body },
  phoneRow: {
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    paddingLeft: spacing.md,
  },
  prefix: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  phone: { backgroundColor: 'transparent', borderWidth: 0, flex: 1 },
  code: { letterSpacing: 9, textAlign: 'center' },
  secondary: { color: colors.ink, fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
