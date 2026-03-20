import { Button } from "@/src/components/Button";
import { Screen } from "@/src/components/Screen";
import { TextInput } from "@/src/components/TextInput";
import { theme } from "@/src/constants/theme";
import { useLecturerLogin, useLogin } from "@/src/hooks/useAuthHooks";
import { useAuthStore } from "@/src/store/authStore";
import { Role } from "@/src/types";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as yup from "yup";

// Validation schema for Student
const studentLoginSchema = yup.object({
  matric_number: yup.string().required("Matric Number is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Validation schema for Lecturer
const lecturerLoginSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type StudentLoginFormData = yup.InferType<typeof studentLoginSchema>;
type LecturerLoginFormData = yup.InferType<typeof lecturerLoginSchema>;

export default function LoginScreen() {
  const [role, setRole] = useState<Role>("STUDENT");
  const loginToStore = useAuthStore((state) => state.login);
  const router = useRouter();

  // React Query Hooks
  const { mutate: studentLogin, isPending: isStudentPending } = useLogin();
  const { mutate: lecturerLogin, isPending: isLecturerPending } =
    useLecturerLogin();

  const isPending = role === "STUDENT" ? isStudentPending : isLecturerPending;

  // React Hook Form for Student
  const studentForm = useForm<StudentLoginFormData>({
    resolver: yupResolver(studentLoginSchema),
    defaultValues: { matric_number: "", password: "" },
  });

  // React Hook Form for Lecturer
  const lecturerForm = useForm<LecturerLoginFormData>({
    resolver: yupResolver(lecturerLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onStudentSubmit = (data: StudentLoginFormData) => {
    studentLogin(data, {
      onSuccess: (res) => {
        // Assume backend returns something like { token, user }
        // Ensure role is set for persistence-based routing
        const userWithRole = { ...res.user, role: "STUDENT" as const };
        loginToStore(userWithRole, res.token);
        router.replace("/(student)/map" as any);
      },
      onError: (err: any) => {
        Alert.alert(
          "Login Failed",
          err?.response?.data?.message || err.message || "An error occurred",
        );
        console.log({ err });
      },
    });
  };

  const onLecturerSubmit = (data: LecturerLoginFormData) => {
    lecturerLogin(data, {
      onSuccess: (res) => {
        const userWithRole = { ...res.user, role: "LECTURER" as const };
        loginToStore(userWithRole, res.token);
        router.replace("/(lecturer)/dashboard" as any);
      },
      onError: (err: any) => {
        Alert.alert(
          "Login Failed",
          err?.response?.data?.message || err.message || "An error occurred",
        );
      },
    });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to manage your attendance</Text>
        </View>

        <View style={styles.roleContainer}>
          <Button
            title="Student"
            variant={role === "STUDENT" ? "primary" : "outline"}
            onPress={() => setRole("STUDENT")}
            style={styles.roleButton}
            disabled={isPending}
          />
          <Button
            title="Lecturer"
            variant={role === "LECTURER" ? "primary" : "outline"}
            onPress={() => setRole("LECTURER")}
            style={styles.roleButton}
            disabled={isPending}
          />
        </View>

        <View style={styles.formContainer}>
          {role === "STUDENT" ? (
            <View key="student-form">
              <Controller
                control={studentForm.control}
                name="matric_number"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Matric Number"
                    placeholder="Enter your matric number"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    error={studentForm.formState.errors.matric_number?.message}
                  />
                )}
              />
              <Controller
                control={studentForm.control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Password"
                    placeholder="Enter your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    error={studentForm.formState.errors.password?.message}
                  />
                )}
              />
              <Button
                title="Sign In"
                onPress={studentForm.handleSubmit(onStudentSubmit)}
                style={{ marginTop: theme.spacing.md }}
                loading={isPending}
              />
            </View>
          ) : (
            <View key="lecturer-form">
              <Controller
                control={lecturerForm.control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Email Address"
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={lecturerForm.formState.errors.email?.message}
                  />
                )}
              />
              <Controller
                control={lecturerForm.control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Password"
                    placeholder="Enter your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    error={lecturerForm.formState.errors.password?.message}
                  />
                )}
              />
              <Button
                title="Sign In"
                onPress={lecturerForm.handleSubmit(onLecturerSubmit)}
                style={{ marginTop: theme.spacing.md }}
                loading={isPending}
              />
            </View>
          )}

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
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  roleButton: {
    flex: 1,
  },
  formContainer: {
    width: "100%",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.textSecondary,
    ...theme.typography.body,
  },
  link: {
    color: theme.colors.primary,
    ...theme.typography.body,
    fontWeight: "600",
  },
});
