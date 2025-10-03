
import { useQuery } from "@tanstack/react-query";
import { Users, Target, Briefcase, Clock, UserPlus } from "lucide-react";
import api from "../../services/api";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const users = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await api.get("/auth/users")).data,
  });
  const leads = useQuery({
    queryKey: ["leads"],
    queryFn: async () => (await api.get("/leads")).data,
  });
  const teams = useQuery({
    queryKey: ["teams"],
    queryFn: async () => (await api.get("/team")).data,
  });

const stats = [
    {
      title: "Total Users",
      value: users.data?.length || 0,
      icon: <Users className="w-6 h-6 text-indigo-600" />,
    },
    {
      title: "Total Leads",
      value: leads.data?.length || 0,
      icon: <Target className="w-6 h-6 text-green-600" />,
    },
    {
      title: "Active Teams",
      value: teams.data?.length || 0,
      icon: <Briefcase className="w-6 h-6 text-yellow-600" />,
    },
    {
      title: "Pending Leads",
      value: leads.data?.filter((l) => l.status?.name === "New").length || 0,
      icon: <Clock className="w-6 h-6 text-red-600" />,
    },
  ];

//   return (
//     <div>
//       {/* Top Navbar */}
//       <nav
//         style={{
//           display: "flex",
//           gap: 20,
//           padding: "16px 0",
//           borderBottom: "1px solid #eee",
//           marginBottom: 24,
//           justifyContent: "space-between",
//         }}
//       >
//         {/* <div style={{ display: "flex", gap: "20px" }}>
//           <Link to="/admin" style={{ fontWeight: "bold", color: "#1e293b" }}>
//             Admin Dashboard
//           </Link>
//           <Link to="/manager" style={{ fontWeight: "bold", color: "#10b981" }}>
//             Manager Dashboard
//           </Link>
//           <Link to="/teamlead" style={{ fontWeight: "bold", color: "#f59e0b" }}>
//             Team Lead Dashboard
//           </Link>
//           <Link to="/rep" style={{ fontWeight: "bold", color: "#2563eb" }}>
//             Sales Rep Dashboard
//           </Link>
//         </div> */}
//         <div style={{ display: "flex", gap: "20px" }}>
//           <Link
//             to="/manageUsers"
//             style={{ fontWeight: "bold", color: "#c1097aff" }}
//           >
//             Manage Users
//           </Link>
//           <Link
//             to="/registerUser"
//             style={{ fontWeight: "bold", color: "#6b21a8" }}
//           >
//             Register New User
//           </Link>
//         </div>
//       </nav>
//       <div className="grid gap-4 md:grid-cols-2">
//         <Card title="Users">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="text-left">
//                 <th>Name</th>
//                 <th>Email</th>
//                 <th>Role</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.data?.map((u) => (
//                 <tr
//                   key={u._id}
//                   className={`${
//                     u.status === "inactive"
//                       ? "bg-gray-100 text-gray-500" // inactive rows styled gray
//                       : "" // active rows just have hover effect
//                   }`}
//                 >
//                   <td>{u.name}</td>
//                   <td>{u.email}</td>
//                   <td>{u.roleName}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </Card>
//         <Card title="Teams">
//           <ul className="text-sm space-y-1">
//             {teams.data?.map((t) => (
//               <li key={t._id}>
//                 {t.name} — Lead: {t.lead?.name || "-"} · Members: {" "}
//                 {t.members?.length || 0}
//               </li>
//             ))}
//           </ul>
//         </Card>
//         <Card title="All Leads">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="text-left">
//                 <th>Name</th>
//                 <th>Phone</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {leads.data?.map((l) => (
//                 <tr key={l._id}>
//                   <td>
//                     <Link className="text-blue-600" to={`/leads/${l._id}`}>
//                       {l.name}
//                     </Link>
//                   </td>
//                   <td>{l.phone}</td>
//                   <td>
//                     <StatusBadge name={l.status?.name} />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </Card>
//       </div>
//     </div>
//   );
// }
return (
   
    <div className="min-h-screen bg-gray-100 w-full p-6 overflow-x-hidden">

      {/* Dashboard Header */}
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-gray-500">Overview of users, leads, and teams.</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/manageUsers"
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition"
            >
              <Users className="w-5 h-5 mr-2" />
              Manage Users
            </Link>
            <Link
              to="/registerUser"
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Register New User
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-lg shadow p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
            </div>
            <div className="bg-gray-100 p-2 rounded-full">{stat.icon}</div>
          </div>
        ))}
      </section>

     

      {/* Content Grids */}
      <section className="grid gap-6 lg:grid-cols-3 mb-10">
        {/* Users Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.data?.map((u) => (
                  <tr 
                    key={u._id}
                    className={u.status === "inactive" ? "bg-gray-50" : ""}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">{u.name}</td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-gray-600">{u.roleName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          u.status === "inactive"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {u.status === "inactive" ? "Inactive" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teams List */}
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Teams</h2>
          <ul className="space-y-3">
            {teams.data?.map((team) => (
              <li
                key={team._id}
                className="bg-gray-50 px-4 py-3 rounded flex justify-between items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-700">{team.name}</p>
                  <p className="text-xs text-gray-500">Lead: {team.lead?.name || "N/A"}</p>
                </div>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                  {team.members?.length || 0} Members
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* All Leads Table */}
      <section className="bg-white p-5 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">All Leads</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.data?.map((lead) => (
                <tr key={lead._id}>
                  <td className="px-6 py-4 text-blue-600 hover:underline">
                    <Link to={`/leads/${lead._id}`}>{lead.name}</Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{lead.phone}</td>
                  <td className="px-6 py-4">
                    <StatusBadge name={lead.status?.name} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/leads/${lead._id}/edit`}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
    
  );
}
