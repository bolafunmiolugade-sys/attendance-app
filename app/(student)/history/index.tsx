import { differenceInMinutes, format, isValid } from "date-fns";
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { theme } from "@/src/constants/theme";
import { useGetStudentAttendanceHistory } from "@/src/hooks/useAttendanceHooks";
import { Ionicons } from "@expo/vector-icons";

export default function StudentHistoryScreen() {
  const { data: historyData, isLoading, refetch } = useGetStudentAttendanceHistory();

  const historyList = historyData?.history || [];

  const renderHistoryItem = ({ item }: { item: any }) => {
    const startTime = new Date(item.class_start_time || item.start_time);
    const endTime = new Date(item.class_end_time || item.end_time);
    
    let durationText = "";
    if (isValid(startTime) && isValid(endTime)) {
      const durationMin = differenceInMinutes(endTime, startTime);
      const hours = Math.floor(durationMin / 60);
      const mins = durationMin % 60;
      durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }

    return (
      <View style={[
        styles.card, 
        item.display_status === 'Absent' && styles.cardAbsent,
        item.display_status === 'Upcoming' && styles.cardUpcoming
      ]}>
        <View style={styles.cardHeader}>
           <Text style={styles.courseCode}>{item.course_code}</Text>
           <Text style={styles.date}>{format(startTime, 'MMM dd, yyyy')}</Text>
        </View>
        <Text style={styles.courseName}>{item.course_name}</Text>
        
        {durationText ? (
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.timeText}>
              {format(startTime, 'hh:mm a')} - {format(endTime, 'hh:mm a')} ({durationText})
            </Text>
          </View>
        ) : null}

        <View style={styles.statusRow}>
           <Text style={styles.statusLabel}>Status:</Text>
           <Text style={[
             styles.statusValue, 
             item.display_status === 'Absent' && styles.statusValueAbsent,
             item.display_status === 'Upcoming' && styles.statusValueUpcoming
           ]}>
             {item.display_status}
           </Text>
        </View>
        {item.display_status === 'Present' && item.marked_at && (
          <Text style={styles.markedAt}>
             Marked at: {format(new Date(item.marked_at), 'hh:mm a')}
          </Text>
        )}
      </View>
    );
  };

  if (isLoading) {
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
      <Text style={styles.title}>Attendance History ({historyList.length})</Text>
      <FlatList
        data={historyList}
        keyExtractor={item => item.schedule_id?.toString() || Math.random().toString()}
        renderItem={renderHistoryItem}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={<Text style={styles.emptyText}>No attendance records found.</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  cardAbsent: {
    borderLeftColor: theme.colors.error,
  },
  cardUpcoming: {
    borderLeftColor: theme.colors.primary,
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
  statusValueAbsent: {
     color: theme.colors.error,
  },
  statusValueUpcoming: {
     color: theme.colors.primary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  timeText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  markedAt: {
     ...theme.typography.caption,
     color: theme.colors.textSecondary,
     marginTop: 4,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  }
});
