import { useState } from "react";
import { AuthContext } from "./AuthContext";
import axiosClient from "../api/axiosClient";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken");
  });

  const [refreshToken, setRefreshToken] = useState(() => {
    return localStorage.getItem("refreshToken");
  });

  const login = async (email, password) => {
    const loginItems = await axiosClient.post("/auth/login", {
      email,
      password,
    });
    setUser(loginItems.data.user);
    localStorage.setItem("user", JSON.stringify(loginItems.data.user));
    setAccessToken(loginItems.data.accessToken);
    localStorage.setItem("accessToken", loginItems.data.accessToken);
    setRefreshToken(loginItems.data.refreshToken);
    localStorage.setItem("refreshToken", loginItems.data.refreshToken);
  };

  const register = async (name, email, password, role) => {
    const registerItems = await axiosClient.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    setUser(registerItems.data.user);
    localStorage.setItem("user", JSON.stringify(registerItems.data.user));
    setAccessToken(registerItems.data.accessToken);
    localStorage.setItem("accessToken", registerItems.data.accessToken);
    setRefreshToken(registerItems.data.refreshToken);
    localStorage.setItem("refreshToken", registerItems.data.refreshToken);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    setRefreshToken(null);
    localStorage.removeItem("refreshToken");
  };

  const refreshAccessToken = async () => {
    const loginItems = await axiosClient.post("/auth/refresh", {
      refreshToken
    });
    setAccessToken(loginItems.data.accessToken);
    localStorage.setItem("accessToken", loginItems.data.accessToken);
   
  };
  const value = {
    user,
    accessToken,
    refreshToken,
    login,
    register,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
