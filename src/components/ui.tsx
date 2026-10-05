import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius } from '../theme';

/** Primary / ghost button with a built-in loading spinner. */
export function Button({ title, onPress, loading, variant = 'primary', disabled }: {
  title: string; onPress: () => void; loading?: boolean; variant?: 'primary' | 'ghost'; disabled?: boolean;
}) {
  const ghost = variant === 'ghost';
  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [s.btn, ghost ? s.btnGhost : s.btnPrimary, pressed && { opacity: 0.8 }, disabled && { opacity: 0.5 }]}>
      {loading ? <ActivityIndicator color={ghost ? colors.primary : '#fff'} />
        : <Text style={[s.btnText, ghost && { color: colors.primary }]}>{title}</Text>}
    </Pressable>
  );
}

/** Labelled text input. */
export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        {...props}
        style={[s.input, props.multiline && { minHeight: 80, textAlignVertical: 'top' }, !!error && { borderColor: colors.danger }]}
      />
      {!!error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

/** Small selectable pill used for filters and sorting. */
export function Chip({ label, active, onPress, color }: { label: string; active?: boolean; onPress: () => void; color?: string }) {
  const tint = color ?? colors.primary;
  return (
    <Pressable onPress={onPress} style={[s.chip, active && { backgroundColor: tint, borderColor: tint }]}>
      <Text style={[s.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  btnPrimary: { backgroundColor: colors.primary },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 6 },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.line,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.ink,
  },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, marginRight: 8 },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.ink },
});
