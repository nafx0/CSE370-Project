import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

// Wrap any page that requires login:
// <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Wait for the /api/auth/me check to finish before deciding anything —
  // otherwise a logged-in user gets bounced to /login on every refresh.
  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}