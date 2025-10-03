import { useState, useEffect } from "react";
import UserDetails from "./UserDetails";
import socket from "../socket";
import api from "../services/api";

export default function UsersTable({ usersData }) {
  const [userInfo, setUserInfo] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [tableData, setTableData] = useState([]);

  // Sync local tableData with usersData prop
  useEffect(() => {
    const handleStatusChange = (updatedUser) => {
      setTableData((prev) =>
        prev.map((u) =>
          u._id === updatedUser._id ? { ...u, ...updatedUser } : u
        )
      );
    };
    socket.on("userStatusChange", handleStatusChange);
    return () => {
      socket.off("userStatusChange", handleStatusChange);
    };
  }, []);

  useEffect(() => {
    setTableData(usersData);
  }, [usersData]);

  const handleUserDetails = (userInfo) => {
    setUserInfo(userInfo);
    setShowUserDetails(true);
  };

  const handleUserUpdated = (updatedUser) => {
    const newData = tableData.map((u) =>
      u._id === updatedUser._id ? updatedUser : u
    );
    setTableData(newData);
  };

  const handleUserDeleted=(deletedUser)=>{
    const newData = tableData.filter((u)=>{
      return u._id !== deletedUser._id
    });
    setTableData(newData);
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Role</th>
              <th className="px-4 py-2 border">Action</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-5 py-2 border">Session</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{user.name}</td>
                <td className="px-4 py-2 border">{user.email}</td>
                <td className="px-4 py-2 border">{user.roleName}</td>
                <td className="px-4 py-2 border text-center">
                  <button
                    className="underline text-blue-600 hover:text-blue-800"
                    onClick={() => handleUserDetails(user)}
                  >
                    View Details
                  </button>
                </td>
                <td className="px-4 py-2 border text-center">
                  <div
                    className={`inline-flex px-3 py-1 rounded text-sm font-medium ${
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </div>
                </td>
                <td className="px-5 py-2 border">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        user.lastLogin && user.lastLogout == null
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></span>

                    {user.lastLogin && user.lastLogout == null ? (
                      <span className="text-gray-700 text-sm">Online</span>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Offline (Last:{" "}
                        {user.lastLogout
                          ? new Date(user.lastLogout).toLocaleString()
                          : "-"}
                        )
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserDetails
        open={showUserDetails}
        user={userInfo}
        onClose={() => setShowUserDetails(false)}
        onUserUpdated={handleUserUpdated} // <-- update table immediately
        onUserDeleted={handleUserDeleted}
      />
    </>
  );
}
