import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';

import { theme } from '@/src/constants/theme';
import { useAuthStore } from '@/src/store/authStore';
import { useAppStore } from '@/src/store/appStore';
import { useLocationStore } from '@/src/store/locationStore';
import { Button } from '@/src/components/Button';
import { ClassSchedule } from '@/src/types';

export default function StudentMapScreen() {
  const { user } = useAuthStore();
  const { setLocation, setError, latitude: currentLat, longitude: currentLng, errorMsg } = useLocationStore();
  const getActiveSchedulesForStudent = useAppStore(state => state.getActiveSchedulesForStudent);
  const markAttendance = useAppStore(state => state.markAttendance);
  const attendanceLogs = useAppStore(state => state.attendance);

  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }
      
      Location.watchPositionAsync(
         { accuracy: Location.Accuracy.High, distanceInterval: 5 },
         (loc) => setLocation(loc.coords.latitude, loc.coords.longitude)
      );
    })();
  }, []);

  useEffect(() => {
    // Refresh active schedules for student
    if (user) {
      setSchedules(getActiveSchedulesForStudent(user.id));
    }
  }, [user, getActiveSchedulesForStudent]);

  const handleMarkAttendance = () => {
    if (!selectedSchedule || !user || !currentLat || !currentLng) return;

    // Check distance using Haversine formula
    const distance = getDistance(
      { latitude: currentLat, longitude: currentLng },
      { latitude: selectedSchedule.latitude, longitude: selectedSchedule.longitude }
    );

    if (distance > selectedSchedule.radius_meters) {
       Alert.alert("Too Far", `You must be within ${selectedSchedule.radius_meters}m of the class to mark attendance. You are ${distance}m away.`);
       return;
    }

    // Basic time check (ignoring strict timezone issues for mock purposes)
    const now = new Date();
    const startTime = new Date(selectedSchedule.start_time);
    const endTime = new Date(selectedSchedule.end_time);
    
    // Simplification for the demo: just check logic visually unless dates are strictly compared
    // if (now < startTime || now > endTime) {
    //    Alert.alert("Not Active", "Attendance is not currently active for this class.");
    //    return;
    // }

    // Check if already marked
    const alreadyMarked = attendanceLogs.some(
       (log) => log.schedule_id === selectedSchedule.id && log.student_id === user.id
    );

    if (alreadyMarked) {
       Alert.alert("Already Marked", "You have already marked attendance for this session.");
       return;
    }

    markAttendance({
      student_id: user.id,
      schedule_id: selectedSchedule.id,
      marked_at: new Date().toISOString(),
      latitude: currentLat,
      longitude: currentLng
    });

    Alert.alert("Success", "Attendance Marked Successfully!");
    setSelectedSchedule(null);
  };

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
        {Platform.OS === 'web' || Platform.OS === 'windows' ? (
          <View style={[styles.map, styles.mapFallback]}>
            <Text style={styles.fallbackText}>Map is not supported on Web/Windows</Text>
            <Text style={styles.fallbackText}>Testing mock data below:</Text>
            {schedules.map(schedule => (
              <Text key={schedule.id} style={{color: theme.colors.primary, marginVertical: 4}} onPress={() => setSelectedSchedule(schedule)}>
                - Schedule at {schedule.latitude}, {schedule.longitude}
              </Text>
            ))}
          </View>
        ) : (
          <MapView 
            style={styles.map}
            initialRegion={{
              latitude: currentLat,
              longitude: currentLng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
          >
            {schedules.map(schedule => (
              <React.Fragment key={schedule.id}>
                 <Marker
                   coordinate={{ latitude: schedule.latitude, longitude: schedule.longitude }}
                   onPress={() => setSelectedSchedule(schedule)}
                 />
                 <Circle
                   center={{ latitude: schedule.latitude, longitude: schedule.longitude }}
                   radius={schedule.radius_meters}
                   fillColor="rgba(79, 70, 229, 0.2)"
                   strokeColor={theme.colors.primary}
                   strokeWidth={2}
                 />
              </React.Fragment>
            ))}
          </MapView>
        )}

      {selectedSchedule && (
        <View style={styles.bottomSheet}>
          <Text style={styles.sheetTitle}>Class Active</Text>
          <Text style={styles.sheetSubtitle}>
             Distance Allowed: {selectedSchedule.radius_meters} meters
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
    width: '100%',
    height: '100%',
  },
  mapFallback: {
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  fallbackText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  loadingContainer: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
  },
  loadingText: {
     marginTop: theme.spacing.sm,
     ...theme.typography.body,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    shadowColor: '#000',
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
     marginTop: theme.spacing.xs,
  }
});
