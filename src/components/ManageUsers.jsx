import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { useState, useEffect } from "react";
import UsersTable from "../components/UsersTable";

const ManageUsers = () => {
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [usersData, setUsersData] = useState([]);

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: async () => (await api.get("/roles")).data,
  });

  useEffect(() => {
    if (!selectedRoleId) return;

    const fetchUsers = async () => {
      try {
        const res = await api.post("/auth/usersByRole", { roleId: selectedRoleId });
        setUsersData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, [selectedRoleId]);

  useEffect(() => {
    if (rolesQuery.data && rolesQuery.data.length > 0 && !selectedRoleId) {
      const adminRole = rolesQuery.data.find((r) => r.name === "Admin");
      setSelectedRoleId(adminRole?._id || rolesQuery.data[0]._id);
    }
  }, [rolesQuery.data]);

  return (
    <div className="flex flex-col items-center bg-gray-50 py-12 space-y-6">
      <h1 className="text-2xl font-bold">Manage Users</h1>

      <div className="bg-white p-4 rounded-2xl shadow w-full max-w-3xl">
        <nav className="flex space-x-4 justify-center">
          {rolesQuery.data?.map((r) => (
            <button
              key={r._id}
              className={`px-4 py-2 rounded-lg transition ${
                selectedRoleId === r._id
                  ? "bg-gray-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedRoleId(r._id)}
            >
              {r.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="w-full max-w-4xl">
        <UsersTable usersData={usersData} />
      </div>
    </div>
  );
};

export default ManageUsers;
