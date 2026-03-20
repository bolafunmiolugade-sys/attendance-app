import { theme } from "@/src/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function LecturerLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Feather name="grid" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedules/index"
        options={{
          title: "Class Schedules",
          tabBarLabel: "Schedules",
          tabBarIcon: ({ color }) => (
            <Feather name="calendar" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="courses/index"
        options={{
          title: "My Courses",
          tabBarLabel: "Courses",
          tabBarIcon: ({ color }) => (
            <Feather name="users" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedules/create"
        options={{
          href: null, // Hide from tab bar
          title: "Create Schedule",
        }}
      />
      <Tabs.Screen
        name="schedules/[id]"
        options={{
          href: null, // Hide from tab bar
          title: "Schedule Details",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="courses/[id]/members"
        options={{
          href: null, // Hide from tab bar
          title: "Course Members",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
