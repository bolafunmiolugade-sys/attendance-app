import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { Button } from '@/src/components/Button';
import { TextInput } from '@/src/components/TextInput';
import { theme } from '@/src/constants/theme';
import { useAuthStore } from '@/src/store/authStore';
import { Role } from '@/src/types';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleLogin = () => {
    if (!email) return;
    login(email, role);
    if (role === 'STUDENT') {
       router.replace('/(student)/map' as any);
    } else {
       router.replace('/(lecturer)/dashboard' as any);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to manage your attendance</Text>
        </View>

        <View style={styles.roleContainer}>
          <Button 
            title="Student" 
            variant={role === 'STUDENT' ? 'primary' : 'outline'}
            onPress={() => setRole('STUDENT')}
            style={styles.roleButton}
          />
          <Button 
            title="Lecturer" 
            variant={role === 'LECTURER' ? 'primary' : 'outline'}
            onPress={() => setRole('LECTURER')}
            style={styles.roleButton}
          />
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
          />

          <Button 
            title="Sign In" 
            onPress={handleLogin}
            style={{ marginTop: theme.spacing.md }}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <Text style={styles.link}>Sign Up</Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  roleButton: {
    flex: 1,
  },
  formContainer: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.textSecondary,
    ...theme.typography.body,
  },
  link: {
    color: theme.colors.primary,
    ...theme.typography.body,
    fontWeight: '600',
  }
});
