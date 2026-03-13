import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Screen } from '@/src/components/Screen';
import { theme } from '@/src/constants/theme';
import { useAuthStore } from '@/src/store/authStore';
import { useAppStore } from '@/src/store/appStore';

export default function LecturerSchedulesIndex() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { courses, schedules } = useAppStore();

  const myCourses = courses.filter(c => c.lecturer_id === user?.id);
  const myCourseIds = myCourses.map(c => c.id);
  const mySchedules = schedules.filter(s => myCourseIds.includes(s.course_id))
     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderItem = ({ item }: { item: any }) => {
     const course = myCourses.find(c => c.id === item.course_id);
     return (
        <TouchableOpacity 
           style={styles.card}
           activeOpacity={0.7}
           onPress={() => router.push(`/(lecturer)/schedules/${item.id}` as any)}
        >
           <View style={styles.cardHeader}>
              <Text style={styles.courseCode}>{course?.code}</Text>
              <Text style={styles.date}>{format(new Date(item.date), 'MMM dd, yyyy')}</Text>
           </View>
           <Text style={styles.courseName}>{course?.name}</Text>
           <Text style={styles.timeLabel}>
              {format(new Date(item.start_time), 'hh:mm a')} - {format(new Date(item.end_time), 'hh:mm a')}
           </Text>
           <View style={styles.badge}>
              <Text style={styles.badgeText}>Radius: {item.radius_meters}m</Text>
           </View>
        </TouchableOpacity>
     );
  };

  return (
    <Screen>
      <View style={styles.headerRow}>
         <Text style={styles.title}>All Schedules</Text>
         <TouchableOpacity 
            style={styles.fab}
            onPress={() => router.push('/(lecturer)/schedules/create')}
         >
            <Feather name="plus" color={theme.colors.surface} size={20} />
            <Text style={styles.fabText}>New</Text>
         </TouchableOpacity>
      </View>

      <FlatList
         data={mySchedules}
         keyExtractor={item => item.id}
         renderItem={renderItem}
         contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
         ListEmptyComponent={<Text style={styles.emptyText}>No schedules created yet.</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginBottom: theme.spacing.lg,
  },
  title: {
     ...theme.typography.h2,
     color: theme.colors.text,
  },
  fab: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: theme.colors.primary,
     paddingHorizontal: theme.spacing.md,
     paddingVertical: theme.spacing.sm,
     borderRadius: theme.borderRadius.full,
     gap: 4,
  },
  fabText: {
     ...theme.typography.body,
     color: theme.colors.surface,
     fontWeight: '600',
  },
  card: {
     backgroundColor: theme.colors.surface,
     padding: theme.spacing.md,
     borderRadius: theme.borderRadius.md,
     marginBottom: theme.spacing.md,
     borderWidth: 1,
     borderColor: theme.colors.border,
  },
  cardHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     marginBottom: 4,
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
     ...theme.typography.h3,
     color: theme.colors.text,
     marginBottom: theme.spacing.sm,
  },
  timeLabel: {
     ...theme.typography.body,
     color: theme.colors.textSecondary,
     marginBottom: theme.spacing.sm,
  },
  badge: {
     alignSelf: 'flex-start',
     backgroundColor: theme.colors.background,
     paddingHorizontal: theme.spacing.sm,
     paddingVertical: 4,
     borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
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
