import { Routes, Route } from "react-router-dom";
import { AuthProvider, RequireAuth } from "./contexts/AuthContext";
import Login   from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Forgot   from "./components/Auth/ForgotPassword";
import Reset    from "./components/Auth/ResetPassword";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset/:token" element={<Reset />} />

        {/* protected */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />

        <Route path="*" element={<h2 className="text-center mt-20">404</h2>} />
      </Routes>
    </AuthProvider>
  );
}
