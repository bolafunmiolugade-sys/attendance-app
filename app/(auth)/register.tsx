import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { Button } from '@/src/components/Button';
import { TextInput } from '@/src/components/TextInput';
import { theme } from '@/src/constants/theme';
import { useAuthStore } from '@/src/store/authStore';
import { Role } from '@/src/types';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const register = useAuthStore((state) => state.register);
  const router = useRouter();

  const handleRegister = () => {
    if (!name || !email) return;
    
    register({
      name,
      email,
      role,
      ...(role === 'STUDENT' ? { matric_number: matricNumber } : {})
    });
    
    if (role === 'STUDENT') {
       router.replace('/(student)/map' as any);
    } else {
       router.replace('/(lecturer)/dashboard' as any);
    }
  };

  return (
    <Screen noPadding>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our attendance system</Text>
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
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            {role === 'STUDENT' && (
              <TextInput
                label="Matric Number"
                placeholder="Enter your student ID"
                value={matricNumber}
                onChangeText={setMatricNumber}
              />
            )}

            <TextInput
              label="Password"
              placeholder="Create a password"
              secureTextEntry
            />

            <Button 
              title="Sign Up" 
              onPress={handleRegister}
              style={{ marginTop: theme.spacing.md }}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Text style={styles.link}>Sign In</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
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
