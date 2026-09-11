import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../auth/session-context';
import { BrandMark } from '../../components/BrandMark';
import { CredentialAccessForm } from './CredentialAccessForm';
import { colors, spacing } from '../../theme/tokens';

export function AccessScreen(): React.JSX.Element {
  const { establish } = useSession();
  const scrollView = useRef<ScrollView>(null);

  function revealAccessAction(): void {
    requestAnimationFrame(() => scrollView.current?.scrollToEnd({ animated: true }));
  }

  return (
    <View style={styles.page}>
      <View pointerEvents="none" style={styles.orb} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoider}
      >
        <SafeAreaView style={styles.safe}>
          <ScrollView
            ref={scrollView}
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={styles.content}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <BrandMark />
              <Text style={styles.brand}>TuCartón</Text>
            </View>
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>UN REGISTRO QUE AMBOS RECONOCEN</Text>
              <Text style={styles.title}>Tu cartón,{`\n`}sin papel.</Text>
              <Text style={styles.subtitle}>
                Usa tu número de teléfono para crear tu cuenta o entrar.
              </Text>
            </View>
            <CredentialAccessForm onAuthenticated={establish} onInputFocus={revealAccessAction} />
            <Text style={styles.legal}>Tu número se usa solo para proteger tu cuenta.</Text>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.canvas, flex: 1, overflow: 'hidden' },
  keyboardAvoider: { flex: 1 },
  safe: { flex: 1 },
  content: { flexGrow: 1, gap: spacing.xl, padding: spacing.lg, paddingBottom: spacing.xxl },
  orb: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 310,
    opacity: 0.75,
    position: 'absolute',
    right: -115,
    top: -92,
    width: 310,
  },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  brand: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  hero: { gap: spacing.md },
  eyebrow: { color: colors.mutedInk, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  title: { color: colors.ink, fontSize: 48, fontWeight: '900', letterSpacing: -2, lineHeight: 50 },
  subtitle: { color: colors.mutedInk, fontSize: 21, lineHeight: 29 },
  legal: { color: colors.subtleInk, fontSize: 13, textAlign: 'center' },
});
