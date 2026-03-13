import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  style,
  textStyle,
  icon
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return { bg: theme.colors.surface, text: theme.colors.text };
      case 'danger':
        return { bg: theme.colors.error, text: theme.colors.surface };
      case 'outline':
        return { bg: 'transparent', text: theme.colors.primary, border: theme.colors.primary };
      case 'primary':
      default:
        return { bg: theme.colors.primary, text: theme.colors.surface };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: disabled ? theme.colors.border : vStyles.bg },
        vStyles.border && { borderWidth: 1, borderColor: disabled ? theme.colors.border : vStyles.border },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vStyles.text} />
      ) : (
        <>
          {icon && <React.Fragment>{icon}</React.Fragment>}
          <Text style={[styles.text, { color: disabled ? theme.colors.textSecondary : vStyles.text }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  text: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '600',
  }
});
