import { Redirect, type Href } from 'expo-router';

export default function IndexRoute(): React.JSX.Element {
  return <Redirect href={'/(access)' as Href} />;
}
