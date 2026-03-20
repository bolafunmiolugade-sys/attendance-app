import { Button } from "@/src/components/Button";
import { Screen } from "@/src/components/Screen";
import { TextInput } from "@/src/components/TextInput";
import { theme } from "@/src/constants/theme";
import { useGetCourses } from "@/src/hooks/useCourseHooks";
import {
  useDeleteSchedule,
  useGetSchedule,
  useGetScheduleAttendance,
  useGetSchedules,
  useUpdateSchedule,
} from "@/src/hooks/useScheduleHooks";
import { useAppStore } from "@/src/store/appStore";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ScheduleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Hooks
  const {
    data: scheduleDetail,
    isLoading: isLoadingDetail,
    refetch: refetchDetail,
    isRefetching: isRefetchingDetail,
  } = useGetSchedule(id);
  const { data: schedulesData, isLoading: isLoadingSchedules } =
    useGetSchedules();
  const {
    data: attendanceData,
    isLoading: isLoadingAttendance,
    refetch: refetchAttendance,
  } = useGetScheduleAttendance(id);
  const { data: coursesData, isLoading: isLoadingCourses } = useGetCourses();

  const updateScheduleMutation = useUpdateSchedule();
  const deleteScheduleMutation = useDeleteSchedule();

  const { attendance: localAttendance } = useAppStore();

  // Local State for Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editRadius, setEditRadius] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editWindow, setEditWindow] = useState("");

  const schedules = schedulesData?.schedules || [];
  // Prefer detail from useGetSchedule, fallback to list
  const schedule =
    scheduleDetail?.schedule || schedules.find((s: any) => String(s.id) === id);

  // Use the comprehensive attendance list from backend as primary source
  const displayAttendees = attendanceData?.attendance || [];

  // Initialize edit fields when entering edit mode or when schedule data loads
  useEffect(() => {
    if (schedule && isEditing) {
      setEditRadius(String(schedule.radius_m || ""));
      setEditWindow(String(schedule.attendance_window_minutes || ""));

      setEditStartTime(
        format(new Date(schedule.class_start_time || schedule.date), "HH:mm"),
      );
      setEditEndTime(
        format(new Date(schedule.class_end_time || schedule.end_time), "HH:mm"),
      );
    }
  }, [schedule, isEditing]);

  const onRefresh = async () => {
    await Promise.all([refetchDetail(), refetchAttendance()]);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Schedule",
      "Are you sure you want to delete this class schedule? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteScheduleMutation.mutateAsync(id);
              Alert.alert("Success", "Schedule deleted successfully.");
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete schedule.");
            }
          },
        },
      ],
    );
  };

  const handleSaveEdit = async () => {
    if (!editRadius || !editStartTime || !editEndTime || !editWindow) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const startTime = new Date(schedule.class_start_time || schedule.date);
      const [sh, sm] = editStartTime.split(":").map(Number);
      startTime.setHours(sh, sm, 0, 0);

      const endTime = new Date(schedule.class_end_time || schedule.end_time);
      const [eh, em] = editEndTime.split(":").map(Number);
      endTime.setHours(eh, em, 0, 0);

      if (endTime <= startTime) {
        Alert.alert("Error", "End time must be after start time.");
        return;
      }

      const radNum = parseInt(editRadius, 10);
      const winNum = parseInt(editWindow, 10);

      if (isNaN(radNum) || isNaN(winNum) || radNum < 0 || winNum < 0) {
        Alert.alert("Error", "Radius and Window must be non-negative numbers.");
        return;
      }

      await updateScheduleMutation.mutateAsync({
        id,
        data: {
          radius_m: radNum,
          class_start_time: startTime.toISOString(),
          class_end_time: endTime.toISOString(),
          attendance_window_minutes: winNum,
        },
      });

      Alert.alert("Success", "Schedule updated successfully.");
      setIsEditing(false);
      refetchDetail();
    } catch (error) {
      Alert.alert("Error", "Failed to update schedule.");
    }
  };

  if (
    (isLoadingSchedules || isLoadingCourses || isLoadingDetail) &&
    !isRefetchingDetail
  ) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!schedule) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <Feather
            name="alert-circle"
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.errorText}>Schedule not found.</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.replace("/schedules")}
          style={{
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.primary,
            borderRadius: 20,
          }}
        >
          <Feather name="arrow-left" size={24} color={theme.colors.surface} />
        </TouchableOpacity>

        <Text
          style={{ fontSize: 20, fontWeight: "bold", color: theme.colors.text }}
        >
          Schedule Details
        </Text>
        <View
          style={{
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
          }}
        ></View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingDetail}
            onRefresh={onRefresh}
          />
        }
      >
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.courseCode}>{schedule.course_code}</Text>
              <Text style={styles.courseName}>{schedule.course_name}</Text>
            </View>
            {!isEditing && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={styles.iconButton}
                >
                  <Feather
                    name="edit-2"
                    size={20}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  style={[styles.iconButton, { marginLeft: 12 }]}
                >
                  <Feather
                    name="trash-2"
                    size={20}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <TextInput
                    label="Start Time (HH:mm)"
                    value={editStartTime}
                    onChangeText={setEditStartTime}
                    placeholder="08:00"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    label="End Time (HH:mm)"
                    value={editEndTime}
                    onChangeText={setEditEndTime}
                    placeholder="10:00"
                  />
                </View>
              </View>
              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <TextInput
                    label="Radius (m)"
                    value={editRadius}
                    onChangeText={setEditRadius}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    label="Window (min)"
                    value={editWindow}
                    onChangeText={setEditWindow}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.editActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setIsEditing(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Save Changes"
                  onPress={handleSaveEdit}
                  loading={updateScheduleMutation.isPending}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>
                    {format(
                      new Date(schedule.class_start_time || schedule.date),
                      "MMM dd, yyyy",
                    )}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>
                    {format(
                      new Date(
                        schedule.class_start_time || schedule.start_time,
                      ),
                      "hh:mm a",
                    )}{" "}
                    -{" "}
                    {format(
                      new Date(schedule.class_end_time || schedule.end_time),
                      "hh:mm a",
                    )}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.detailsGrid,
                  { borderTopWidth: 0, paddingTop: 0, marginTop: 12 },
                ]}
              >
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Radius</Text>
                  <Text style={styles.detailValue}>
                    {schedule.radius_m ? `${schedule.radius_m}m` : "Not Set"}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Attendance Window</Text>
                  <Text style={styles.detailValue}>
                    {schedule.attendance_window_minutes} mins
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Attendance Log ({displayAttendees.length})
          </Text>
          {(isLoadingAttendance || isRefetchingDetail) && (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: 650 }}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeadCell, { width: 40 }]}>#</Text>
              <Text style={[styles.tableHeadCell, { width: 220 }]}>Name</Text>
              <Text style={[styles.tableHeadCell, { width: 150 }]}>
                Matric Number
              </Text>
              <Text style={[styles.tableHeadCell, { width: 140 }]}>
                Department
              </Text>
              <Text style={[styles.tableHeadCell, { width: 100 }]}>Status</Text>
              <Text
                style={[
                  styles.tableHeadCell,
                  { width: 100, textAlign: "right" },
                ]}
              >
                Time
              </Text>
            </View>

            {displayAttendees.length === 0 && !isLoadingAttendance ? (
              <Text style={styles.emptyText}>
                No students have marked attendance yet.
              </Text>
            ) : (
              displayAttendees.map((item: any, index: number) => (
                <View key={item.id || String(index)} style={styles.row}>
                  <Text style={[styles.rowCell, { width: 40 }]}>
                    {index + 1}
                  </Text>
                  <Text
                    style={[styles.rowCell, { width: 220 }]}
                    numberOfLines={1}
                  >
                    {item.full_name ||
                      item.student_name ||
                      item.student_id ||
                      "N/A"}
                  </Text>
                  <Text style={[styles.rowCell, { width: 150 }]}>
                    {item.matric_number || "---"}
                  </Text>
                  <Text style={[styles.rowCell, { width: 140 }]}>
                    {item.department || "---"}
                  </Text>
                  <Text
                    style={[
                      styles.rowCell,
                      {
                        width: 100,
                        color:
                          item.status === "Present"
                            ? theme.colors.success
                            : theme.colors.error,
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                  <Text
                    style={[styles.rowCell, { width: 100, textAlign: "right" }]}
                  >
                    {item.marked_at
                      ? format(new Date(item.marked_at), "hh:mm a")
                      : "---"}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  actionButtons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 8,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
  },
  courseCode: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "700",
    marginBottom: 4,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 700,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  detailsGrid: {
    flexDirection: "row",
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
    marginBottom: 2,
  },
  detailValue: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: "600",
  },
  editForm: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  formRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  editActions: {
    flexDirection: "row",
    marginTop: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
  },
  tableHeadCell: {
    ...theme.typography.caption,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  row: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: "center",
  },
  rowCell: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  studentName: {
    ...theme.typography.bodySmall,
    fontWeight: "600",
    color: theme.colors.text,
  },
  studentSubInfo: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: theme.borderRadius.md,
    borderBottomRightRadius: theme.borderRadius.md,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    ...theme.typography.body,
    color: theme.colors.surface,
    fontWeight: "600",
  },
});
