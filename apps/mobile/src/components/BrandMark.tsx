import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme/tokens';

export function BrandMark(): React.JSX.Element {
  return (
    <View accessibilityLabel="Ícono de TuCartón" style={styles.mark}>
      <View style={styles.notebook} />
      <View style={styles.pen} />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: radius.small,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  notebook: { borderColor: colors.accent, borderRadius: 7, borderWidth: 2, height: 22, width: 17 },
  pen: {
    backgroundColor: colors.accent,
    height: 3,
    position: 'absolute',
    right: 2,
    top: 5,
    transform: [{ rotate: '-35deg' }],
    width: 16,
  },
});
