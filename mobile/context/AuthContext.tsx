import React, { createContext, useState, useEffect } from "react";
import { User } from "../types/User";
import { api } from "../service/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext({
  user: null as User | null,
  logout: () => {},
  setUserLogin: (userData: User) => {},
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    loadUser();
  }, []);

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("user");
  };

  const setUserLogin = async (userData: any) => {
    const userId = userData._id;
    const userResponse = await api({
      method: "GET",
      url: `users/${userId}`,
    });
    console.log("User:", userResponse);
    setUser(userResponse.data);
    await AsyncStorage.setItem("user", JSON.stringify(userResponse.data));
  };

  return (
    <AuthContext.Provider value={{ user, logout, setUserLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
