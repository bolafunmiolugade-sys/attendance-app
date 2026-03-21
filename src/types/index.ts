export type Role = 'STUDENT' | 'LECTURER';

export interface User {
  id: string | number; // Fallback for backward compatibility if needed
  user_id?: number;
  lecturer_id?: number;
  full_name: string;
  email: string;
  role: Role;
  matric_number?: string;
  level?: string;
  department?: string;
  qualifications?: string;
  created_at?: string;
}

export interface Lecturer extends User {
  role: 'LECTURER';
  lecturer_id: number;
  qualifications: string;
}

export interface Course {
  course_id?: string;
  course_name?: string;
  center_lat?: number;
  center_lon?: number;
  radius_m?: number;
  id?: string; // legacy fallback
  name?: string; // legacy fallback
  code?: string; // legacy fallback
  lecturer_id?: string;
  lecturer_name?: string;
  department?: string;
}

export interface CourseRegistration {
  id: string;
  student_id: string;
  course_id: string;
}

export interface ClassSchedule {
  id: string;
  course_id: string;
  date: string;
  start_time: string;
  end_time: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  attendance_window_minutes: number;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  full_name?: string;
  matric_number?: string;
  department?: string;
  schedule_id: string;
  marked_at: string;
  latitude: number;
  longitude: number;
}

