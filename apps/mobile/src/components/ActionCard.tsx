import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

export function ActionCard({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.glassStrong,
    borderRadius: radius.input,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  pressed: { backgroundColor: colors.accent },
  title: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  description: { color: colors.mutedInk, fontSize: 14, marginTop: spacing.xs, maxWidth: 240 },
  arrow: { color: colors.ink, fontSize: 28, fontWeight: '700' },
});
