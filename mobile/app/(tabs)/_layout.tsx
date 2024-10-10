import React, { useContext } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { AuthContext } from "@/context/AuthContext";

export default function RootLayout() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const isUserLogged = !!user;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.red.brand,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: Colors.red.brand,
        },
      }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="createPost"
        options={{
          headerShown: false,
          // href: {
          //   pathname: "/createPost",
          //   params: {
          //     user: user,
          //   },
          // },
          title: "Create Post",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="plus-circle" color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            if (!isUserLogged) {
              e.preventDefault();
              router.push({
                pathname: "/login",
                params: { user: user },
              });
            }
          },
        })}
      />
      <Tabs.Screen
        name="aiChat"
        options={{
          headerShown: false,
          // href: {
          //   pathname: "/aiChat",
          //   params: {
          //     user: user,
          //   },
          // },
          title: "AiChat",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="comments" color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            if (!isUserLogged) {
              e.preventDefault();
              router.push({
                pathname: "/login",
                params: { user: user },
              });
            }
          },
        })}
      />
      <Tabs.Screen
        name="userProfile"
        options={{
          headerShown: false,
          // href: {
          //   pathname: "/userProfile",
          //   params: {
          //     user: user,
          //   },
          // },
          title: "User Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user-circle" color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            if (!isUserLogged) {
              e.preventDefault();
              router.push({
                pathname: "/login",
                params: { user: user },
              });
            }
          },
        })}
      />
    </Tabs>
  );
}
