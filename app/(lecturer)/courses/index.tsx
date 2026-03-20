import { Screen } from "@/src/components/Screen";
import { theme } from "@/src/constants/theme";
import { useGetCourses } from "@/src/hooks/useCourseHooks";
import { useAppStore } from "@/src/store/appStore";
import { useAuthStore } from "@/src/store/authStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View, TouchableOpacity } from "react-native";

export default function LecturerCoursesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { courses, createCourse } = useAppStore();
  const {
    data: allCoursesResponse,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    error: errorAll,
  } = useGetCourses();

  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");

  const availableCourses = allCoursesResponse?.courses || [];
  useEffect(() => {
    console.log(allCoursesResponse, isLoadingAll);
  }, [allCoursesResponse, isLoadingAll]);

  
  const handleCreateCourse = () => {
    if (!newCode || !newName || !user) {
      Alert.alert("Error", "Please enter both course code and name.");
      return;
    }

    createCourse({
      code: newCode.toUpperCase(),
      name: newName,
      lecturer_id: String(user.id),
    });

    setNewCode("");
    setNewName("");
    Alert.alert("Success", "Course created successfully!");
  };

  const renderCourseItem = ({ item }: { item: any }) => {
    const studentCount = item.student_count || 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/(lecturer)/courses/[id]/members",
            params: { id: item.course_id },
          })
        }
      >

        <View style={styles.cardContent}>
          <Text style={styles.courseCode}>{item.course_id}</Text>
          <Text style={styles.courseName}>{item.course_name}</Text>
          <Text style={styles.lecturerName}>Lecturer: {item.lecturer_name}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{studentCount} Students</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <Text style={styles.sectionTitle}>
        Assigned Courses ({availableCourses.length})
      </Text>
      <FlatList
        data={availableCourses}
        keyExtractor={(item) =>
          item.id || item.course_id || Math.random().toString()
        }
        renderItem={renderCourseItem}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            no courses assigned yet
          </Text>
        }
      />

    </Screen>
  );
}

const styles = StyleSheet.create({
  createSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  formRow: {
    flexDirection: "row",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
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
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: "600",
    marginBottom: 4,
  },
  lecturerName: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
  },

  badge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  badgeText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.lg,
  },
});
