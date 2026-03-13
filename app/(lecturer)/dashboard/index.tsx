import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { theme } from '@/src/constants/theme';
import { useAuthStore } from '@/src/store/authStore';
import { useAppStore } from '@/src/store/appStore';
import { format, isToday } from 'date-fns';

export default function LecturerDashboard() {
  const { user } = useAuthStore();
  const { courses, schedules, attendance } = useAppStore();

  const myCourses = courses.filter(c => c.lecturer_id === user?.id);
  const myCourseIds = myCourses.map(c => c.id);
  
  const mySchedules = schedules.filter(s => myCourseIds.includes(s.course_id));
  const todaysSchedules = mySchedules.filter(s => isToday(new Date(s.date)));
  
  const totalAttendanceCount = attendance.filter(a => mySchedules.some(s => s.id === a.schedule_id)).length;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name}</Text>
          <Text style={styles.subtitle}>
            Here&apos;s what&apos;s happening today.
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{myCourses.length}</Text>
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
          todaysSchedules.map((schedule) => {
            const course = myCourses.find((c) => c.id === schedule.course_id);
            return (
              <View key={schedule.id} style={styles.card}>
                <Text style={styles.courseCode}>{course?.code}</Text>
                <Text style={styles.scheduleTime}>
                  {format(new Date(schedule.start_time), "hh:mm a")} -{" "}
                  {format(new Date(schedule.end_time), "hh:mm a")}
                </Text>
                <Text style={styles.infoText}>
                  Radius: {schedule.radius_meters}m
                </Text>
              </View>
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
     flexDirection: 'row',
     backgroundColor: theme.colors.surface,
     borderRadius: theme.borderRadius.md,
     borderWidth: 1,
     borderColor: theme.colors.border,
     paddingVertical: theme.spacing.md,
     marginBottom: theme.spacing.xl,
  },
  statBox: {
     flex: 1,
     alignItems: 'center',
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
     textAlign: 'center',
     marginTop: theme.spacing.lg,
  }
});
