import { Stack } from "expo-router/stack";
import { AuthProvider } from "@/context/AuthContext";
import { NativeBaseProvider } from "native-base";

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
              headerBackTitleVisible: false,
            }}
          />
          <Stack.Screen
            name="SignUp/signUp"
            options={{
              headerShown: true,
              title: "Cadastro",
              headerBackTitleVisible: false,
            }}
          />
          <Stack.Screen
            name="SignUp/signUpConfirmation"
            options={{
              headerShown: false,
              title: "Selecione seus interesses",
              headerBackTitleVisible: false,
            }}
          />
          <Stack.Screen
            name="video/[videoId]"
            options={{
              headerShown: false,
              title: "Vídeo",
              headerBackTitleVisible: false,
            }}
          />
          <Stack.Screen
            name="user/[userId]"
            options={{
              headerShown: false,
              title: "Vídeo",
              headerBackTitleVisible: false,
            }}
          />
        </Stack>
      </NativeBaseProvider>
    </AuthProvider>
  );
}
