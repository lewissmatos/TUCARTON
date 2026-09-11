import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/tokens';

export function AppScreen({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}): React.JSX.Element {
  const content = <View style={styles.content}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.canvas, flex: 1 },
  scroll: { flexGrow: 1 },
  content: { flex: 1, gap: spacing.lg, padding: spacing.lg },
});
