import { Tabs } from "expo-router";
import React from "react";
import { Image, ImageSourcePropType } from "react-native";

const TabLayout: React.FC = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // ไม่โชว์ชื่อใต้ไอคอน
        tabBarStyle: {
          height: 90,
          backgroundColor: "#fff",
          flexDirection: "row",
          alignItems: "center",   // 👉 จัดให้แนวตั้งอยู่ตรงกลาง header
          justifyContent: "space-between",
          paddingHorizontal: 16,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Image
              source={require("../../assets/tabs/Home.png") as ImageSourcePropType}
              style={{
                width: 28,
                height: 28,
                tintColor: focused ? "#2C32FA" : "#7D848F",
              }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="order"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Image
              source={require("../../assets/tabs/Cart.png") as ImageSourcePropType}
              style={{
                width: 28,
                height: 28,
                tintColor: focused ? "#2C32FA" : "#7D848F",
              }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="post"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Image
              source={require("../../assets/tabs/Add.png") as ImageSourcePropType}
              style={{
                width: 28,
                height: 28,
                tintColor: focused ? "#2C32FA" : "#7D848F",
              }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Image
              source={require("../../assets/tabs/Chat.png") as ImageSourcePropType}
              style={{
                width: 28,
                height: 25,
                tintColor: focused ? "#2C32FA" : "#7D848F",
              }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Image
              source={require("../../assets/tabs/Profile.png") as ImageSourcePropType}
              style={{
                width: 22,
                height: 28,
                tintColor: focused ? "#2C32FA" : "#7D848F",
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
