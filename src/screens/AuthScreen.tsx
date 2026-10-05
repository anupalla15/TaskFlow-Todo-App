import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Field } from '../components/ui';
import { useAppDispatch, useAppSelector } from '../store';
import { clearError, login, register } from '../store/authSlice';
import { colors } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login' | 'Register'>;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** One screen for both Login and Register (the route name decides which). */
export default function AuthScreen({ navigation, route }: Props) {
  const isRegister = route.name === 'Register';
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { dispatch(clearError()); }, [route.name, dispatch]);

  // Client-side validation before hitting the API.
  const submit = () => {
    const e: Record<string, string> = {};
    if (isRegister && !name.trim()) e.name = 'Enter your name';
    if (!EMAIL_RE.test(email.trim())) e.email = 'Enter a valid email address';
    if (password.length < 6) e.password = 'Use at least 6 characters';
    setErrors(e);
    if (Object.keys(e).length) return;
    dispatch(isRegister
      ? register({ name: name.trim(), email: email.trim(), password })
      : login({ email: email.trim(), password }));
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.mark}><Text style={s.markText}>✓</Text></View>
          <Text style={s.h1}>{isRegister ? 'Create your account' : 'Welcome back'}</Text>
          <Text style={s.sub}>
            {isRegister ? 'Plan tasks by start time, deadline and priority.' : 'Log in to see what needs doing first.'}
          </Text>

          {isRegister && <Field label="Name" value={name} onChangeText={setName} error={errors.name} placeholder="Asha Rao" />}
          <Field label="Email" value={email} onChangeText={setEmail} error={errors.email} autoCapitalize="none"
            keyboardType="email-address" placeholder="you@example.com" />
          <Field label="Password" value={password} onChangeText={setPassword} error={errors.password}
            secureTextEntry placeholder="At least 6 characters" />

          {!!error && <Text style={s.apiError}>{error}</Text>}

          <Button title={isRegister ? 'Create account' : 'Log in'} onPress={submit} loading={loading} />

          <Pressable onPress={() => navigation.replace(isRegister ? 'Login' : 'Register')} style={{ marginTop: 20 }}>
            <Text style={s.switch}>
              {isRegister ? 'Already have an account? ' : 'New here? '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{isRegister ? 'Log in' : 'Create an account'}</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 24, paddingTop: 56 },
  mark: { width: 56, height: 56, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 24, transform: [{ rotate: '-8deg' }] },
  markText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  h1: { fontFamily: 'serif', fontSize: 32, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 15, color: colors.muted, marginTop: 6, marginBottom: 28 },
  apiError: { color: colors.danger, fontWeight: '600', marginBottom: 12 },
  switch: { textAlign: 'center', color: colors.muted, fontSize: 14 },
});
