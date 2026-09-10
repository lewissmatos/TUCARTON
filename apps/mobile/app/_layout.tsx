import { Stack } from 'expo-router';
import { Auth0Provider } from 'react-native-auth0';
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from '../src/auth/auth0-config';

export default function RootLayout(): React.JSX.Element {
  return (
    <Auth0Provider clientId={AUTH0_CLIENT_ID} domain={AUTH0_DOMAIN}>
      <Stack screenOptions={{ headerShown: false }} />
    </Auth0Provider>
  );
}
