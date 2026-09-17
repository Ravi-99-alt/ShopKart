import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );

  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refresh_token")
  );

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAccessToken = localStorage.getItem("access_token");
    const savedRefreshToken = localStorage.getItem("refresh_token");

    if (savedAccessToken) {
      setAccessToken(savedAccessToken);
    }

    if (savedRefreshToken) {
      setRefreshToken(savedRefreshToken);
    }

    setLoading(false);
  }, []);

  const login = (access, refresh, userData = null) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    setAccessToken(access);
    setRefreshToken(refresh);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(accessToken);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        user,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;