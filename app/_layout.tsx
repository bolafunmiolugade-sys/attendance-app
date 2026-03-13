import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // const colorScheme = useColorScheme();
  // const [loaded] = useFonts({
  //   SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  // });
  // const { isAuthenticated, user } = useAuthStore();
  // const segments = useSegments();
  // const router = useRouter();

  // useEffect(() => {
  //   if (loaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [loaded]);

  // const [isMounted, setIsMounted] = useState(false);

  // useEffect(() => {
  //   setIsMounted(true);
  // }, []);

  // useEffect(() => {
  //   if (!isMounted) return;

  //   const inAuthGroup = segments[0] === "(auth)";

  //   if (!isAuthenticated && !inAuthGroup) {
  //     // Redirect to the sign-in page.
  //     router.replace("/(auth)/login");
  //   } else if (isAuthenticated) {
  //     // Redirect away from sign-in page to their respective tabs
  //     if (user?.role === "STUDENT" && segments[0] !== "(student)") {
  //       router.replace("/(student)/map" as any);
  //     } else if (user?.role === "LECTURER" && segments[0] !== "(lecturer)") {
  //       router.replace("/(lecturer)/dashboard" as any);
  //     }
  //   }
  // }, [isAuthenticated, segments, user?.role, isMounted]);

  // if (!loaded) {
  //   return null;
  // }

  // useEffect(() => {
  //   console.log("user");
  // }, []);

  return (
    <>
      {/* <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}> */}
      <Stack screenOptions={{ headerShown: false }}>
        {/* <Stack.Screen name="index" /> */}
        <Stack.Screen name="(auth)" />
      </Stack>
      <StatusBar style="auto" />
      {/* </ThemeProvider> */}
    </>
  );
}
