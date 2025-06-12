import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import Login          from "./components/Auth/Login";
import Register       from "./components/Auth/Register";
import Forgot         from "./components/Auth/ForgotPassword";
import Reset          from "./components/Auth/ResetPassword";
import VotingPage     from "./components/Voting/VotingPage";
import ProfilePage    from "./components/Profile/ProfilePage";
import AdminDashboard from "./components/Admin/AdminDashboard";

/* ---------- guard ---------- */
function Guard({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuth();

  /* not logged in → login page */
  if (!user) return <Navigate to="/" replace />;

  /* admin route but not admin → bounce to /voting */
  if (adminOnly && !isAdmin) return <Navigate to="/voting" replace />;

  /* non-admin route but admin tries to enter → bounce to /admin */
  if (!adminOnly && isAdmin) return <Navigate to="/admin" replace />;

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"           element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/forgot"     element={<Forgot />} />
        <Route path="/reset/:t"   element={<Reset />} />

        <Route
          path="/voting"
          element={<Guard><VotingPage /></Guard>}
        />
        <Route
          path="/profile"
          element={<Guard><ProfilePage /></Guard>}
        />
        <Route
          path="/admin"
          element={<Guard adminOnly><AdminDashboard /></Guard>}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
