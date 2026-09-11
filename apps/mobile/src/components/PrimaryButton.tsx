import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, type } from '../theme/tokens';

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  arrow = true,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  arrow?: boolean;
}): React.JSX.Element {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      {arrow ? <Text style={styles.arrow}>→</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 60,
    paddingHorizontal: spacing.lg,
  },
  pressed: { backgroundColor: colors.accentPressed },
  disabled: { opacity: 0.55 },
  label: { color: colors.ink, fontSize: type.button, fontWeight: '900' },
  arrow: { color: colors.ink, fontSize: 29, marginLeft: spacing.sm },
});
