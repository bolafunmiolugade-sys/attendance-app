import { Redirect } from "expo-router";
import { useAuthStore } from "../src/store/authStore";

export default function Index() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href={"/(auth)/login" as any} />;
  }

  if (user?.role === "STUDENT") {
    return <Redirect href={"/(student)/map" as any} />;
  }

  if (user?.role === "LECTURER") {
    return <Redirect href={"/(lecturer)/dashboard" as any} />;
  }

  return <Redirect href={"/(auth)/login" as any} />;
}
