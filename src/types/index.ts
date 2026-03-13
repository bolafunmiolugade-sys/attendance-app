export type Role = 'STUDENT' | 'LECTURER';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  matric_number?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  lecturer_id: string;
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
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  schedule_id: string;
  marked_at: string;
  latitude: number;
  longitude: number;
}
