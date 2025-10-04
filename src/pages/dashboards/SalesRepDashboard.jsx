import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/Card";
import LeadTable from "../../components/LeadTable";
import handleLogout from "../../logoutHandler";

export default function SalesRepDashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const leads = useQuery({
    queryKey: ["leads"],
    queryFn: async () => (await api.get("/leads")).data,
  });
  const statuses = useQuery({
    queryKey: ["statuses"],
    queryFn: async () => (await api.get("/statuses")).data,
  });
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
  const onOpen = (lead) => navigate(`/leads/${lead._id}`);
  const handleDelete = () => {};
  const handleStatusChange = (id, statusName) => {
    statusMutation.mutate({ id, statusName });
  };

  return (
    <div className="min-h-screen w-full p-6 overflow-x-hidden bg-white dark:bg-gray-800">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        Sales Representatives Dashboard
      </h1>
      <h2 className="text-gray-500 dark:text-gray-300 text-lg font-normal">
        Sales Representatives Analytics
      </h2>

      {/* ---- Horizontal tab buttons ---- */}
      <aside
        className="
      w-full border-b border-gray-200 dark:border-gray-600 px-2 sm:px-4 py-2
      flex gap-3 sm:gap-4 items-center overflow-x-auto no-scrollbar
    "
      >
        {[
          {
            tab: "home",
            label: "Home",
            color: "text-blue-600 dark:text-blue-400",
          },
          {
            tab: "data",
            label: "Data",
            color: "text-yellow-500 dark:text-yellow-400",
          },
          {
            tab: "logout",
            label: "Logout",
            color: "text-red-600 dark:text-red-400",
          },
        ].map((btn) => (
          <button
            key={btn.tab}
            onClick={() =>
              btn.tab === "logout"
                ? handleLogout(navigate)
                : setActiveTab(btn.tab)
            }
            className={`
          text-xs sm:text-sm md:text-base
          px-3 sm:px-4 py-2
          rounded-md font-medium whitespace-nowrap min-w-[160px] sm:min-w-[220px]
          flex-shrink-0
          ${btn.color}
          ${
            activeTab === btn.tab
              ? "bg-gray-200 dark:bg-gray-600 font-semibold shadow"
              : "hover:bg-gray-100 dark:hover:bg-gray-500"
          }
          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1
        `}
          >
            {btn.label}
          </button>
        ))}
      </aside>

      <main className="flex-1 p-0 mt-4">
        {activeTab === "home" && (
          <Card
            title="Welcome"
            className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
          >
            <div className="p-5">
              <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                Sales Rep Home
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Welcome to your dashboard.
              </p>
            </div>
          </Card>
        )}

        {activeTab === "data" && (
          <Card
            title="My Leads"
            className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
          >
            {leads.isLoading || statuses.isLoading ? (
              <p className="text-gray-700 dark:text-gray-300 p-5">Loading...</p>
            ) : (
              <LeadTable
                leads={leads.data}
                onOpen={onOpen}
                onDelete={handleDelete}
                statuses={statuses.data}
                onStatusChange={handleStatusChange}
              />
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
