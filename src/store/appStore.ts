import { create } from 'zustand';
import { Course, CourseRegistration, ClassSchedule, AttendanceRecord } from '../types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  courses: Course[];
  registrations: CourseRegistration[];
  schedules: ClassSchedule[];
  attendance: AttendanceRecord[];

  // Actions
  createCourse: (course: Omit<Course, 'id'>) => void;
  registerCourse: (studentId: string, courseId: string) => void;
  createSchedule: (schedule: Omit<ClassSchedule, 'id'>) => void;
  markAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  
  // Selectors/Queries
  getStudentCourses: (studentId: string) => Course[];
  getLecturerCourses: (lecturerId: string) => Course[];
  getActiveSchedulesForStudent: (studentId: string) => ClassSchedule[];
}

export const useAppStore = create<AppState>((set, get) => ({
  courses: [
    { id: 'c1', name: 'Intro to Computer Science', code: 'CS101', lecturer_id: 'u1' },
    { id: 'c2', name: 'Data Structures', code: 'CS201', lecturer_id: 'u1' }
  ],
  registrations: [],
  schedules: [],
  attendance: [],

  createCourse: (course) => set((state) => ({
    courses: [...state.courses, { ...course, id: uuidv4() }]
  })),

  registerCourse: (studentId, courseId) => set((state) => ({
    registrations: [...state.registrations, { id: uuidv4(), student_id: studentId, course_id: courseId }]
  })),

  createSchedule: (schedule) => set((state) => ({
    schedules: [...state.schedules, { ...schedule, id: uuidv4() }]
  })),

  markAttendance: (record) => set((state) => ({
    attendance: [...state.attendance, { ...record, id: uuidv4() }]
  })),

  getStudentCourses: (studentId) => {
    const state = get();
    const courseIds = state.registrations
      .filter(r => r.student_id === studentId)
      .map(r => r.course_id);
    return state.courses.filter(c => courseIds.includes(c.id));
  },

  getLecturerCourses: (lecturerId) => {
    return get().courses.filter(c => c.lecturer_id === lecturerId);
  },

  getActiveSchedulesForStudent: (studentId) => {
    const state = get();
    const myCourses = state.registrations.filter(r => r.student_id === studentId).map(r => r.course_id);
    // Ideally filter by date/time, returning all for now as mock
    return state.schedules.filter(s => myCourses.includes(s.course_id));
  }
}));
