# Implementation Plan: Generating React Query Hooks

This plan outlines the creation of React Query hooks (`useQuery` and `useMutation`) for all backend API routes identified in [C:\Users\USER 1\Desktop\backend\routes\api.js](file:///Users/USER%201/Desktop/backend/routes/api.js).

## Proposed Changes

We will create modular hook files inside `c:\Users\USER 1\Desktop\attendance-app\src\hooks\`. All API calls will use the existing `axiosInstance` from `src/services/axioInstance.ts`.

### Hooks Creation
#### [NEW] [useAuthHooks.ts](file:///c:/Users/USER%201/Desktop/attendance-app/src/hooks/useAuthHooks.ts)
- **Student Auth**: `useRegister`, `useLogin`, `useForgotPassword`, `useResetPassword`
- **Lecturer Auth**: `useLecturerRegister`, `useLecturerLogin`, `useLecturerForgotPassword`, `useLecturerResetPassword`
- **Admin Auth**: `useAdminLogin`

#### [NEW] [useAttendanceHooks.ts](file:///c:/Users/USER%201/Desktop/attendance-app/src/hooks/useAttendanceHooks.ts)
- `useMarkAttendance` (POST `/api/mark-attendance`)

#### [NEW] [useScheduleHooks.ts](file:///c:/Users/USER%201/Desktop/attendance-app/src/hooks/useScheduleHooks.ts)
- `useGetSchedules` (GET `/api/classes/schedules`)
- `useCreateSchedule` (POST `/api/classes/schedule`)
- `useUpdateAttendanceWindow` (PATCH `/api/classes/schedule/:id/attendance-window`)
- `useUpdateSchedule` (PUT `/api/classes/schedule/:id`)

#### [NEW] [useCourseHooks.ts](file:///c:/Users/USER%201/Desktop/attendance-app/src/hooks/useCourseHooks.ts)
- `useGetCourses` (GET `/api/courses`)
- `useGetCourse` (GET `/api/courses/:id`)
- `useGetCourseByCode` (GET `/api/courses/code/:course_code`)
- `useCreateCourse` (POST `/api/courses`)
- `useUpdateCourse` (PUT `/api/courses/:id`)
- `useDeleteCourse` (DELETE `/api/courses/:id`)

#### [NEW] [useUserCourseHooks.ts](file:///c:/Users/USER%201/Desktop/attendance-app/src/hooks/useUserCourseHooks.ts)
- `useRegisterCourses` (POST `/api/register-courses`)
- `useGetMyCourses` (GET `/api/my-courses`)

#### [MODIFY] [task.md](file:///C:/Users/USER%201/.gemini/antigravity/brain/f50c155a-c74d-416d-8d5d-f02511696ac8/task.md)
Update task progress based on findings.

## Verification Plan

### Automated Tests
- Currently, there are no specific frontend unit tests defined. Type-checking via `npx tsc --noEmit` will ensure the hooks are written with correct TypeScript syntax and utilize the correct exports from `axioInstance.ts` and `types/index.ts`.

### Manual Verification
- The user can import these newly created hooks inside any component/screen to verify that `@tanstack/react-query` triggers the network requests to `/api/...` as expected.
