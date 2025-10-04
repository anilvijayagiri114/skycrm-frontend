import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/Card";
import LeadTable from "../../components/LeadTable";
import handleLogout from "../../logoutHandler";

export default function TeamLeadDashboard() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    source: "",
  });
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch team info for Team Members tab
  const teams = useQuery({
    queryKey: ["teams"],
    queryFn: async () => (await api.get("/team")).data,
  });
  // Fetch leads and statuses for Data tab
  const leadsQuery = useQuery({
    queryKey: ["leads", filter],
    queryFn: async () => {
      const params = filter ? { status: filter } : {};
      const { data } = await api.get("/leads", { params });
      return data;
    },
    refetchInterval: 5000,
  });
  const myTeamQuery = useQuery({
    queryKey: ["myTeam"],
    queryFn: async () => {
      try {
        // Get user role from token
        const user = JSON.parse(localStorage.getItem("user"));
        const isAdmin = user?.roleName === "Admin";

        // If admin, add teamId as query parameter (you can get this from URL or state)
        const endpoint = "/team/my-team" + (isAdmin ? "?viewAll=true" : "");
        const response = await api.get(endpoint);
        return response.data;
      } catch (error) {
        console.error("Error fetching team data:", error);
        throw new Error(
          error.response?.data?.message || "Failed to fetch team data"
        );
      }
    },
    retry: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("My Team Data:", myTeamQuery.data);

  const statusesQuery = useQuery({
    queryKey: ["statuses"],
    queryFn: async () => (await api.get("/statuses")).data,
  });
  const deleteLead = useMutation({
    mutationFn: async (id) => await api.delete(`/leads/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
  const onOpen = (lead) => nav(`/leads/${lead._id}`);
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      deleteLead.mutate(id);
    }
  };
  const statusMutation = useMutation({
    mutationFn: async (payload) =>
      (
        await api.post(`/leads/${payload.id}/status`, {
          statusName: payload.statusName,
        })
      ).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });
  const handleStatusChange = (id, statusName) => {
    statusMutation.mutate({ id, statusName });
  };

  return (
    <div className="min-h-screen  w-full p-6 overflow-x-hidden">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        Team Lead Dashboard
      </h1>
      <h2 style={{ color: "gray", fontWeight: "normal", fontSize: "1.2rem" }}>
        Team Analytics
      </h2>
      <aside
        style={{
          width: "100%",
          borderBottom: "1px solid #eee",
          padding: "12px 16px",
          display: "flex",
          gap: 16,
          overflowX: "auto",
          alignItems: "center",
        }}
      >
        {[
          { tab: "home", label: "Home", color: "#2563eb" },
          { tab: "team", label: "Team Members", color: "#10b981" },
          { tab: "data", label: "Data Table", color: "#f59e0b" },
          { tab: "follow-up", label: "Follow Up List", color: "#4709abff" },
          { tab: "logout", label: "Logout", color: "#dc2626" },
        ].map((btn) => (
          <button
            key={btn.tab}
            onClick={() =>
              btn.tab === "logout" ? handleLogout(nav) : setActiveTab(btn.tab)
            }
            style={{
              flexShrink: 0,
              minWidth: 140,
              fontWeight: activeTab === btn.tab ? "600" : "normal",
              color: btn.color,
              background: activeTab === btn.tab ? "#e0e7ef" : "transparent",
              border: "none",
              fontSize: 16,
              cursor: "pointer",
              borderRadius: 8,
              padding: "8px 20px",
              transition: "background 0.2s",
              boxShadow:
                activeTab === btn.tab ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#e0e7ef")}
            onMouseOut={(e) =>
              (e.currentTarget.style.background =
                activeTab === btn.tab ? "#e0e7ef" : "transparent")
            }
          >
            {btn.label}
          </button>
        ))}
      </aside>

      {/* ===== Main Content ===== */}
      <main style={{ flex: 1, padding: "20px" }}>
        {activeTab === "home" && (
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden w-full max-w-xl mx-auto">
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              {myTeamQuery.isLoading && (
                <p className="text-gray-500 dark:text-gray-300">
                  Loading team summary...
                </p>
              )}
              {myTeamQuery.isError && (
                <p className="text-red-600 dark:text-red-400">
                  Error loading team data.
                </p>
              )}

              {myTeamQuery.data && (
                <>
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {myTeamQuery.data.name} Dashboard
                    </h2>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300">
                      Manager: {myTeamQuery.data.manager?.name || "N/A"}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-xl text-center flex flex-col items-center justify-center shadow-sm hover:scale-105 transform transition duration-300">
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {myTeamQuery.data.members?.length || 0}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                        Total Members
                      </span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-xl text-center flex flex-col items-center justify-center shadow-sm hover:scale-105 transform transition duration-300">
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {myTeamQuery.data.leadsAssigned?.length || 0}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                        Assigned Leads
                      </span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-xl text-center flex flex-col items-center justify-center shadow-sm hover:scale-105 transform transition duration-300">
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {/* Placeholder for future stats */}
                        75%
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                        Performance
                      </span>
                    </div>
                  </div>

                  {/* Footer / Charts placeholder */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-500 dark:text-gray-400 text-center">
                    Show charts, stats, and summary here.
                  </div>
                </>
              )}
            </div>
          </Card>
        )}

        {activeTab === "team" && (
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden w-full max-w-2xl mx-auto">
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              {myTeamQuery.isLoading && (
                <p className="text-gray-500 dark:text-gray-300">
                  Loading team member data...
                </p>
              )}

              {myTeamQuery.isError && (
                <p className="text-red-600 dark:text-red-400">
                  Failed to load team data:{" "}
                  {myTeamQuery.error?.response?.data?.message || "Server Error"}
                </p>
              )}

              {myTeamQuery.data && (
                <>
                  {/* Team Info */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                      Team: {myTeamQuery.data.name}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300">
                      Manager:{" "}
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {myTeamQuery.data.manager.name}
                      </span>{" "}
                      ({myTeamQuery.data.manager.email})
                    </p>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300">
                      Team Lead (You):{" "}
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {myTeamQuery.data.lead.name}
                      </span>{" "}
                      ({myTeamQuery.data.lead.email})
                    </p>
                  </div>

                  {/* Members List */}
                  <div className="mt-4">
                    <h4 className="text-md sm:text-lg font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1 mb-3">
                      Sales Representatives ({myTeamQuery.data.members.length})
                    </h4>
                    <ul className="flex flex-col gap-3 ">
                      {myTeamQuery.data.members.map((member) => (
                        <li
                          key={member._id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-200 dark:bg-gray-700 rounded-xl shadow-sm"
                        >
                          <div>
                            <p className="text-gray-800 dark:text-gray-100 font-semibold">
                              {member.name}
                            </p>  
                            <p className="text-gray-500 dark:text-gray-300 text-sm">
                              {member.email}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {!myTeamQuery.data &&
                !myTeamQuery.isLoading &&
                !myTeamQuery.isError && (
                  <p className="text-gray-500 dark:text-gray-300">
                    No team information available for this user.
                  </p>
                )}
            </div>
          </Card>
        )}

        {activeTab === "follow-up" && (
          <Card
            title="Follow-Up list"
            style={{ marginLeft: 0, paddingLeft: 0 }}
          >
            <div style={{ width: "100%", overflowX: "auto" }}>
              <div
                style={{
                  borderRadius: 10,
                  padding: 18,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  width: "100%",
                  border: "1px solid #eee",
                }}
              >
                {leadsQuery.isLoading ? (
                  <p>Loading...</p>
                ) : (
                  <LeadTable
                    leads={leadsQuery.data.filter(
                      (lead) => lead.status?.name === "Follow-Up"
                    )}
                    onOpen={onOpen}
                    onDelete={handleDelete}
                    statuses={statusesQuery.data}
                    onStatusChange={handleStatusChange}
                  />
                )}
              </div>
            </div>
          </Card>
        )}
        {activeTab === "data" && (
          <Card title="All Leads" style={{ marginLeft: 0, paddingLeft: 0 }}>
            {/* Filter + Refresh */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <select
                onChange={(e) => setFilter(e.target.value)}
                defaultValue=""
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  minWidth: 140,
                  fontSize: 15,
                }}
              >
                <option value="">All Statuses</option>
                {statusesQuery.data?.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                style={{
                  padding: "10px 18px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: 15,
                  boxShadow: "0 2px 8px rgba(16,185,129,0.08)",
                }}
                onClick={() => qc.invalidateQueries({ queryKey: ["leads"] })}
              >
                Refresh
              </button>
            </div>

            {/* Table */}
            <div style={{ width: "100%", overflowX: "auto" }}>
              <div
                style={{
                  borderRadius: 10,
                  padding: 18,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  width: "100%",
                  border: "1px solid #eee",
                }}
              >
                {leadsQuery.isLoading ? (
                  <p>Loading...</p>
                ) : (
                  <LeadTable
                    leads={leadsQuery.data}
                    onOpen={onOpen}
                    onDelete={handleDelete}
                    statuses={statusesQuery.data}
                    onStatusChange={handleStatusChange}
                  />
                )}
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
