import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

import { Screen } from '@/src/components/Screen';
import { Button } from '@/src/components/Button';
import { TextInput } from '@/src/components/TextInput';
import { theme } from '@/src/constants/theme';
import { useAuthStore } from '@/src/store/authStore';
import { useAppStore } from '@/src/store/appStore';

export default function CreateScheduleScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { courses, createSchedule } = useAppStore();

  const myCourses = courses.filter(c => c.lecturer_id === user?.id);
  
  const [selectedCourse, setSelectedCourse] = useState(myCourses[0]?.id || '');
  const [radius, setRadius] = useState('50'); // string for input, parsed to num later
  
  // Maps & Location
  const [mapRegion, setMapRegion] = useState({
     latitude: 37.78825,
     longitude: -122.4324,
     latitudeDelta: 0.01,
     longitudeDelta: 0.01,
  });
  const [pinLocation, setPinLocation] = useState<{latitude: number, longitude: number} | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to set class location easily.');
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
     if (!selectedCourse) {
        Alert.alert("Error", "Please create a course first before scheduling.");
        return;
     }
     if (!pinLocation) {
        Alert.alert("Error", "Please tap on the map to set a location pin.");
        return;
     }

     const radiusNum = parseInt(radius, 10);
     if (isNaN(radiusNum) || radiusNum <= 0) {
        Alert.alert("Error", "Please enter a valid attendance radius.");
        return;
     }

     // Use current date for mock simplify
     const now = new Date();
     // Set start time to now, end time to 2 hours from now
     const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

     createSchedule({
        course_id: selectedCourse,
        date: now.toISOString().split('T')[0], // YYYY-MM-DD
        start_time: now.toISOString(),
        end_time: endTime.toISOString(),
        latitude: pinLocation.latitude,
        longitude: pinLocation.longitude,
        radius_meters: radiusNum,
     });

     Alert.alert("Success", "Schedule created!");
     router.back();
  };

  return (
    <Screen noPadding>
       <View style={styles.topContainer}>
          <Text style={styles.title}>Create Schedule</Text>
          <Text style={styles.subtitle}>Tap the map to set precise location</Text>

          <View style={styles.formRow}>
             <Button 
                title={myCourses.length ? "Course Verified" : "No Courses Avaliable"} 
                variant="outline" 
                disabled 
                onPress={() => {}}
                style={{ flex: 1, marginRight: theme.spacing.sm }} 
             />
             <TextInput 
                label="Radius (m)"
                value={radius}
                onChangeText={setRadius}
                keyboardType="numeric"
                style={{ flex: 0.5, marginBottom: 0 }}
             />
          </View>
       </View>

       <View style={styles.mapContainer}>
          <MapView 
             style={styles.map}
             region={mapRegion}
             onPress={handleMapPress}
          >
             {pinLocation && (
                <React.Fragment>
                   <Marker coordinate={pinLocation} />
                   <Circle 
                      center={pinLocation}
                      radius={parseInt(radius) || 50}
                      fillColor="rgba(79, 70, 229, 0.2)"
                      strokeColor={theme.colors.primary}
                   />
                </React.Fragment>
             )}
          </MapView>
       </View>

       <View style={styles.bottomContainer}>
          <Button title="Save Schedule" onPress={handleSave} />
       </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topContainer: {
     padding: theme.spacing.md,
     backgroundColor: theme.colors.surface,
     zIndex: 10,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 3,
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
  formRow: {
     flexDirection: 'row',
     alignItems: 'flex-end',
     marginBottom: theme.spacing.sm,
  },
  mapContainer: {
     flex: 1,
  },
  map: {
     width: '100%',
     height: '100%',
  },
  bottomContainer: {
     padding: theme.spacing.md,
     backgroundColor: theme.colors.surface,
     borderTopWidth: 1,
     borderTopColor: theme.colors.border,
  }
});
