import { Screen } from "@/src/components/Screen";
import { theme } from "@/src/constants/theme";
import { useGetCourses } from "@/src/hooks/useCourseHooks";
import {
  useGetMyCourses,
  useRegisterCourses,
} from "@/src/hooks/useUserCourseHooks";
import { useAuthStore } from "@/src/store/authStore";
import { Course } from "@/src/types";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function StudentCoursesScreen() {
  const { user } = useAuthStore();

  // Real API hooks
  const {
    data: allCoursesResponse,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    error: errorAll,
  } = useGetCourses();
  const {
    data: myCoursesResponse,
    isLoading: isLoadingMy,
    isError: isErrorMy,
    error: errorMy,
  } = useGetMyCourses();
  const { mutate: register, isPending: isRegistering } = useRegisterCourses();

  // Extract arrays from backend response { success: true, courses: [...] }
  const courses = allCoursesResponse?.courses || [];
  const myCourses = myCoursesResponse?.courses || [];

  const handleRegister = (courseId: string) => {
    if (!user) return;

    // Check if already enrolled (Strict check on course_id)
    const isEnrolled = myCourses.some(
      (c: any) =>
        (c.course_id && c.course_id === courseId) ||
        (c.id && String(c.id) === String(courseId)),
    );
    if (isEnrolled) {
      Alert.alert("Info", "You are already registered for this course.");
      return;
    }

    // Backend expects { courses: [course_id] }
    register(
      { courses: [courseId] },
      {
        onSuccess: () => {
          Alert.alert("Success", "Registered for course!");
        },
        onError: (err: any) => {
          Alert.alert(
            "Error",
            err?.response?.data?.message || "Failed to register for course",
          );
        },
      },
    );
  };

  const renderCourseItem = ({ item }: { item: Course }) => {
    // Check if enrolled by matching the unique course_id
    const isEnrolled = myCourses.some(
      (c: any) =>
        (c.course_id && c.course_id === item.course_id) ||
        (c.id && String(c.id) === String(item.course_id)),
    );

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.courseCode}>{item.course_id}</Text>
          <Text style={styles.courseName}>{item.course_name}</Text>
          <Text style={styles.lecturerName}>
            Lecturer: {item.lecturer_name || "N/A"}
          </Text>
        </View>
        <Pressable
          disabled={isEnrolled || isRegistering}
          onPress={() => handleRegister(item.course_id as string)}
          style={{
            alignSelf: "center",
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            backgroundColor: isEnrolled
              ? theme.colors.primaryLight
              : theme.colors.primary,
            borderRadius: theme.borderRadius.sm,
            opacity: isRegistering ? 0.7 : 1,
            minWidth: 80,
            alignItems: "center",
          }}
        >
          {isRegistering && !isEnrolled ? (
            <ActivityIndicator size="small" color={theme.colors.surface} />
          ) : (
            <Text style={{ color: theme.colors.surface, fontWeight: "600" }}>
              {isEnrolled ? "Enrolled" : "Register"}
            </Text>
          )}
        </Pressable>
      </View>
    );
  };

  if (isLoadingAll || isLoadingMy) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      </Screen>
    );
  }

  if (isErrorAll || isErrorMy) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            Error:{" "}
            {(errorAll as any)?.message ||
              (errorMy as any)?.message ||
              "Failed to load data"}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.sectionTitle}>
        Available Courses ({courses.length})
      </Text>
      <FlatList
        data={courses}
        keyExtractor={(item) => String(item.course_id)}
        renderItem={renderCourseItem}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No courses available yet.</Text>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardContent: {
    flex: 1,
  },
  courseCode: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "700",
    marginBottom: 4,
  },
  courseName: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: "600",
    marginBottom: 4,
  },
  lecturerName: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: "500",
    // fontStyle: "italic",
  },

  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
  },
});
