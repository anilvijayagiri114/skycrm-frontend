// //Original Header Component
// import { getUserFromToken, clearToken } from '../utils/auth';
// import { useNavigate } from 'react-router-dom';
// import { NavLink } from "react-router-dom";
// import { X, Cog, Briefcase, Users, Target, LogOut } from "lucide-react";

// export default function Header(){
//   const nav = useNavigate()
//   const user = getUserFromToken()
//   const isAdmin = user?.roleName === 'Admin';
//   return (
//     <div className="w-full bg-white border-b sticky top-0 z-10">
//       <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
//         <div className="font-bold text-lg">SkyCRM</div>
//         <div className="flex items-center gap-6">
//           {isAdmin ? (
//             <nav className="flex gap-4">
//               <a href="/admin" className="font-semibold text-gray-800 hover:underline">Admin Dashboard</a>
//               <a href="/manager" className="font-semibold text-green-600 hover:underline">Manager Dashboard</a>
//               <a href="/teamlead" className="font-semibold text-yellow-600 hover:underline">Team Lead Dashboard</a>
//               <a href="/rep" className="font-semibold text-purple-600 hover:underline">Sales Rep Dashboard</a>
//             </nav>
//           ) : (
//             <span className="font-semibold text-base text-gray-700">{user?.name} {user?.roleName}</span>
//           )}
//           {!isAdmin && (
//             <button
//               onClick={() => nav('/change-password')}
//               className="px-3 py-1.5 rounded-lg bg-yellow-600 text-white text-sm"
//             >Change Password</button>
//           )}
//           <button
//             onClick={() => { clearToken(); nav('/login/select'); }}
//             className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm"
//           >Logout</button>
//         </div>
//       </div>
//     </div>
//   )
// }

import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { getUserFromToken, clearToken } from "../utils/auth";
import api from "../services/api";
import handleLogout from "../logoutHandler";
import {
  X,
  Cog,
  Briefcase,
  Users,
  Target,
  LogOut,
  User,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const nav = useNavigate();
  const user = getUserFromToken();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

 

  return (
    <>
      {/* Profile Dropdown in top-right corner */}
      <div
        className="fixed top-0 right-0 p-4 z-30 flex items-center gap-2"
        ref={dropdownRef}
      >
        {/* Theme Toggle Button */}

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-white"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun
              size={20}
              className="transform hover:rotate-45 transition-transform duration-200"
            />
          ) : (
            <Moon
              size={20}
              className="transform hover:-rotate-12 transition-transform duration-200"
            />
          )}
        </button>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <User size={20} className="text-gray-600 dark:text-gray-300" />
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {user?.name}
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-500 transform transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-4 top-16 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 z-50">
            <div className="py-1">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">
                <div className="font-medium">{user?.name}</div>
                <div className="text-gray-500">{user?.roleName}</div>
              </div>
              <button
                onClick={() => {
                  nav("/change-password");
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span className="flex items-center gap-2">
                  <Cog size={16} className="text-gray-500" />
                  Change Password
                </span>
              </button>
              <button
                onClick={()=> handleLogout(nav)}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <span className="flex items-center gap-2">
                  <LogOut size={16} className="text-red-600" />
                  Logout
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-800 text-gray-200 border-r shadow-md transition-all duration-300 z-20 flex flex-col ${
          sidebarOpen ? "w-60" : "w-20"
        }`}
      >
        {/* Toggle Button (Top-left corner, always visible) */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          {sidebarOpen ? (
            <h2 className="text-2xl font-bold text-gray-100">SkyCRM</h2>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-gray-500 font-bold text-2xl p-2"
            >
              ☰
            </button>
          )}

          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-black ml-2"
            >
              <X />
            </button>
          )}
        </div>

        {/* User Info */}
        {user && sidebarOpen && (
          <div className="flex items-center gap-3 px-4 py-4 ">
            <img
              src={user.avatarUrl || "https://via.placeholder.com/40"}
              alt="User"
              className="w-10 h-10 bg-slate-800 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-100">{user.name}</p>
              <p className="text-xs text-gray-200">{user.roleName}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-2 pt-2 flex-1">
          {user?.roleName === "Admin" && (
            <>
              <SidebarLink
                to="/admin"
                label="Admin"
                icon={<Cog className="text-indigo-600" />}
                sidebarOpen={sidebarOpen}
              />
              <SidebarLink
                to="/manager"
                label="Manager"
                icon={<Briefcase className="text-green-600" />}
                sidebarOpen={sidebarOpen}
              />
              <SidebarLink
                to="/teamlead"
                label="Team Lead"
                icon={<Users className="text-yellow-500" />}
                sidebarOpen={sidebarOpen}
              />
              <SidebarLink
                to="/rep"
                label="Sales Rep"
                icon={<Target className="text-blue-600" />}
                sidebarOpen={sidebarOpen}
              />
            </>
          )}
          {user?.roleName === "Manager" && (
            <SidebarLink
              to="/manager"
              label="Manager"
              icon={<Briefcase className="text-green-600" />}
              sidebarOpen={sidebarOpen}
            />
          )}
          {user?.roleName === "TeamLead" && (
            <SidebarLink
              to="/teamlead"
              label="Team Lead"
              icon={<Users className="text-yellow-500" />}
              sidebarOpen={sidebarOpen}
            />
          )}
          {user?.roleName === "SalesRep" && (
            <SidebarLink
              to="/rep"
              label="Sales Rep"
              icon={<Target className="text-blue-600" />}
              sidebarOpen={sidebarOpen}
            />
          )}
        </nav>
      </aside>
    </>
  );
}

function SidebarLink({ to, label, icon, sidebarOpen }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-5 px-3 py-2 text-m rounded-lg transition-colors duration-300
        ${
          isActive
            ? " text-gray-50 font-semibold"
            : "text-gray-400 hover:bg-gray-100 hover:text-black"
        }`
      }
    >
      {icon}
      {sidebarOpen && <span>{label}</span>}
    </NavLink>
  );
}
