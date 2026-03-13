# Attendance App Architecture & Product Specification

## 1. Product Specification

**Goal:** Provide a map-based attendance management system for students and lecturers in a university environment using device GPS. 
**Roles:**
- **Student:** Can view their location, see nearby active classes, and mark attendance when physically within the required radius during the active time window.
- **Lecturer:** Can create, update, and delete class schedules, define attendance windows, view registered students, and monitor attendance logs.

## 2. App Architecture

**Frameworks & Libraries:**
- **Expo & React Native:** For cross-platform mobile app development.
- **Expo Router:** Leveraging file-based routing for navigation (Stack and Tabs).
- **react-native-maps:** For map rendering and displaying markers.
- **expo-location:** For accessing device GPS location.
- **Zustand / Redux Toolkit:** For global state management (e.g., auth state, user role, current location).
- **Axios / Fetch:** For networking/API communication.
- **expo-secure-store:** For secure storage of authentication tokens.

**Navigation Structure:**
- **Auth Stack:** Login, Signup screens.
- **Student Tabs:**
  - Map View (Default) - Shows current location and active classes.
  - Courses - Register for courses and view enrolled courses.
  - History - View attendance history.
  - Profile - Settings and logout.
- **Lecturer Tabs:**
  - Dashboard - Overview of active schedules today.
  - Schedules - Create, update, delete schedules.
  - Courses - View courses and registered students.
  - Profile - Settings and logout.

## 3. User Flows

### Student Flow
1. **Signup/Login:** User selects 'Student' role, enters credentials (email, password, matric number) -> Logs in.
2. **Dashboard/Map:** Approves Location Permissions -> Map displays current GPS location.
3. **Course Registration:** Navigates to Courses -> Selects courses from a list -> Registers.
4. **Mark Attendance:** 
   - Map shows markers for active classes of registered courses.
   - Student taps an active class marker to view details.
   - If within the defined radius and time window, a "Mark Attendance" button becomes enabled.
   - Student taps "Mark Attendance" -> Backend verifies location and time -> Success confirmation.
5. **View History:** Navigates to History tab to see past attendance records.

### Lecturer Flow
1. **Signup/Login:** User selects 'Lecturer' role, enters credentials -> Logs in.
2. **Dashboard:** Views schedule overview for the day.
3. **Manage Schedules:** 
   - Navigates to Schedules -> Taps "Create Schedule".
   - Selects Course, Date, Start Time, End Time.
   - Sets Location (Lat/Lng via Map pin) and Radius (in meters).
   - Saves schedule.
4. **Monitor Attendance:** 
   - Navigates to a specific active/past schedule -> Views list of students who have marked attendance.
5. **Manage Courses:** Views all created courses and lists of registered students.

## 4. Screen Breakdown

### Authentication Screens (Stack)
- `LoginScreen`: Email/Password input, Role selection.
- `RegisterScreen`: Name, Email, Password, Role, Matric Number (for students).

### Student Screens (Tabs & Stacks)
- `(tabs)/map/index`: Main Map screen with active class markers.
- `(tabs)/map/class-details`: Modal or secondary screen for class info & marking attendance.
- `(tabs)/courses/index`: List of available & registered courses.
- `(tabs)/history/index`: List of past attendance logs.
- `(tabs)/profile/index`: User details and logout.

### Lecturer Screens (Tabs & Stacks)
- `(tabs)/dashboard/index`: Today's classes overview.
- `(tabs)/schedules/index`: List of all schedules.
- `(tabs)/schedules/create`: Form to create a new class schedule (includes Map to pick location).
- `(tabs)/schedules/[id]`: Schedule details and attendance logs (who attended).
- `(tabs)/courses/index`: List of lecturer's courses.
- `(tabs)/profile/index`: User details and logout.

## 5. React Native Folder Structure

```text
/
├── app/                      # Expo Router app directory
│   ├── (auth)/               # Auth group (Login, Signup)
│   ├── (student)/            # Student specific tabs & screens
│   ├── (lecturer)/           # Lecturer specific tabs & screens
│   ├── _layout.tsx           # Root layout (handles auth state routing)
│   └── index.tsx             # Entry point (redirects based on role)
├── src/
│   ├── components/           # Reusable UI components (Buttons, Inputs, MapMarkers)
│   ├── hooks/                # Custom React hooks (e.g., useLocation)
│   ├── services/             # API client & endpoint definitions (axios setup)
│   ├── store/                # State management (Zustand stores)
│   ├── utils/                # Helpers (geo distance calculations, date formatting)
│   ├── constants/            # Theme colors, Config, API URLs
│   └── types/                # TypeScript interface definitions
├── assets/                   # Images, fonts, icons
├── app.json                  # Expo config
├── package.json
└── babel.config.js
```

