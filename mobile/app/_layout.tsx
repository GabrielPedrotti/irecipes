import { Stack } from "expo-router";
import "@fontsource/inter";

export default function RootLayout() {
  return (
    <Stack>
      {/* fisrt scren that opens */}
      <Stack.Screen name="home" />
    </Stack>
  );
}
