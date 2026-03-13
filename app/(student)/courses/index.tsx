import React from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { Button } from '@/src/components/Button';
import { theme } from '@/src/constants/theme';
import { useAppStore } from '@/src/store/appStore';
import { useAuthStore } from '@/src/store/authStore';
import { Course } from '@/src/types';

export default function StudentCoursesScreen() {
  const { user } = useAuthStore();
  const { courses, getStudentCourses, registerCourse } = useAppStore();

  const myCourses = user ? getStudentCourses(user.id) : [];

  const handleRegister = (courseId: string) => {
    if (!user) return;
    const isEnrolled = myCourses.some(c => c.id === courseId);
    if (isEnrolled) {
      Alert.alert('Info', 'You are already registered for this course.');
      return;
    }
    registerCourse(user.id, courseId);
    Alert.alert('Success', 'Registered for course!');
  };

  const renderCourseItem = ({ item }: { item: Course }) => {
     const isEnrolled = myCourses.some(c => c.id === item.id);

     return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.courseCode}>{item.code}</Text>
          <Text style={styles.courseName}>{item.name}</Text>
        </View>
        <Button 
          title={isEnrolled ? "Enrolled" : "Register"} 
          variant={isEnrolled ? "secondary" : "primary"}
          disabled={isEnrolled}
          onPress={() => handleRegister(item.id)}
          style={{ alignSelf: 'center', paddingHorizontal: theme.spacing.lg }}
        />
      </View>
     );
  };

  return (
    <Screen>
      <Text style={styles.sectionTitle}>Available Courses ({courses.length})</Text>
      <FlatList
        data={courses}
        keyExtractor={item => item.id}
        renderItem={renderCourseItem}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        ListEmptyComponent={<Text style={styles.emptyText}>No courses available yet.</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  }
});
