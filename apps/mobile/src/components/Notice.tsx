import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme/tokens';

export function Notice({ message }: { message: string | null }): React.JSX.Element | null {
  return message ? (
    <Text accessibilityLiveRegion="polite" style={styles.notice}>
      {message}
    </Text>
  ) : null;
}

const styles = StyleSheet.create({
  notice: { color: colors.mutedInk, fontSize: 15, lineHeight: 21, textAlign: 'center' },
});
