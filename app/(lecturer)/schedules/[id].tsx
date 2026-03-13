import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { Screen } from '@/src/components/Screen';
import { theme } from '@/src/constants/theme';
import { useAppStore } from '@/src/store/appStore';

export default function ScheduleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { schedules, attendance, courses } = useAppStore();

  const schedule = schedules.find(s => s.id === id);
  const course = courses.find(c => c.id === schedule?.course_id);
  
  // Find who attended this specific schedule
  const attendees = attendance.filter(a => a.schedule_id === id);

  if (!schedule || !course) {
     return (
        <Screen>
           <Text>Schedule not found.</Text>
        </Screen>
     );
  }

  const renderStudentRow = ({ item, index }: { item: any, index: number }) => (
     <View style={styles.row}>
        <Text style={styles.rowCell}>{index + 1}</Text>
        <Text style={[styles.rowCell, { flex: 3 }]}>{item.student_id.split('-')[1] || item.student_id}</Text>
        <Text style={[styles.rowCell, { flex: 2 }]}>{format(new Date(item.marked_at), 'hh:mm:ss a')}</Text>
     </View>
  );

  return (
    <Screen>
      <View style={styles.headerCard}>
         <Text style={styles.courseCode}>{course.code}</Text>
         <Text style={styles.courseName}>{course.name}</Text>
         <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
               <Text style={styles.detailLabel}>Date</Text>
               <Text style={styles.detailValue}>{format(new Date(schedule.date), 'MMM dd, yyyy')}</Text>
            </View>
            <View style={styles.detailItem}>
               <Text style={styles.detailLabel}>Radius</Text>
               <Text style={styles.detailValue}>{schedule.radius_meters}m</Text>
            </View>
         </View>
      </View>

      <Text style={styles.sectionTitle}>Attendance Log ({attendees.length})</Text>

      <View style={styles.tableHeader}>
         <Text style={styles.tableHeadCell}>#</Text>
         <Text style={[styles.tableHeadCell, { flex: 3 }]}>Student ID</Text>
         <Text style={[styles.tableHeadCell, { flex: 2 }]}>Time Marked</Text>
      </View>

      <FlatList
         data={attendees}
         keyExtractor={item => item.id}
         renderItem={renderStudentRow}
         contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
         ListEmptyComponent={<Text style={styles.emptyText}>No students have marked attendance yet.</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCard: {
     backgroundColor: theme.colors.surface,
     padding: theme.spacing.lg,
     borderRadius: theme.borderRadius.md,
     marginBottom: theme.spacing.xl,
     borderWidth: 1,
     borderColor: theme.colors.border,
  },
  courseCode: {
     ...theme.typography.caption,
     color: theme.colors.primary,
     fontWeight: '700',
  },
  courseName: {
     ...theme.typography.h2,
     color: theme.colors.text,
     marginBottom: theme.spacing.md,
  },
  detailsGrid: {
     flexDirection: 'row',
     borderTopWidth: 1,
     borderTopColor: theme.colors.border,
     paddingTop: theme.spacing.md,
  },
  detailItem: {
     flex: 1,
  },
  detailLabel: {
     ...theme.typography.caption,
     color: theme.colors.textSecondary,
  },
  detailValue: {
     ...theme.typography.body,
     color: theme.colors.text,
     fontWeight: '600',
  },
  sectionTitle: {
     ...theme.typography.h3,
     color: theme.colors.text,
     marginBottom: theme.spacing.md,
  },
  tableHeader: {
     flexDirection: 'row',
     backgroundColor: theme.colors.border,
     paddingVertical: theme.spacing.sm,
     paddingHorizontal: theme.spacing.md,
     borderTopLeftRadius: theme.borderRadius.md,
     borderTopRightRadius: theme.borderRadius.md,
  },
  tableHeadCell: {
     flex: 1,
     ...theme.typography.caption,
     fontWeight: '700',
     color: theme.colors.textSecondary,
  },
  row: {
     flexDirection: 'row',
     backgroundColor: theme.colors.surface,
     paddingVertical: theme.spacing.md,
     paddingHorizontal: theme.spacing.md,
     borderBottomWidth: 1,
     borderBottomColor: theme.colors.border,
  },
  rowCell: {
     flex: 1,
     ...theme.typography.bodySmall,
     color: theme.colors.text,
  },
  emptyText: {
     ...theme.typography.body,
     color: theme.colors.textSecondary,
     textAlign: 'center',
     padding: theme.spacing.xl,
     backgroundColor: theme.colors.surface,
     borderBottomLeftRadius: theme.borderRadius.md,
     borderBottomRightRadius: theme.borderRadius.md,
  }
});
