import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}): React.JSX.Element {
  const router = useRouter();
  return (
    <View style={styles.wrapper}>
      <Pressable accessibilityLabel="Volver" onPress={() => router.back()}>
        <Text style={styles.back}>← Volver</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  back: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  title: { color: colors.ink, fontSize: 32, fontWeight: '900' },
  subtitle: { color: colors.mutedInk, fontSize: 17, lineHeight: 24 },
});
