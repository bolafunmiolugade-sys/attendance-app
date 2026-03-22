import { Feather, Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";

import { Button } from "@/src/components/Button";
import { Screen } from "@/src/components/Screen";
import { TextInput } from "@/src/components/TextInput";
import { theme } from "@/src/constants/theme";
import { useGetCourses } from "@/src/hooks/useCourseHooks";
import { useCreateSchedule } from "@/src/hooks/useScheduleHooks";

export default function CreateScheduleScreen() {
  const router = useRouter();
  const { data: coursesData, isLoading: isLoadingCourses } = useGetCourses();
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const { mutateAsync: createSchedule } = useCreateSchedule();

  useEffect(() => {
    const courses = coursesData?.courses || [];
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id || courses[0].course_id || "");
    }
  }, [coursesData?.courses, selectedCourseId]);

  const [radius, setRadius] = useState("20");
  const [attendanceWindow, setAttendanceWindow] = useState("15");

  const [startTimeText, setStartTimeText] = useState(
    format(new Date(), "HH:mm"),
  );
  const [endTimeText, setEndTimeText] = useState(
    format(new Date(new Date().getTime() + 2 * 60 * 60 * 1000), "HH:mm"),
  );

  const [isCourseModalVisible, setIsCourseModalVisible] = useState(false);

  // Maps & Location
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [pinLocation, setPinLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Allow location access to set class location easily.",
        );
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setPinLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const handleMapPress = (e: any) => {
    setPinLocation(e.nativeEvent.coordinate);
  };

  const handleSave = () => {
    if (isLoadingCourses) {
      Alert.alert("Please wait", "Courses are still loading.");
      return;
    }

    if (!selectedCourseId) {
      Alert.alert("Error", "Please select a course.");
      return;
    }

    const radiusNum = parseInt(radius, 10);
    if (isNaN(radiusNum) || radiusNum <= 0) {
      Alert.alert("Error", "Please enter a valid attendance radius.");
      return;
    }

    const windowNum = parseInt(attendanceWindow, 10);
    if (isNaN(windowNum) || windowNum <= 0) {
      Alert.alert("Error", "Please enter a valid attendance window.");
      return;
    }

    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59)
        return null;
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    };

    const startTime = parseTime(startTimeText);
    const endTime = parseTime(endTimeText);

    if (!startTime || !endTime) {
      Alert.alert("Error", "Please enter valid times in HH:mm format.");
      return;
    }

    if (endTime <= startTime) {
      Alert.alert("Error", "End time must be after start time.");
      return;
    }

    createSchedule(
      {
        course_id: selectedCourseId,
        lecturer_name: selectedCourse?.lecturer_name,
        location_lat: pinLocation?.latitude || selectedCourse?.center_lat,
        location_long: pinLocation?.longitude || selectedCourse?.center_lon,
        class_start_time: startTime.toISOString(),
        class_end_time: endTime.toISOString(),
        attendance_window_minutes: windowNum,
        radius_m: radiusNum,
      },

      {
        onSuccess: (res) => {
          console.log(res);
          Alert.alert("Success", "Schedule created!");
          router.back();
        },
        onError: (error) => {
          Alert.alert("Error", error.message);
        },
      },
    );
  };

  const selectedCourse = (coursesData?.courses || []).find(
    (c: any) => c.course_id === selectedCourseId,
  );

  return (
    <Screen noPadding>
      <ScrollView
        style={styles.formContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.padding}>
          <Text style={styles.title}>Create Schedule</Text>
          <Text style={styles.subtitle}>
            Fill in the details for your class session |{" "}
            {selectedCourse?.course_name}
          </Text>

          <Text style={styles.label}>Select Course</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setIsCourseModalVisible(true)}
          >
            <Text
              style={
                selectedCourse
                  ? styles.dropdownText
                  : styles.dropdownPlaceholder
              }
            >
              {selectedCourse
                ? `${selectedCourse.course_id} - ${selectedCourse.course_name}`
                : "Select a course"}{" "}
            </Text>
            <Feather
              name="chevron-down"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <TextInput
                label="Start Time (HH:mm)"
                value={startTimeText}
                onChangeText={setStartTimeText}
                placeholder="08:00"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                label="End Time (HH:mm)"
                value={endTimeText}
                onChangeText={setEndTimeText}
                placeholder="10:00"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <TextInput
                label="Radius (meters)"
                value={radius}
                onChangeText={setRadius}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                label="Window (mins)"
                value={attendanceWindow}
                onChangeText={setAttendanceWindow}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Location</Text>
          <Text style={styles.caption}>
            Tap the map to set precise location for this class
          </Text>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={{
              latitude: Number(mapRegion.latitude),
              longitude: Number(mapRegion.longitude),
              latitudeDelta: Number(mapRegion.latitudeDelta) || 0.01,
              longitudeDelta: Number(mapRegion.longitudeDelta) || 0.01,
            }}
            onPress={handleMapPress}
          >
            {/* Active Class Schedules */}
            {isLoadingCourses ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : (
              (coursesData?.courses || []).map((s: any) => {
                const lat = Number(s.center_lat);
                const lon = Number(s.center_lon);
                const circleRadius = Number(s.radius_m);

                // Safety check: skip rendering if coordinates are invalid
                if (
                  isNaN(lat) ||
                  isNaN(lon) ||
                  s.center_lat === null ||
                  s.center_lon === null
                ) {
                  return null;
                }

                return (
                  <React.Fragment key={s.course_id}>
                    <Marker
                      coordinate={{
                        latitude: lat,
                        longitude: lon,
                      }}
                      pinColor="gray"
                    >
                      <Ionicons
                        name="book"
                        size={32}
                        color={theme.colors.primary}
                      />
                    </Marker>
                    <Circle
                      center={{
                        latitude: lat,
                        longitude: lon,
                      }}
                      radius={isNaN(circleRadius) ? 50 : circleRadius}
                      fillColor="rgba(107, 114, 128, 0.1)"
                      strokeColor="rgba(107, 114, 128, 0.3)"
                    />
                  </React.Fragment>
                );
              })
            )}

            {/* Current Pin */}
            {pinLocation &&
              isFinite(Number(pinLocation.latitude)) &&
              isFinite(Number(pinLocation.longitude)) && (
                <React.Fragment>
                  <Marker
                    coordinate={{
                      latitude: Number(pinLocation.latitude),
                      longitude: Number(pinLocation.longitude),
                    }}
                  />
                  <Circle
                    center={{
                      latitude: Number(pinLocation.latitude),
                      longitude: Number(pinLocation.longitude),
                    }}
                    radius={Number(radius) || 50}
                    fillColor="rgba(79, 70, 229, 0.2)"
                    strokeColor={theme.colors.primary}
                  />
                </React.Fragment>
              )}
          </MapView>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Button title="Save Schedule" onPress={handleSave} />
      </View>

      <Modal visible={isCourseModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{"Select Course"}</Text>
              <TouchableOpacity onPress={() => setIsCourseModalVisible(false)}>
                <Feather name="x" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={coursesData?.courses || []}
              keyExtractor={(item, index) => `${index}:${item.course_id}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.courseOption}
                  onPress={() => {
                    console.log(item, "CREATE");
                    setSelectedCourseId(item.course_id);
                    setIsCourseModalVisible(false);
                  }}
                >
                  <Text style={styles.courseCode}>{item.course_id}</Text>
                  <Text style={styles.courseName}>{item.course_name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No courses found. Ask admin to assign courses.
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
  },
  padding: {
    padding: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.bodySmall,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  caption: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  dropdownText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  dropdownPlaceholder: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  row: {
    flexDirection: "row",
    marginBottom: theme.spacing.sm,
  },
  mapContainer: {
    height: 300,
    marginVertical: theme.spacing.md,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  bottomContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  courseOption: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  courseCode: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "700",
    marginBottom: 2,
  },
  courseName: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginVertical: theme.spacing.xl,
  },
});
