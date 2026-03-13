import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { format } from 'date-fns';
import { Screen } from '@/src/components/Screen';
import { theme } from '@/src/constants/theme';
import { useAppStore } from '@/src/store/appStore';
import { useAuthStore } from '@/src/store/authStore';

export default function StudentHistoryScreen() {
  const { user } = useAuthStore();
  const { attendance, schedules, courses } = useAppStore();

  // Get attendance logs for current student
  const myAttendance = attendance.filter(a => a.student_id === user?.id);

  // Map attendance to display proper course info and dates
  const historyData = myAttendance.map(log => {
      const schedule = schedules.find(s => s.id === log.schedule_id);
      const course = courses.find(c => c.id === schedule?.course_id);
      return {
         ...log,
         courseName: course?.name || 'Unknown Course',
         courseCode: course?.code || '---',
         date: schedule?.date || log.marked_at, 
      };
  }).sort((a, b) => new Date(b.marked_at).getTime() - new Date(a.marked_at).getTime());

  const renderHistoryItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
         <Text style={styles.courseCode}>{item.courseCode}</Text>
         <Text style={styles.date}>{format(new Date(item.date), 'MMM dd, yyyy')}</Text>
      </View>
      <Text style={styles.courseName}>{item.courseName}</Text>
      <View style={styles.statusRow}>
         <Text style={styles.statusLabel}>Status:</Text>
         <Text style={styles.statusValue}>Present</Text>
      </View>
      <Text style={styles.markedAt}>
         Marked Location: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
      </Text>
      <Text style={styles.markedAt}>
         Time: {format(new Date(item.marked_at), 'hh:mm a')}
      </Text>
    </View>
  );

  return (
    <Screen>
      <Text style={styles.title}>History ({historyData.length})</Text>
      <FlatList
        data={historyData}
        keyExtractor={item => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        ListEmptyComponent={<Text style={styles.emptyText}>No attendance records found.</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     marginBottom: theme.spacing.xs,
  },
  courseCode: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  courseName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  statusRow: {
     flexDirection: 'row',
     alignItems: 'center',
     marginBottom: theme.spacing.xs,
  },
  statusLabel: {
     ...theme.typography.bodySmall,
     color: theme.colors.textSecondary,
     marginRight: 4,
  },
  statusValue: {
     ...theme.typography.bodySmall,
     color: theme.colors.success,
     fontWeight: '700',
  },
  markedAt: {
     ...theme.typography.caption,
     color: theme.colors.textSecondary,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  }
});
