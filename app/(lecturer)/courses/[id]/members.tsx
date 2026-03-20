import { Screen } from "@/src/components/Screen";
import { theme } from "@/src/constants/theme";
import { useGetCourse, useGetCourseMembers } from "@/src/hooks/useCourseHooks";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CourseMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: courseData, isLoading: isLoadingCourse } = useGetCourse(id);
  const { data: membersData, isLoading: isLoadingMembers, refetch } = useGetCourseMembers(id);

  const course = courseData?.course;
  const members = membersData?.members || [];

  const renderMemberItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.memberName}>{item.full_name}</Text>
        <Text style={styles.memberSubInfo}>
          {item.matric_number} | {item.department} | Level {item.level}
        </Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
      </View>
    </View>
  );

  if (isLoadingCourse || isLoadingMembers) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/courses")} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>{course?.course_id}</Text>
          <Text style={styles.subtitle}>{course?.course_name}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {members.length} Registered Student{members.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.matric_number || item.user_id}
        renderItem={renderMemberItem}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        onRefresh={refetch}
        refreshing={isLoadingMembers}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No students registered yet.</Text>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.primary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  statsContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  statsText: {
    ...theme.typography.caption,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardInfo: {
    flex: 1,
  },
  memberName: {
    ...theme.typography.body,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },
  memberSubInfo: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  memberEmail: {
    ...theme.typography.caption,
    color: theme.colors.primary,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.xl,
  },
});
