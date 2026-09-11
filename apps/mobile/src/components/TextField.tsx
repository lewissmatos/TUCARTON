import { StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { colors, radius, type } from '../theme/tokens';

export function TextField(props: TextInputProps): React.JSX.Element {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.subtleInk}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.glass,
    borderColor: colors.line,
    borderRadius: radius.input,
    borderWidth: 1,
    color: colors.ink,
    fontSize: type.body,
    fontWeight: '700',
    minHeight: 58,
    paddingHorizontal: 16,
  },
});
