import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { api, ApiError } from '../../api/api-client';
import { GlassCard } from '../../components/GlassCard';
import { Notice } from '../../components/Notice';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { colors, spacing, type } from '../../theme/tokens';
import type { Session } from '../../types/core';

type AccessMode = 'login' | 'register';

export function CredentialAccessForm({
  onAuthenticated,
  onInputFocus,
}: {
  onAuthenticated: (session: Session) => Promise<void>;
  onInputFocus: () => void;
}): React.JSX.Element {
  const [mode, setMode] = useState<AccessMode>('register');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function chooseMode(nextMode: AccessMode): void {
    setMode(nextMode);
    setNotice(null);
    setPasscode('');
  }

  async function submit(): Promise<void> {
    setLoading(true);
    setNotice(null);
    try {
      const session =
        mode === 'register'
          ? await api.register(displayName, phone, passcode)
          : await api.login(phone, passcode);
      await onAuthenticated(session);
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : 'No pudimos completar el acceso.');
    } finally {
      setLoading(false);
    }
  }

  const isRegister = mode === 'register';
  return (
    <GlassCard>
      <View style={styles.switcher}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isRegister }}
          onPress={() => chooseMode('register')}
          style={[styles.tab, isRegister && styles.tabSelected]}
        >
          <Text style={styles.tabText}>Crear cuenta</Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: !isRegister }}
          onPress={() => chooseMode('login')}
          style={[styles.tab, !isRegister && styles.tabSelected]}
        >
          <Text style={styles.tabText}>Iniciar sesión</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>{isRegister ? 'Crea tu cuenta' : 'Qué bueno verte'}</Text>
      <Text style={styles.copy}>
        {isRegister
          ? 'Solo necesitas tu nombre, teléfono y una clave corta.'
          : 'Escribe tu teléfono y tu clave para continuar.'}
      </Text>
      {isRegister ? (
        <TextField
          autoCapitalize="words"
          autoComplete="name"
          onChangeText={setDisplayName}
          onFocus={onInputFocus}
          placeholder="Tu nombre completo"
          value={displayName}
        />
      ) : null}
      <Text style={styles.label}>República Dominicana</Text>
      <View style={styles.phoneRow}>
        <Text style={styles.prefix}>+1</Text>
        <TextField
          accessibilityLabel="Número de teléfono"
          autoComplete="tel"
          keyboardType="phone-pad"
          maxLength={10}
          onChangeText={setPhone}
          onFocus={onInputFocus}
          placeholder="809 000 0000"
          style={styles.phone}
          value={phone}
        />
      </View>
      <TextField
        accessibilityLabel="Clave numérica"
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        keyboardType="number-pad"
        maxLength={6}
        onChangeText={setPasscode}
        onFocus={onInputFocus}
        placeholder="Clave de 4 a 6 números"
        secureTextEntry
        value={passcode}
      />
      <PrimaryButton
        disabled={loading}
        label={loading ? 'Un momento…' : isRegister ? 'Crear mi cuenta' : 'Entrar'}
        onPress={() => void submit()}
      />
      <Notice message={notice} />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  switcher: {
    backgroundColor: colors.line,
    borderRadius: 14,
    flexDirection: 'row',
    padding: 4,
  },
  tab: { alignItems: 'center', borderRadius: 10, flex: 1, paddingVertical: spacing.sm },
  tabSelected: { backgroundColor: colors.glassStrong },
  tabText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  title: { color: colors.ink, fontSize: type.cardTitle, fontWeight: '800' },
  copy: { color: colors.mutedInk, fontSize: type.body, lineHeight: 24 },
  label: { color: colors.mutedInk, fontSize: type.body },
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
});
