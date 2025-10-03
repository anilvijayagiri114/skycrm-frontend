import { Routes, Route, Navigate } from 'react-router-dom'
import { getUserFromToken } from '../utils/auth'
import { useState } from 'react'
import Header from '../components/Header'
import AdminDashboard from './dashboards/AdminDashboard.jsx'
import ManagerDashboard from './dashboards/ManagerDashboard.jsx'
import TeamLeadDashboard from './dashboards/TeamLeadDashboard.jsx'
import SalesRepDashboard from './dashboards/SalesRepDashboard.jsx'
import LeadDetailPage from './LeadDetailPage.jsx'
import RegisterUser from '../components/RegisterUser.jsx'
import ChangePassword from './ChangePassword.jsx'
import ForgotPassword from './ForgotPassword.jsx'
import ManageUsers from '../components/ManageUsers.jsx'


export default function HomeRouter(){
  const user = getUserFromToken()
  const role = user?.roleName
  const base = role === 'Admin' ? '/admin' : role === 'Sales Manager' ? '/manager' : role === 'Sales Team Lead' ? '/teamlead' : '/rep'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
      <div className="max-w-6xl mx-auto p-4 text-gray-900 dark:text-gray-100">
        <Routes>
          <Route path="/" element={<Navigate to={base} replace/>} />
          <Route path="/admin" element={<AdminDashboard/>} />
          <Route path="/manager" element={<ManagerDashboard/>} />
          <Route path="/teamlead" element={<TeamLeadDashboard/>} />
          <Route path="/rep" element={<SalesRepDashboard/>} />
          <Route path="/leads/:id" element={<LeadDetailPage/>} />
          <Route path="/registerUser" element={<RegisterUser/>}/>
          <Route path="/change-password" element={<ChangePassword/>} />
          <Route path="/forgot-password" element={<ForgotPassword/>} />
          <Route path="/manageUsers" element={<ManageUsers/>}/>
        </Routes>
      </div>
    </div>
  )
}
