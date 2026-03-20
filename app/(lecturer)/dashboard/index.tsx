import { Screen } from "@/src/components/Screen";
import { theme } from "@/src/constants/theme";
import { useGetCourses } from "@/src/hooks/useCourseHooks";
import { useGetSchedules } from "@/src/hooks/useScheduleHooks";
import { useAuthStore } from "@/src/store/authStore";

import { format, isToday } from "date-fns";
import React from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function LecturerDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { data: coursesData } = useGetCourses();
  const { data: schedulesData } = useGetSchedules();



  const mySchedules = schedulesData?.schedules || [];
  const todaysSchedules = mySchedules.filter((s: any) =>
    isToday(new Date(s.class_start_time)),
  );

  const totalAttendanceCount = mySchedules.reduce(
    (acc: number, s: any) => acc + (parseInt(s.present_count) || 0),
    0,
  );

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello, {user?.full_name.split(" ")[0]}
          </Text>
          <Text style={styles.subtitle}>
            Here&apos;s what&apos;s happening today.
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {coursesData ? (coursesData.courses || coursesData).length : 0}
            </Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{todaysSchedules.length}</Text>
            <Text style={styles.statLabel}>Classes Today</Text>
          </View>
          <View style={[styles.statBox, { borderRightWidth: 0 }]}>
            <Text style={styles.statValue}>{totalAttendanceCount}</Text>
            <Text style={styles.statLabel}>Total Marks</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today&apos;s Classes</Text>
        {todaysSchedules.length === 0 ? (
          <Text style={styles.emptyText}>
            You have no classes scheduled for today.
          </Text>
        ) : (
          todaysSchedules.map((schedule: any) => {
            return (
              <TouchableOpacity 
                key={schedule.id} 
                style={styles.card}
                onPress={() => router.push(`/(lecturer)/schedules/${schedule.id}`)}
              >
                <Text style={styles.courseCode}>{schedule.course_code}</Text>
                <Text style={styles.courseName}>{schedule.course_name}</Text>
                <Text style={styles.scheduleTime}>
                  {format(new Date(schedule.class_start_time), "hh:mm a")} -{" "}
                  {format(new Date(schedule.class_end_time), "hh:mm a")}
                </Text>
                <Text style={styles.infoText}>
                  Radius: {schedule.radius_m ? `${schedule.radius_m}m` : 'Not Set'} | {schedule.present_count || 0}/{schedule.registered_count || 0} Students
                </Text>
              </TouchableOpacity>

            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}


const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  statValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  courseCode: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "700",
    marginBottom: 2,
  },
  courseName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: 4,
  },

  scheduleTime: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  infoText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.lg,
  },
});
