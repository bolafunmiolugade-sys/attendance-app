import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { Button } from '@/src/components/Button';
import { TextInput } from '@/src/components/TextInput';
import { theme } from '@/src/constants/theme';
import { useAuthStore } from '@/src/store/authStore';
import { useAppStore } from '@/src/store/appStore';

export default function LecturerCoursesScreen() {
  const { user } = useAuthStore();
  const { courses, registrations, createCourse } = useAppStore();

  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');

  const myCourses = courses.filter(c => c.lecturer_id === user?.id);

  const handleCreateCourse = () => {
     if (!newCode || !newName || !user) {
        Alert.alert("Error", "Please enter both course code and name.");
        return;
     }

     createCourse({
        code: newCode.toUpperCase(),
        name: newName,
        lecturer_id: user.id
     });

     setNewCode('');
     setNewName('');
     Alert.alert("Success", "Course created successfully!");
  };

  const renderCourseItem = ({ item }: { item: any }) => {
     const studentCount = registrations.filter(r => r.course_id === item.id).length;

     return (
        <View style={styles.card}>
           <View style={styles.cardContent}>
              <Text style={styles.courseCode}>{item.code}</Text>
              <Text style={styles.courseName}>{item.name}</Text>
           </View>
           <View style={styles.badge}>
              <Text style={styles.badgeText}>{studentCount} Students</Text>
           </View>
        </View>
     );
  };

  return (
    <Screen>
      <View style={styles.createSection}>
         <Text style={styles.sectionTitle}>Add New Course</Text>
         <View style={styles.formRow}>
            <TextInput 
               label="Code"
               placeholder="CS101"
               value={newCode}
               onChangeText={setNewCode}
               style={{ flex: 1, marginRight: theme.spacing.sm, marginBottom: 0 }}
               autoCapitalize="characters"
            />
            <TextInput 
               label="Course Name"
               placeholder="Intro to CS"
               value={newName}
               onChangeText={setNewName}
               style={{ flex: 2, marginBottom: 0 }}
            />
         </View>
         <Button 
            title="Create Course" 
            onPress={handleCreateCourse} 
            style={{ marginTop: theme.spacing.md }}
         />
      </View>

      <Text style={styles.sectionTitle}>My Courses ({myCourses.length})</Text>
      <FlatList
         data={myCourses}
         keyExtractor={item => item.id}
         renderItem={renderCourseItem}
         contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
         ListEmptyComponent={<Text style={styles.emptyText}>You haven&apos;t created any courses yet.</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  createSection: {
     backgroundColor: theme.colors.surface,
     padding: theme.spacing.md,
     borderRadius: theme.borderRadius.md,
     marginBottom: theme.spacing.xl,
     borderWidth: 1,
     borderColor: theme.colors.border,
  },
  sectionTitle: {
     ...theme.typography.h3,
     color: theme.colors.text,
     marginBottom: theme.spacing.md,
  },
  formRow: {
     flexDirection: 'row',
  },
  card: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-between',
     backgroundColor: theme.colors.surface,
     padding: theme.spacing.md,
     borderRadius: theme.borderRadius.md,
     marginBottom: theme.spacing.md,
     borderWidth: 1,
     borderColor: theme.colors.border,
  },
  cardContent: {
     flex: 1,
  },
  courseCode: {
     ...theme.typography.caption,
     color: theme.colors.primary,
     fontWeight: '700',
     marginBottom: 4,
  },
  courseName: {
     ...theme.typography.body,
     color: theme.colors.text,
     fontWeight: '600',
  },
  badge: {
     backgroundColor: theme.colors.background,
     paddingHorizontal: theme.spacing.md,
     paddingVertical: 6,
     borderRadius: theme.borderRadius.full,
  },
  badgeText: {
     ...theme.typography.caption,
     color: theme.colors.textSecondary,
     fontWeight: '600',
  },
  emptyText: {
     ...theme.typography.body,
     color: theme.colors.textSecondary,
     textAlign: 'center',
     marginTop: theme.spacing.lg,
  }
});
