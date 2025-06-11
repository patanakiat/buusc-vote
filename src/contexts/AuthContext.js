import { createContext, useContext, useState, useEffect } from "react";

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  /* USERNAME login – returns true/false for caller messages */
  async function login({ username, password }) {
    /* TODO: replace with real API */
    if (!username || !password) return false;
    const dummy = { name: username };
    setUser(dummy);
    localStorage.setItem("user", JSON.stringify(dummy));
    return true;
  }

  async function register() {
    /* TODO: real API */
    return true;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("user");
  }

  return (
    <AuthCtx.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);

export const RequireAuth = ({ children }) =>
  useAuth().user ? children : (
    <h2 className="text-center mt-20">กรุณาเข้าสู่ระบบ</h2>
  );
