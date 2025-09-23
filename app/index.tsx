/*import { Redirect } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import LoginScreen from "./LoginScreen";

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (isLoggedIn) {
    // ถ้าล็อกอินแล้ว → ไปหน้า Home (tabs)
    return <Redirect href={{ pathname: "/(tabs)" }} />;
  }

  // ยังไม่ล็อกอิน → แสดง LoginScreen
  return (
    <View style={{ flex: 1 }}>
      <LoginScreen onSuccess={() => setIsLoggedIn(true)} />
    </View>
  );
}*/

// app/index.tsx
import { Redirect, Stack } from "expo-router";
import React, { useState } from "react";
import LoginScreen from "./LoginScreen";

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (isLoggedIn) {
    return <Redirect href={{ pathname: "/(tabs)" }} />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LoginScreen onSuccess={() => setIsLoggedIn(true)} />
    </>
  );
}
