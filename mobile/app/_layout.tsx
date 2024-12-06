import { Stack } from "expo-router/stack";
import { AuthProvider } from "@/context/AuthContext";
import { NativeBaseProvider } from "native-base";
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://97c149138afd51e0bbdf1cd10e811e74@o4508422453657600.ingest.us.sentry.io/4508422455885824",
});

export default function Layout() {
  return (
    <AuthProvider>
      <NativeBaseProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="login"
            options={{
              headerShown: true,
              title: "Login",
              headerBackVisible: false,
            }}
          />
          <Stack.Screen
            name="SignUp/signUp"
            options={{
              headerShown: true,
              title: "Cadastro",
              headerBackVisible: false,
            }}
          />
          <Stack.Screen
            name="SignUp/signUpConfirmation"
            options={{
              headerShown: false,
              title: "Selecione seus interesses",
              headerBackVisible: false,
            }}
          />
          <Stack.Screen
            name="video/[videoId]"
            options={{
              headerShown: false,
              title: "Vídeo",
              headerBackVisible: false,
            }}
          />
          <Stack.Screen
            name="user/[userId]"
            options={{
              headerShown: false,
              title: "Vídeo",
              headerBackVisible: false,
            }}
          />
          <Stack.Screen
            name="EditProfile/editProfile"
            options={{
              headerShown: false,
              title: "Vídeo",
              headerBackVisible: false,
            }}
          />
        </Stack>
      </NativeBaseProvider>
    </AuthProvider>
  );
}
