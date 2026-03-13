import { Redirect } from "expo-router";
import { useAuthStore } from "../src/store/authStore";

export default function Index() {
  const { user, isAuthenticated } = useAuthStore();

  // if (!isAuthenticated) {
  //   console.log("user ayyy");
  //   return <Redirect href={"/login"} />;
  // }

  // if (user?.role === "STUDENT") {
  //   return <Redirect href={"/(student)/map" as any} />;
  // }

  // return <Redirect href={"/(lecturer)/dashboard" as any} />;
  // return (
  //   <SafeAreaView>
  //     <View>
  //       <Text>Hello</Text>
  //       <Button title="Login" onPress={() => router.push("/_sitemap")} />
  //     </View>
  //   </SafeAreaView>
  // );

  return <Redirect href={"/login"} />;
}
