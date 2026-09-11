import { BlurView } from 'expo-blur';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

export function GlassCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}): React.JSX.Element {
  return (
    <BlurView intensity={44} tint="light" style={[styles.card, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: colors.white,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.xl,
  },
});
