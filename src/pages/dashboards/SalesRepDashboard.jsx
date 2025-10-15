import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/Card";
import LeadTable from "../../components/LeadTable";
import handleLogout from "../../logoutHandler";
import CustomDateRange from "../../components/CustomDateRange";

export default function SalesRepDashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [filter, setFilter] = useState("");

  // State for analytics time range
  const [timeRange, setTimeRange] = useState("Week");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  // Fetch only my leads (assigned to current user)
  const myleads = useQuery({
    queryKey: ["leads", "assignedTo", "me"],
    queryFn: async () => (await api.get("/leads?assignedTo=me")).data,
    refetchInterval: 5000,
  });
  // (removed global leads query) - this dashboard uses only 'my leads'
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
      qc.invalidateQueries({ queryKey: ["leads", "assignedTo", "me"] });
    },
  });
  const onOpen = (lead) => navigate(`/leads/${lead._id}`);
  const handleDelete = () => {};
  const handleStatusChange = (id, statusName) => {
    statusMutation.mutate({ id, statusName });
  };

  // derive displayed leads from the `myleads` query and the filter
  const displayedLeads = useMemo(() => {
    const allLeads = Array.isArray(myleads.data) ? myleads.data : [];
    if (!filter) return allLeads;
    const q = filter.toLowerCase();
    return allLeads.filter((l) => {
      const name = (l.name || l.title || "").toString().toLowerCase();
      return name.includes(q);
    });
  }, [myleads.data, filter]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Time-filtered leads for analytics
  const normalizeDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const filteredLeads = useMemo(() => {
    const allLeads = Array.isArray(myleads.data) ? myleads.data : [];
    return allLeads.filter((lead) => {
      const leadDate = normalizeDate(lead.createdAt);
      if (!leadDate) return false;

      const now = new Date();
      let cutoff;

      if (timeRange === "Day") {
        cutoff = normalizeDate(now);
      } else if (timeRange === "Week") {
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeRange === "Year") {
        cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      } else if (timeRange === "Custom" && startDate) {
        cutoff = new Date(startDate);
      } else {
        // Default to Month
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const normalizedCutoff = normalizeDate(cutoff);
      const normalizedEndDate =
        timeRange === "Custom" && endDate
          ? normalizeDate(new Date(endDate))
          : normalizeDate(now);

      return leadDate >= normalizedCutoff && leadDate <= normalizedEndDate;
    });
  }, [myleads.data, timeRange, startDate, endDate]);

  // Analytics calculations based on filtered leads
  const totalFilteredLeads = filteredLeads.length;
  const enrolledCount = filteredLeads.filter(
    (l) => l.status?.name === "Enrolled"
  ).length;
  const newCount = filteredLeads.filter((l) => l.status?.name === "New").length;
  const notInterestedCount = filteredLeads.filter(
    (l) => l.status?.name === "Not Interested"
  ).length;
  const processingCount =
    totalFilteredLeads - (enrolledCount + newCount + notInterestedCount);
  const remainingPct =
    totalFilteredLeads > 0 ? Math.round((newCount / totalFilteredLeads) * 100) : 0;

  const statItems = [
    { key: "total", label: "Total Leads", value: totalFilteredLeads, color: "#f9fafb" },
    { key: "new", label: "New", value: newCount, color: "#818cf8" },
    { key: "processing", label: "Processing", value: processingCount, color: "#fcd34d" },
    { key: "enrolled", label: "Enrolled (Success)", value: enrolledCount, color: "#4ade80" },
    { key: "not_interested", label: "Not Interested (Failed)", value: notInterestedCount, color: "#f87171" },
  ];

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
          <>
            <Card title="My Analytics Overview" className="mt-6 bg-gray-800 text-white">
              <div style={{ padding: 20 }}>
                <div style={{ gridColumn: "1 / -1", marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      Lead Stats
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          border: "1px solid #4b5563",
                          borderRadius: 10,
                          padding: "4px 8px",
                        }}
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          style={{ transform: "rotate(-90deg)" }}
                          aria-hidden
                        >
                          {(() => {
                            const r = 8;
                            const c = 2 * Math.PI * r;
                            const off = c * (1 - remainingPct / 100);
                            return (
                              <>
                                <circle cx="12" cy="12" r={r} stroke="#4b5563" strokeWidth="4" fill="none" />
                                <circle cx="12" cy="12" r={r} stroke="#22c55e" strokeWidth="4" fill="none" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition: "stroke-dashoffset 400ms ease" }} />
                              </>
                            );
                          })()}
                        </svg>
                        <div style={{ fontSize: 12, color: "#d1d5db" }}>
                          Remaining:{" "}
                          <span style={{ color: "#f9fafb", fontWeight: 600 }}>
                            {remainingPct}%
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          background: "#374151",
                          padding: 4,
                          borderRadius: 10,
                          border: "1px solid #4b5563",
                        }}
                      >
                        {["Day", "Week", "Month", "Year", "Custom"].map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setTimeRange(r);
                              if (r === "Custom") setShowCustomDateRange(true);
                            }}
                            style={{
                              padding: "6px 12px",
                              border: `1px solid ${timeRange === r ? "#6366f1" : "transparent"}`,
                              background: timeRange === r ? "#6366f1" : "#374151",
                              color: timeRange === r ? "#ffffff" : "#f9fafb",
                              borderRadius: 8,
                              cursor: "pointer",
                              fontSize: 13,
                              boxShadow: timeRange === r ? "0 2px 8px rgba(99,102,241,0.18)" : "none",
                            }}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {statItems.map((s) => (
                      <div key={s.key} className="bg-slate-700 border border-slate-600 rounded-xl p-4 flex flex-col gap-2">
                        <div className="text-sm text-slate-300">{s.label}</div>
                        <div style={{ fontWeight: "bold", fontSize: 28, color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {activeTab === "data" && (
          <Card
            title="My Leads"
            className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
          >
            <div className="p-4">
              <input
                type="text"
                placeholder="Search leads by name..."
                value={filter}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
            {myleads.isLoading || statuses.isLoading ? (
              <p className="text-gray-700 dark:text-gray-300 p-5">Loading...</p>
            ) : (
              <LeadTable
                leads={displayedLeads}
                onOpen={onOpen}
                onDelete={handleDelete}
                statuses={Array.isArray(statuses.data) ? statuses.data : []}
                onStatusChange={handleStatusChange}
              />
            )}
          </Card>
        )}
      </main>
      <CustomDateRange
        open={showCustomDateRange}
        onClose={() => setShowCustomDateRange(false)}
        onCustomRangeFetch={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />
    </div>
  );
}
