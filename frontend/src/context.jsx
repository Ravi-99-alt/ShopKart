import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("shopkart_user") || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const login = (userData) => {
    setUser(userData || null);
    if (userData) {
      localStorage.setItem("shopkart_user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("shopkart_user");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(localStorage.getItem("access_token")),
      isAdmin: Boolean(user?.is_staff || user?.is_superuser),
      login,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
