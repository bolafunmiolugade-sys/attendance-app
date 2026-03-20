import React, { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { TextInput } from "@/src/components/TextInput";
import { theme } from "@/src/constants/theme";
import { useAuthStore } from "@/src/store/authStore";
import { Role } from "@/src/types";
import { useRegister, useLecturerRegister } from "@/src/hooks/useAuthHooks";

// Validation schema for Student
const studentRegisterSchema = yup.object({
  full_name: yup.string().required("Full name is required"),
  email: yup.string().required("Email is required").email("Enter a valid email"),
  password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
  department: yup.string().required("Department is required"),
  matric_number: yup.string().required("Matric number is required"),
  level: yup.string().required("Level is required"),
});

// Validation schema for Lecturer
const lecturerRegisterSchema = yup.object({
  full_name: yup.string().required("Full name is required"),
  email: yup.string().required("Email is required").email("Enter a valid email"),
  password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
  department: yup.string().required("Department is required"),
  qualifications: yup.string().required("Qualifications are required"),
});

type StudentRegisterFormData = yup.InferType<typeof studentRegisterSchema>;
type LecturerRegisterFormData = yup.InferType<typeof lecturerRegisterSchema>;

export default function RegisterScreen() {
  const [role, setRole] = useState<Role>("STUDENT");
  const loginToStore = useAuthStore((state) => state.register);
  const router = useRouter();

  // React Query Hooks
  const { mutate: studentRegister, isPending: isStudentPending } = useRegister();
  const { mutate: lecturerRegister, isPending: isLecturerPending } = useLecturerRegister();

  const isPending = role === "STUDENT" ? isStudentPending : isLecturerPending;

  // React Hook Form for Student
  const studentForm = useForm<StudentRegisterFormData>({
    resolver: yupResolver(studentRegisterSchema),
    defaultValues: { full_name: "", email: "", password: "", department: "", matric_number: "", level: "" },
  });

  // React Hook Form for Lecturer
  const lecturerForm = useForm<LecturerRegisterFormData>({
    resolver: yupResolver(lecturerRegisterSchema),
    defaultValues: { full_name: "", email: "", password: "", department: "", qualifications: "" },
  });

  const onStudentSubmit = (data: StudentRegisterFormData) => {
    studentRegister(data, {
      onSuccess: (res) => {
        const userWithRole = { ...res.user, role: "STUDENT" as const };
        loginToStore(userWithRole, res.token);
        router.replace("/(student)/map" as any);
      },
      onError: (err: any) => {
        Alert.alert("Registration Failed", err?.response?.data?.message || err.message || "An error occurred");
      },
    });
  };

  const onLecturerSubmit = (data: LecturerRegisterFormData) => {
    lecturerRegister(data, {
      onSuccess: (res) => {
        const userWithRole = { ...res.user, role: "LECTURER" as const };
        loginToStore(userWithRole, res.token);
        router.replace("/(lecturer)/dashboard" as any);
      },
      onError: (err: any) => {
        Alert.alert("Registration Failed", err?.response?.data?.message || err.message || "An error occurred");
      },
    });
  };

  return (
    <Screen noPadding>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our attendance system</Text>
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
              <View key="student-register-form">
                <Controller
                  control={studentForm.control}
                  name="full_name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Full Name"
                      placeholder="Enter your full name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={studentForm.formState.errors.full_name?.message}
                    />
                  )}
                />

                <Controller
                  control={studentForm.control}
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
                      error={studentForm.formState.errors.email?.message}
                    />
                  )}
                />

                <Controller
                  control={studentForm.control}
                  name="matric_number"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Matric Number"
                      placeholder="Enter your student ID"
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
                  name="level"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Level"
                      placeholder="e.g., 400"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={studentForm.formState.errors.level?.message}
                    />
                  )}
                />
                
                <Controller
                  control={studentForm.control}
                  name="department"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Department"
                      placeholder="e.g., Computer Science"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={studentForm.formState.errors.department?.message}
                    />
                  )}
                />

                <Controller
                  control={studentForm.control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Password"
                      placeholder="Create a password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                      error={studentForm.formState.errors.password?.message}
                    />
                  )}
                />

                <Button
                  title="Sign Up"
                  onPress={studentForm.handleSubmit(onStudentSubmit)}
                  style={{ marginTop: theme.spacing.md }}
                  loading={isPending}
                />
              </View>
            ) : (
              <View key="lecturer-register-form">
                <Controller
                  control={lecturerForm.control}
                  name="full_name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Full Name"
                      placeholder="Enter your full name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={lecturerForm.formState.errors.full_name?.message}
                    />
                  )}
                />

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
                  name="department"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Department"
                      placeholder="e.g., Computer Science"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={lecturerForm.formState.errors.department?.message}
                    />
                  )}
                />

                <Controller
                  control={lecturerForm.control}
                  name="qualifications"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Qualifications"
                      placeholder="e.g., Ph.D, M.Sc"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={lecturerForm.formState.errors.qualifications?.message}
                    />
                  )}
                />

                <Controller
                  control={lecturerForm.control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Password"
                      placeholder="Create a password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                      error={lecturerForm.formState.errors.password?.message}
                    />
                  )}
                />

                <Button
                  title="Sign Up"
                  onPress={lecturerForm.handleSubmit(onLecturerSubmit)}
                  style={{ marginTop: theme.spacing.md }}
                  loading={isPending}
                />
              </View>
            )}

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
    justifyContent: "center",
    padding: theme.spacing.lg,
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
