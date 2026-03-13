import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { Button } from '@/src/components/Button';
import { theme } from '@/src/constants/theme';
import { useAuthStore } from '@/src/store/authStore';

export default function LecturerProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <Screen>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
           <Text style={styles.roleText}>{user?.role}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Status</Text>
            <Text style={styles.infoValue}>Active Staff</Text>
        </View>
      </View>

      <Button 
        title="Log Out" 
        variant="danger" 
        onPress={handleLogout} 
        style={styles.logoutBtn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    ...theme.typography.h1,
    color: theme.colors.surface,
  },
  name: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  email: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  roleBadge: {
     backgroundColor: theme.colors.border,
     paddingHorizontal: theme.spacing.sm,
     paddingVertical: 4,
     borderRadius: theme.borderRadius.sm,
  },
  roleText: {
     ...theme.typography.caption,
     fontWeight: '700',
  },
  section: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     paddingVertical: theme.spacing.sm,
     borderBottomWidth: 1,
     borderBottomColor: theme.colors.border,
  },
  infoLabel: {
     ...theme.typography.body,
     color: theme.colors.textSecondary,
  },
  infoValue: {
     ...theme.typography.body,
     color: theme.colors.text,
     fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 'auto',
  }
});
