import { createContext, useContext, useEffect, useState } from "react";
import { getMe, login as loginApi, logout as logoutApi, signup as signupApi } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check /api/auth/me on load

  // On first load, check if a session cookie already has us logged in
  useEffect(() => {
    getMe()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await loginApi(email, password); // throws on 401, let the caller catch it
    setUser(data);
    return data;
  }

  async function signup(payload) {
    const data = await signupApi(payload); // throws on 400 (duplicate email), let caller catch it
    return data;
  }

  async function logout() {
    await logoutApi();
    setUser(null);
  }

  const value = { user, loading, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}