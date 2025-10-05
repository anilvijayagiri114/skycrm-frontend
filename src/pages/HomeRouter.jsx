import { Routes, Route, Navigate } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";
import { useState } from "react";
import Header from "../components/Header";
import AdminDashboard from "./dashboards/AdminDashboard.jsx";
import ManagerDashboard from "./dashboards/ManagerDashboard.jsx";
import TeamLeadDashboard from "./dashboards/TeamLeadDashboard.jsx";
import SalesRepDashboard from "./dashboards/SalesRepDashboard.jsx";
import LeadDetailPage from "./LeadDetailPage.jsx";
import RegisterUser from "../components/RegisterUser.jsx";
import ChangePassword from "./ChangePassword.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import ManageUsers from "../components/ManageUsers.jsx";
import ActivityLogs from '../components/ActivityLogs.jsx'

export default function HomeRouter() {
  const user = getUserFromToken();
  const role = user?.roleName;
  const base =
    role === "Admin"
      ? "/admin"
      : role === "Sales Manager"
      ? "/manager"
      : role === "Sales Team Lead"
      ? "/teamlead"
      : "/rep";

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
      {/* Sidebar */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content (shift right when sidebar is open) */}
      <main
        className={`flex-1 transition-all duration-300 p-6 ${
          sidebarOpen ? "ml-60" : "ml-0 md:ml-20"
        }`}
      >
        <div className="max-w-10xl mx-auto text-gray-900 dark:text-gray-100">
          <Routes>
            <Route path="/" element={<Navigate to={base} replace />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/teamlead" element={<TeamLeadDashboard />} />
            <Route path="/rep" element={<SalesRepDashboard />} />
            <Route path="/leads/:id" element={<LeadDetailPage />} />
            <Route path="/registerUser" element={<RegisterUser />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/manageUsers" element={<ManageUsers />} />
            <Route path="/activityLogs" element={<ActivityLogs/>}/>
          </Routes>
        </div>
      </main>
    </div>
  );
}
