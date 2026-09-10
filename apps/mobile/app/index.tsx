import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TuCarton</Text>
      <Text style={styles.copy}>
        Foundation shell — product flows will be added in approved work items.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  copy: {
    marginTop: 12,
    textAlign: 'center',
  },
});
