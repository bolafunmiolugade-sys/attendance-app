import * as Location from "expo-location";
import { getDistance } from "geolib";
import React, { useEffect, useState } from "react";
import { isValid } from "date-fns";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";

import { Button } from "@/src/components/Button";
import { theme } from "@/src/constants/theme";
import { useMarkAttendance } from "@/src/hooks/useAttendanceHooks";
import { useGetSchedules } from "@/src/hooks/useScheduleHooks";
import { useAppStore } from "@/src/store/appStore";
import { useAuthStore } from "@/src/store/authStore";
import { useLocationStore } from "@/src/store/locationStore";
import { Ionicons } from "@expo/vector-icons";

export default function StudentMapScreen() {
  const { user } = useAuthStore();
  const {
    setLocation,
    setError,
    latitude: currentLat,
    longitude: currentLng,
    accuracy: currentAccuracy,
  } = useLocationStore();

  const { mutateAsync: markAttendanceMutation } = useMarkAttendance();
  const attendanceLogs = useAppStore((state) => state.attendance);
  const markAttendanceLocal = useAppStore((state) => state.markAttendance);

  const {
    data: schedulesData,
    isLoading: isLoadingSchedules,
    isError: isErrorSchedules,
    refetch: refetchSchedules,
  } = useGetSchedules();

  const now = new Date();
  const schedules = (schedulesData?.schedules || [])
    .filter((s: any) => {
      const endTimeStr = s.class_end_time || s.end_time;
      if (!endTimeStr) return false;
      const endTime = new Date(endTimeStr);
      return isValid(endTime) && endTime > now;
    });

  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          return;
        }

        Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5 },
          (loc) =>
            setLocation(
              loc.coords.latitude,
              loc.coords.longitude,
              loc.coords.accuracy || 0,
            ),
        );
      } catch (e) {
        console.error("Location permission error:", e);
        setError("Failed to initialize location tracking");
      }
    })();
  }, [setError, setLocation]);

  const handleMarkAttendance = async () => {
    if (!selectedSchedule || !user || !currentLat || !currentLng) {
      Alert.alert("Error", "Missing required information (location/user/schedule).");
      return;
    }

    const scheduleLat = selectedSchedule.location_lat || selectedSchedule.latitude;
    const scheduleLng = selectedSchedule.location_long || selectedSchedule.longitude;
    const radiusMeters = selectedSchedule.radius_meters || selectedSchedule.radius_m || 50;

    if (!scheduleLat || !scheduleLng) {
      Alert.alert("Error", "Schedule has no valid coordinates.");
      return;
    }

    // Check distance using Haversine formula
    const distance = getDistance(
      { latitude: currentLat, longitude: currentLng },
      {
        latitude: scheduleLat,
        longitude: scheduleLng,
      },
    );

    if (distance > radiusMeters) {
      Alert.alert(
        "Too Far",
        `You must be within ${radiusMeters} meters of the class to mark attendance. You are ${distance} meters away.`,
      );
      return;
    }

    // Check if already marked
    const alreadyMarked = (attendanceLogs || []).some(
      (log) =>
        log.schedule_id === selectedSchedule.id && log.student_id === user.id,
    );

    if (alreadyMarked) {
      Alert.alert(
        "Already Marked",
        "You have already marked attendance for this session.",
      );
      return;
    }

    try {
      await markAttendanceMutation({
        course_code: selectedSchedule.course_code || "N/A",
        device_uuid: user.id,
        latitude: currentLat,
        longitude: currentLng,
        accuracy: currentAccuracy || 10,
        is_mock_location_enabled: false,
        schedule_id: selectedSchedule.id,
      });

      // Also update local store for immediate UI feedback in history
      markAttendanceLocal({
        student_id: user.id as string,
        full_name: user.full_name || "Student",
        matric_number: user.matric_number || "N/A",
        department: user.department || "N/A",
        schedule_id: selectedSchedule.id,
        marked_at: new Date().toISOString(),
        latitude: currentLat,
        longitude: currentLng,
      });


      Alert.alert("Success", "Attendance Marked Successfully!");
      setSelectedSchedule(null);
      refetchSchedules();
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message || error.message || "Failed to mark attendance";
      console.log("Mark Attendance Error:", apiMessage);
      Alert.alert("Error", apiMessage);
    }
  };

  if (isLoadingSchedules) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading scheduled classes...</Text>
      </View>
    );
  }

  if (isErrorSchedules) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load schedules.</Text>
        <Button title="Retry" onPress={() => refetchSchedules()} />
      </View>
    );
  }

  if (!currentLat || !currentLng) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Locating you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === "web" || Platform.OS === "windows" ? (
        <View style={[styles.map, styles.mapFallback]}>
          <Text style={styles.fallbackText}>
            Map is not supported on Web/Windows
          </Text>
          <Text style={styles.fallbackText}>Testing mock data below:</Text>
          {schedules?.map((schedule: any) => (
            <Text
              key={schedule.id}
              style={{ color: theme.colors.primary, marginVertical: 4 }}
              onPress={() => setSelectedSchedule(schedule)}
            >
              - Schedule at {schedule.center_lat}, {schedule.center_lon}
            </Text>
          ))}
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLat,
            longitude: currentLng,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
          showsUserLocation={true}
        >
          {schedules?.map((schedule: any) => {
            console.log("schedule", schedule);
            return (
              <React.Fragment key={schedule.id}>
                <Marker
                  coordinate={{
                    latitude: schedule.location_lat,
                    longitude: schedule.location_long,
                  }}
                  onPress={() => setSelectedSchedule(schedule)}
                >
                  <Ionicons
                    name="book"
                    size={32}
                    color={theme.colors.primary}
                  />
                  <Text>{schedule.course_code}</Text>
                </Marker>
                <Circle
                  center={{
                    latitude: schedule.location_lat,
                    longitude: schedule.location_long,
                  }}
                  radius={schedule.radius_meters}
                  fillColor="rgba(79, 70, 229, 0.2)"
                  strokeColor={theme.colors.primary}
                  strokeWidth={2}
                />
              </React.Fragment>
            );
          })}
        </MapView>
      )}

      {selectedSchedule && (
        <View style={styles.bottomSheet}>
          <Text style={styles.sheetTitle}>Class Active</Text>
          <Text style={styles.courseHeader}>
            {selectedSchedule.course_code} - {selectedSchedule.course_name}
          </Text>
          <Text style={styles.sheetSubtitle}>
            Radius: {selectedSchedule.radius_m ? `${selectedSchedule.radius_m}m` : 'N/A'}
          </Text>


          <Button
            title="Mark Attendance"
            onPress={handleMarkAttendance}
            style={{ marginTop: theme.spacing.md }}
          />
          <Button
            title="Dismiss"
            variant="outline"
            onPress={() => setSelectedSchedule(null)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapFallback: {
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  fallbackText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    ...theme.typography.body,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error || "#ef4444",
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sheetTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  sheetSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  courseHeader: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
  },

});
