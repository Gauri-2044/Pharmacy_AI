import { BrowserRouter, Routes, Route } from "react-router-dom";

// User Pages
import LandingPage from "./pages/User/LandingPage";
import Login from "./pages/User/Login";
import Register from "./pages/User/Register";
import UserDashboard from "./pages/User/UserDashboard";
import ChatPage from "./pages/User/ChatPage";
import HistoryPage from "./pages/User/HistoryPage";
import ProfilePage from "./pages/User/ProfilePage";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import MedicineManagement from "./pages/Admin/MedicineManagement";
import AgentTracking from "./pages/Admin/AgentTracking";

// Layouts, Guards & Providers
import UserLayout from "./components/layouts/UserLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ToastProvider } from "./components/common/Toast";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>

          {/* ================= PUBLIC USER ROUTES ================= */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Authenticated User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* ================= CHATBOT PAGE (AUTHENTICATED ONLY, NO NAVBAR) ================= */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* ================= ADMIN ROUTES ================= */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="medicines" element={<MedicineManagement />} />
            <Route path="tracking" element={<AgentTracking />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
