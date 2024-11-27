import React, { createContext, useState, useEffect } from "react";
import { User } from "../types/User";
import { api } from "../service/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext({
  user: null as User | null,
  logout: () => {},
  setUserLogin: (userData: User) => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const logout = async () => {
    setIsLoading(true);
    setUser(null);
    await AsyncStorage.removeItem("user");
    setIsLoading(false);
  };

  const setUserLogin = async (userData: any) => {
    const userId = userData._id;
    const userResponse = await api({
      method: "GET",
      url: `users/${userId}`,
    });
    setUser(userResponse.data);
    setIsLoading(false);
    await AsyncStorage.setItem("user", JSON.stringify(userResponse.data));
  };

  return (
    <AuthContext.Provider value={{ user, logout, setUserLogin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
