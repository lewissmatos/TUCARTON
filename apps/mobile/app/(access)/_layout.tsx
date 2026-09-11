import { Redirect, Stack, type Href } from 'expo-router';
import { Text } from 'react-native';
import { useSession } from '../../src/auth/session-context';

export default function AccessLayout(): React.JSX.Element {
  const { isRestoring, session } = useSession();
  if (isRestoring) return <Text>Cargando…</Text>;
  if (session) return <Redirect href={'/(app)' as Href} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