## 6. Database Schema (Relational/SQL Structure)

**Users Table**
- `id` (UUID, Primary Key)
- `role` (Enum: 'STUDENT', 'LECTURER')
- `name` (String)
- `email` (String, Unique)
- `password_hash` (String)
- `matric_number` (String, Nullable, Unique for students)

**Courses Table**
- `id` (UUID, Primary Key)
- `name` (String)
- `code` (String, Unique)
- `lecturer_id` (UUID, Foreign Key -> Users.id)

**CourseRegistrations Table**
- `id` (UUID, Primary Key)
- `student_id` (UUID, Foreign Key -> Users.id)
- `course_id` (UUID, Foreign Key -> Courses.id)

**ClassSchedules Table**
- `id` (UUID, Primary Key)
- `course_id` (UUID, Foreign Key -> Courses.id)
- `date` (Date)
- `start_time` (Timestamp)
- `end_time` (Timestamp)
- `latitude` (Decimal)
- `longitude` (Decimal)
- `radius_meters` (Integer)

**AttendanceRecords Table**
- `id` (UUID, Primary Key)
- `student_id` (UUID, Foreign Key -> Users.id)
- `schedule_id` (UUID, Foreign Key -> ClassSchedules.id)
- `marked_at` (Timestamp)
- `latitude` (Decimal)  // Optional log of where they exactly marked it
- `longitude` (Decimal)

## 7. API Endpoint Design

**Authentication:**
- `POST /api/auth/register` (Register user)
- `POST /api/auth/login` (Login user, returns JWT)
- `GET /api/auth/me` (Get current user profile)

**Courses:**
- `GET /api/courses` (List all courses)
- `POST /api/courses` (Lecturer: Create course)
- `POST /api/courses/:id/register` (Student: Register for course)
- `GET /api/courses/:id/students` (Lecturer: Get registered students for course)

**Schedules:**
- `GET /api/schedules` (List schedules. Lecturer: all created by them. Student: active schedules for their registered courses)
- `POST /api/schedules` (Lecturer: Create schedule)
- `PUT /api/schedules/:id` (Lecturer: Update schedule)
- `DELETE /api/schedules/:id` (Lecturer: Delete schedule)

**Attendance:**
- `POST /api/attendance/mark` (Student: Mark attendance)
  - Payload: `{ schedule_id, latitude, longitude }`
- `GET /api/attendance/history` (Student: Get their attendance history)
- `GET /api/schedules/:id/attendance` (Lecturer: View attendance logs for a specific schedule)

## 8. Map & Geolocation Implementation Approach

1. **Permissions:** Use `expo-location` `requestForegroundPermissionsAsync()`. If essential, also request background permissions, but foreground is usually sufficient for marking attendance during app use.
2. **Current Location tracking:** Use `Location.watchPositionAsync` for real-time tracking while the student is in the Map Tab. Update global state (Zustand) with current `latitude` and `longitude`.
3. **Map Rendering:** Use `<MapView>` from `react-native-maps` centered around the student's current location with `showsUserLocation={true}`.
4. **Markers:** Fetch active `ClassSchedules` for today. Map over them to render `<Marker>` components with coordinates.
5. **Radius circles:** Optionally render a `<Circle>` around the marker with `radius={schedule.radius_meters}` to visually indicate the allowed attendance area.

## 9. Attendance Verification Logic

This logic should be securely verified on the **backend**, although the mobile app can check first to reduce API calls and provide immediate feedback.

**Mobile (Frontend) Pre-check:**
1. Check time window: `CurrentTime >= schedule.start_time` AND `CurrentTime <= schedule.end_time`.
2. Check distance: Use the **Haversine formula** (provided by libraries like `geolib` -> `getDistance(coords1, coords2)`) to ensure the distance between `student_location` and `schedule_location` is `<= schedule.radius_meters`.
3. If valid, enable "Mark Attendance" button.

**Backend Validation (Crucial for Security):**
1. Receives `student_id`, `schedule_id`, `student_latitude`, `student_longitude`.
2. Fetch `schedule` from DB.
3. Validate Time: Verify `ServerCurrentTime` is within `start_time` and `end_time`. (Prevents device time spoofing).
4. Validate Location: Calculate the distance from `student_latitude`/`student_longitude` to `schedule.latitude`/`schedule.longitude`. Verify distance `<= schedule.radius_meters`.
5. Check if `AttendanceRecord` already exists for this student and schedule.
6. If all checks pass, Insert `AttendanceRecord` and return success.
