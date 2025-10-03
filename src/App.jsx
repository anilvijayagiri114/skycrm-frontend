import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import AllLogin from './pages/AllLogin.jsx';
import HomeRouter from './pages/HomeRouter.jsx';
import LeadDetailPage from './pages/LeadDetailPage.jsx';
import React, { useState, createContext } from "react";
import Login from "./components/Login";
import OTPInput from "./components/OTPInput";
import Reset from "./components/Reset";
import Recovered from "./components/Recovered";

export const RecoveryContext = createContext();

import { useLocation } from 'react-router-dom';
function OTPFlow() {
  const location = useLocation();
  const [page, setPage] = useState("login");
  const [email, setEmail] = useState(location.state?.email || "");
  const [role, setRole] = useState(location.state?.role || "");
  const [otp, setOTP] = useState("");
  function NavigateComponents() {
    if (page === "login") return <Login />;
    if (page === "otp") return <OTPInput />;
    if (page === "reset") return <Reset />;
    return <Recovered />;
  }
  return (
    <RecoveryContext.Provider value={{ page, setPage, otp, setOTP, setEmail, email, role, setRole }}>
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <NavigateComponents />
      </div>
    </RecoveryContext.Provider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login/select" element={<AllLogin />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<OTPFlow />} />
      <Route path="/leads/:id" element={<Protected><LeadDetailPage /></Protected>} />
      <Route path="/*" element={<Protected><HomeRouter /></Protected>} />
    </Routes>
  );
}

function Protected({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login/select" replace />;
  return children;
}
