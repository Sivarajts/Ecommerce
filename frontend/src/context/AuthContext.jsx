import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axiosConfig.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // check session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get("/auth/check");
        setUser(res.data.user || null);
      } catch {
        setUser(null);
      } finally {
        setChecking(false);
      }
    };
    checkSession();
  }, []);

  const signup = async (data) => {
    const res = await api.post("/auth/signup", data);
    return res.data;
  };

  const signin = async (data) => {
    const res = await api.post("/auth/login", data);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, checking, signup, signin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
