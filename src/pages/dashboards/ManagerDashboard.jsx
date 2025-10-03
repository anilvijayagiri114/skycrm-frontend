import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/Card";
import AddTeamModal from "../../components/AddTeamModal";
import AddTeamLeadModal from "../../components/AddTeamLeadModal";
import LeadTable from "../../components/LeadTable";
import LeadTableWithSelection from "../../components/LeadTableWithSelection";
import TeamSelectionModal from "../../components/TeamSelectionModal";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import CustomDateRange from "../../components/CustomDateRange";
import handleLogout from "../../logoutHandler";

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importSource, setImportSource] = useState("");
  const [importFile, setImportFile] = useState(null);
  const [importMsg, setImportMsg] = useState("");
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCenter, setMapCenter] = useState([0, 20]);
  const [mapHover, setMapHover] = useState({
    name: null,
    count: 0,
    visible: false,
    x: 0,
    y: 0,
  });
  const [cityGeo, setCityGeo] = useState({});
  
  // { cityKey: { lon, lat, country } }
  // Lead assignment states
  const [showUnassignedLeads, setShowUnassignedLeads] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showTeamSelectionModal, setShowTeamSelectionModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const nav = useNavigate();
  // Add missing state and query client
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    source: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [timeRange, setTimeRange] = useState("Week"); // Week | Month | Year

  // Fetch teams, leads, statuses
  const teams = useQuery({
    queryKey: ["teams"],
    queryFn: async () => (await api.get("/team")).data,
  });
  const leadsQuery = useQuery({
    queryKey: ["leads", filter],
    queryFn: async () =>
      (await api.get("/leads", { params: filter ? { status: filter } : {} }))
        .data,
  });
  const statusesQuery = useQuery({
    queryKey: ["statuses"],
    queryFn: async () => (await api.get("/statuses")).data,
  });

  // Unassigned leads query
  const unassignedLeadsQuery = useQuery({
    queryKey: ["leads", "unassigned"],
    queryFn: async () => {
      const response = await api.get("/leads");
      console.log("respose",response);
      return response.data.filter(lead => !lead.assignedTo || !lead.teamId);
    },
    enabled: showUnassignedLeads
  });
  useEffect(() => {
  if (showUnassignedLeads) {
    unassignedLeadsQuery.refetch();
  }
},);
  // console.log("Unassigned Leads",unassignedLeadsQuery.data);;

  // Lead creation mutation
  const createLead = useMutation({
    mutationFn: async (payload) => (await api.post("/leads", payload)).data,
    onSuccess: () => {
      setSuccessMsg("Lead added!");
      setForm({ name: "", email: "", phone: "", city: "", source: "" });
      qc.invalidateQueries({ queryKey: ["leads"] });
      setTimeout(() => setSuccessMsg(""), 2000);
    },
  });

  // Lead table actions
  const onOpen = (lead) => nav(`/leads/${lead._id}`);
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      deleteLead.mutate(id);
    }
  };
  const deleteLead = useMutation({
    mutationFn: async (id) => await api.delete(`/leads/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
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
  const handleStatusChange = (id, statusName) => {
    statusMutation.mutate({ id, statusName });
  };
// Bulk assignment mutation
const bulkAssignMutation = useMutation({
    mutationFn: async (payload) => (await api.post("/leads/bulk-assign", payload)).data,
    onSuccess: (data) => {
      setSuccessMsg(data.message || "Leads assigned successfully!");
      setSelectedLeads([]);
      setShowTeamSelectionModal(false);
      setShowUnassignedLeads(false);
      setIsAssigning(false);
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["teams"] });
      setTimeout(() => setSuccessMsg(""), 3000);
    },
    onError: (error) => {
      alert(error.response?.data?.error || "Failed to assign leads");
      setIsAssigning(false);
    }
  });

  // Lead assignment handlers
  const handleUnassignedLeadsClick = () => {
    setShowUnassignedLeads(!showUnassignedLeads);
    if (showUnassignedLeads) {
      setSelectedLeads([]);
    }
  };

  const handleSelectAllLeads = (leadIds) => {
    setSelectedLeads(leadIds);
  };

  const handleSelectionChange = (selectedIds) => {
    setSelectedLeads(selectedIds);
  };

  const handleSelectTeamClick = () => {
    if (selectedLeads.length === 0) {
      alert("Please select leads to assign");
      return;
    }
    setShowTeamSelectionModal(true);
  };

  const handleAssignToTeam = (teamId) => {
    setIsAssigning(true);
    bulkAssignMutation.mutate({
      leadIds: selectedLeads,
      teamId: teamId
    });
  };


  const handleTeamAdded = () => {
    setShowAddTeam(false);
  };

  

  const deleteMutation = useMutation({
    mutationFn: async (team) => await api.delete(`/team/${team._id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams"] });
    },
  });
  const handleTeamDelete = (team) => {
    deleteMutation.mutate(team);
  };

  const handleTeamEdit = (team) => {
    setShowAddTeam(true);
    setTeamToEdit(team);
  };

  const handleAddTeam = () => {
    setTeamToEdit(null);
    setShowAddTeam(true);
  };

  const [showTeamLeadModal, setShowTeamLeadModal] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [currentLead, setCurrentLeadId] = useState(null);
  const handleTeamLeadSet = async (teamLeadId) => {
    await api.post(`team/${teamData._id}/lead`, {
      leadId: teamLeadId,
      currentLeadId: currentLead || undefined,
    });
    qc.invalidateQueries({ queryKey: ["teams"] });
  };

  // ...existing code...

  // Geocode unique cities from leads using a lightweight, cached lookup via Nominatim (throttled)
  useEffect(() => {
    const leads = Array.isArray(leadsQuery.data) ? leadsQuery.data : [];
    const toKey = (s) => (s || "").toString().trim().toLowerCase();
    const uniqueCities = Array.from(
      new Set(leads.map((l) => toKey(l.city)).filter(Boolean))
    );
    const cacheKey = "geo_city_cache_v1";
    let cache = {};
    try {
      cache = JSON.parse(localStorage.getItem(cacheKey) || "{}");
    } catch {}
    // Merge cache into state if we have new entries
    if (Object.keys(cache).length > 0) {
      setCityGeo((prev) => ({ ...cache, ...prev }));
    }
    const unresolved = uniqueCities.filter((c) => !cityGeo[c] && !cache[c]);
    if (unresolved.length === 0) return;
    let cancelled = false;
    const fetchOne = async (city) => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(
          city
        )}`;
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        const data = await res.json();
        if (Array.isArray(data) && data[0]) {
          const lon = parseFloat(data[0].lon);
          const lat = parseFloat(data[0].lat);
          const country =
            (data[0].address &&
              (data[0].address.country || data[0].address.country_code)) ||
            "Unknown";
          setCityGeo((prev) => {
            const next = { ...prev, [city]: { lon, lat, country } };
            try {
              localStorage.setItem(
                cacheKey,
                JSON.stringify({ ...(cache || {}), ...next })
              );
            } catch {}
            return next;
          });
        }
      } catch {}
    };
    (async () => {
      for (let i = 0; i < unresolved.length; i++) {
        if (cancelled) break;
        await fetchOne(unresolved[i]);
        await new Promise((r) => setTimeout(r, 900));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [leadsQuery.data]);

  return (
    // <div style={{ display: "flex", minHeight: "80vh" }}>
    //   <aside
    //     style={{
    //       width: 140,
    //       background: "#f8fafc",
    //       borderRight: "1px solid #eee",
    //       padding: 16,
    //       display: "flex",
    //       flexDirection: "column",
    //       gap: 18,
    //       justifyContent: "center",
    //       height: "100%",
    //     }}
    //   >
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 w-full p-6 overflow-x-hidden transition-colors duration-200">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        Manager Dashboard
      </h1>
      <h2 style={{ color: "gray", fontWeight: "normal", fontSize: "1.2rem" }}>
        Manager Analytics
      </h2>
      <aside className="w-full border-b border-gray-200 px-2 sm:px-4 py-2 flex gap-3 sm:gap-4 items-center overflow-x-auto no-scrollbar">
        {[
          { tab: "home", label: "Home", color: "#2563eb" },
          { tab: "teams", label: "Teams", color: "#10b981" },
          { tab: "data", label: "Data Table", color: "#f59e0b" },
          { tab: "logout", label: "Logout", color: "#dc2626" },
        ].map((btn) => (
          <button
            key={btn.tab}
            onClick={() =>
              btn.tab === "logout" ? handleLogout(nav) : setActiveTab(btn.tab)
            }
            style={{
              fontWeight: activeTab === btn.tab ? "bold" : "normal",
              color: btn.color,
              background: activeTab === btn.tab ? "#e0e7ef" : "none",
              border: "none",
              textAlign: "left",
              fontSize: 16,
              cursor: "pointer",
              borderRadius: 8,
              padding: "8px 20px 8px 18px",
              marginBottom: 4,
              transition: "background 0.2s",
              boxShadow:
                activeTab === btn.tab ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#e0e7ef")}
            onMouseOut={(e) =>
              (e.currentTarget.style.background =
                activeTab === btn.tab ? "#e0e7ef" : "none")
            }
          >
            {btn.label}
          </button>
        ))}
      </aside>
      <main style={{ flex: 1, padding: 0 }}>
        {activeTab === "home" && (
          <Card title="Analytics Overview">
            <div style={{ padding: 20 }}>
              {/* <h2 style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                Manager Analytics
              </h2> */}
              <p style={{ marginBottom: 14, color: "#4b5563" }}>
                Lead Sources overview and monthly breakdown.
              </p>

              {/* Compute analytics */}
              {(() => {
                const leads = leadsQuery.data || [];
                const palette = [
                  "#6366F1",
                  "#22C55E",
                  "#F59E0B",
                  "#EF4444",
                  "#06B6D4",
                  "#A855F7",
                  "#84CC16",
                  "#F43F5E",
                  "#0EA5E9",
                  "#EAB308",
                ];

                // Time range filtering
                const now = new Date();
                const cutoff = (() => {
                  if (timeRange === "Day")
                    return new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate()
                    );
                  if (timeRange === "Week")
                    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  if (timeRange === "Year")
                    return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                  if (timeRange === "Custom" && startDate) {
                    return new Date(startDate);
                  }
                  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Month default
                })();
                const normalizeDate = (date) => {
                  return new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate()
                  );
                };
                const filteredLeads = leads.filter((l) => {
                  let d = l.createdAt ? new Date(l.createdAt) : null;
                  d = normalizeDate(d);
                  if (timeRange === "Custom" && endDate) {
                    return d && d >= normalizeDate(cutoff) && d <= normalizeDate(new Date(endDate));
                  }
                  return d && d >= normalizeDate(cutoff) && d <= normalizeDate(now);
                });
                const normalize = (s) =>
                  (s || "")
                    .toString()
                    .toLowerCase()
                    .replace(/[^a-z]/g, "");
                const remainingPct = (() => {
                  const total = filteredLeads.length;
                  const newCount = filteredLeads.reduce(
                    (acc, l) =>
                      acc +
                      (normalize(l.status?.name || l.status) === "new" ? 1 : 0),
                    0
                  );
                  return total > 0 ? Math.round((newCount / total) * 100) : 0;
                })();
                // console.log("filteredLeads",filteredLeads);

                const wantStatuses = [
                  "New",
                  "Contacted",
                  "Registered",
                  "Interested",
                  "Callback",
                  "Follow-up",
                  "Not Interested",
                  "Enrolled",
                ];
                // console.log("normalized contact",normalize('Contacted'))
                const countsByStatus = filteredLeads.reduce((acc, l) => {
                  const key = normalize(l.status.name);
                  acc[key] = (acc[key] || 0) + 1;
                  return acc;
                }, {});
                const statItems = (() => {
                  return [
                    {
                      key: "total",
                      label: "Total Leads",
                      value: filteredLeads.length,
                      color: "#111827",
                    },
                    {
                      key: "new",
                      label: "New",
                      value: countsByStatus[normalize("New")] || 0,
                      color: "#6366F1",
                    },
                    {
                      key: "contacted",
                      label: "Contacted",
                      value: countsByStatus[normalize("Contacted")] || 0,
                      color: "#22C55E",
                    },
                    {
                      key: "registered",
                      label: "Registered",
                      value: countsByStatus[normalize("Registered")] || 0,
                      color: "#06B6D4",
                    },
                    {
                      key: "interested",
                      label: "Interested",
                      value: countsByStatus[normalize("Interested")] || 0,
                      color: "#F59E0B",
                    },
                    {
                      key: "callback",
                      label: "Callback",
                      value: countsByStatus[normalize("Callback")] || 0,
                      color: "#A855F7",
                    },
                    {
                      key: "followup",
                      label: "Follow-up",
                      value:
                        countsByStatus[normalize("Follow-up")] ||
                        countsByStatus[normalize("Follow up")] ||
                        0,
                      color: "#84CC16",
                    },
                    {
                      key: "notinterested",
                      label: "Not Interested",
                      value: countsByStatus[normalize("Not Interested")] || 0,
                      color: "#F43F5E",
                    },
                    {
                      key: "enrolled",
                      label: "Enrolled",
                      value: countsByStatus[normalize("Enrolled")] || 0,
                      color: "#0EA5E9",
                    },
                  ];
                })();

                // Aggregate source totals
                const sourceToCount = leads.reduce((acc, l) => {
                  const key = (l.source || "Unknown").trim() || "Unknown";
                  acc[key] = (acc[key] || 0) + 1;
                  // console.log("Sourcesaccout",acc);
                  return acc;
                }, {});
                const pieData = Object.entries(sourceToCount)
                  .map(([name, value]) => ({ name, value }))
                  .sort((a, b) => b.value - a.value);
                // console.log("pieData",pieData);
                // Build months list for last 6 months
                const months = (() => {
                  const arr = [];
                  const now = new Date();
                  for (let i = 5; i >= 0; i--) {
                    const d = new Date(
                      now.getFullYear(),
                      now.getMonth() - i,
                      1
                    );
                    const key = `${d.getFullYear()}-${String(
                      d.getMonth() + 1
                    ).padStart(2, "0")}`;
                    arr.push({
                      key,
                      label:
                        d.toLocaleString("default", { month: "short" }) +
                        " " +
                        String(d.getFullYear()).slice(2),
                    });
                  }
                  // console.log("Mothly Data",arr);
                  return arr;
                })();

                // Top 4 sources for stacked bars (group others as "Other")
                const topSources = pieData.slice(0, 4).map((d) => d.name);

                const monthlyMap = months.reduce((acc, m) => {
                  acc[m.key] = { month: m.label };
                  return acc;
                }, {});

                leads.forEach((l) => {
                  const created = l.createdAt ? new Date(l.createdAt) : null;
                  if (!created) return;
                  const key = `${created.getFullYear()}-${String(
                    created.getMonth() + 1
                  ).padStart(2, "0")}`;
                  if (!monthlyMap[key]) return; // outside window
                  const src = (l.source || "Unknown").trim() || "Unknown";
                  const bucket = topSources.includes(src) ? src : "Other";
                  monthlyMap[key][bucket] = (monthlyMap[key][bucket] || 0) + 1;
                });

                const stackedData = months.map((m) => monthlyMap[m.key]);
                const stackKeys = [...topSources, "Other"];
                // console.log("Stacked data:",stackedData)

                // Status distribution
                const statuses = statusesQuery.data || [];
                const statusCounts = statuses.map((s) => {
                  const count = leads.filter((l) => l.status === s.name).length;
                  return { name: s.name, count };
                });
                const totalLeads = leads.length;

                return (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    {/* Top Stats + Time Range Filter */}
                    <div style={{ gridColumn: "1 / -1", marginBottom: 4 }}>
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
                        <div style={{ fontWeight: "bold" }}>Lead Stats</div>
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
                              background: "#ffffff",
                              border: "1px solid #e5e7eb",
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
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r={r}
                                      stroke="#e5e7eb"
                                      strokeWidth="4"
                                      fill="none"
                                    />
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r={r}
                                      stroke="#22c55e"
                                      strokeWidth="4"
                                      fill="none"
                                      strokeDasharray={c}
                                      strokeDashoffset={off}
                                      strokeLinecap="round"
                                      style={{
                                        transition:
                                          "stroke-dashoffset 400ms ease",
                                      }}
                                    />
                                  </>
                                );
                              })()}
                            </svg>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>
                              Remaining:{" "}
                              <span
                                style={{ color: "#111827", fontWeight: 600 }}
                              >
                                {remainingPct}%
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              background: "#f9fafb",
                              padding: 4,
                              borderRadius: 10,
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            {["Day", "Week", "Month", "Year", "Custom"].map(
                              (r) => (
                                <button
                                  key={r}
                                  onClick={() => {
                                    setTimeRange(r);
                                    if (r === "Custom") {
                                      setShowCustomDateRange(true);
                                    }
                                  }}
                                  style={{
                                    padding: "6px 12px",
                                    border:
                                      "1px solid " +
                                      (timeRange === r
                                        ? "#6366f1"
                                        : "transparent"),
                                    background:
                                      timeRange === r ? "#6366f1" : "#ffffff",
                                    color:
                                      timeRange === r ? "#ffffff" : "#111827",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontSize: 13,
                                    boxShadow:
                                      timeRange === r
                                        ? "0 2px 8px rgba(99,102,241,0.18)"
                                        : "none",
                                  }}
                                >
                                  {r}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(140px, 1fr))",
                          gap: 12,
                        }}
                      >
                        {statItems.map((s) => (
                          <div
                            key={s.key}
                            style={{
                              background: "#fff",
                              border: "1px solid #eee",
                              borderRadius: 12,
                              padding: 12,
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                            }}
                          >
                            <div style={{ fontSize: 12, color: "#6b7280" }}>
                              {s.label}
                            </div>
                            <div
                              style={{
                                fontWeight: "bold",
                                fontSize: 22,
                                color: s.color,
                              }}
                            >
                              {s.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Source Performance Cards */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div style={{ fontWeight: "bold", margin: "8px 0" }}>
                        Lead Sources Performance
                      </div>
                      {(() => {
                        const n = (s) => (s || "").toString().trim();
                        const nn = (s) => n(s).toLowerCase();
                        const srcMap = filteredLeads.reduce((acc, l) => {
                          const src = n(l.source) || "Unknown";
                          const key = nn(src) || "unknown";
                          const isEnrolled =
                            normalize(l.status?.name || l.status) ===
                            "enrolled";
                          if (!acc[key])
                            acc[key] = { name: src, total: 0, enrolled: 0 };
                          acc[key].total += 1;
                          if (isEnrolled) acc[key].enrolled += 1;
                          return acc;
                        }, {});
                        const entries = Object.values(srcMap).sort(
                          (a, b) => b.total - a.total
                        );
                        const logoFor = (name) => {
                          const k = nn(name);
                          const logos = {
                            instagram:
                              "https://logo.clearbit.com/instagram.com",
                            facebook: "https://logo.clearbit.com/facebook.com",
                            "google ads":
                              "https://logo.clearbit.com/google.com",
                            google: "https://logo.clearbit.com/google.com",
                            linkedin: "https://logo.clearbit.com/linkedin.com",
                            youtube: "https://logo.clearbit.com/youtube.com",
                            x: "https://logo.clearbit.com/x.com",
                            twitter: "https://logo.clearbit.com/twitter.com",
                            whatsapp: "https://logo.clearbit.com/whatsapp.com",
                            telegram: "https://logo.clearbit.com/telegram.org",
                            website: "https://logo.clearbit.com/example.com",
                            referral:
                              "https://logo.clearbit.com/mail.google.com",
                            referrals:
                              "https://logo.clearbit.com/mail.google.com",
                            ads: "https://logo.clearbit.com/google.com",
                            insta: "https://logo.clearbit.com/instagram.com",
                          };
                          // Try exact, then includes match
                          if (logos[k]) return logos[k];
                          const hit = Object.keys(logos).find((key) =>
                            k.includes(key)
                          );
                          return hit ? logos[hit] : "";
                        };
                        const circumference = 2 * Math.PI * 36; // r=36
                        return (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(260px, 1fr))",
                              gap: 12,
                            }}
                          >
                            {entries.map((src) => {
                              const rate =
                                src.total > 0
                                  ? Math.round((src.enrolled / src.total) * 100)
                                  : 0;
                              const offset = circumference * (1 - rate / 100);
                              const logo = logoFor(src.name);
                              return (
                                <div
                                  key={src.name}
                                  style={{
                                    background: "#fff",
                                    border: "1px solid #eee",
                                    borderRadius: 12,
                                    padding: 12,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 44,
                                      height: 44,
                                      borderRadius: 8,
                                      background: "#f3f4f6",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {logo ? (
                                      <img
                                        src={logo}
                                        alt={src.name}
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                        }}
                                      />
                                    ) : (
                                      <svg
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        fill="#6b7280"
                                        aria-hidden
                                      >
                                        <path d="M12 2a7 7 0 0 0-7 7v6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V9a7 7 0 0 0-7-7zm0 2a5 5 0 0 1 5 5v1H7V9a5 5 0 0 1 5-5zm-3 9h6a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2z" />
                                      </svg>
                                    )}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: "bold" }}>
                                      {src.name}
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: 12,
                                        marginTop: 6,
                                        color: "#6b7280",
                                        fontSize: 13,
                                      }}
                                    >
                                      <div>
                                        Total:{" "}
                                        <span
                                          style={{
                                            color: "#111827",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {src.total}
                                        </span>
                                      </div>
                                      <div>
                                        Enrolled:{" "}
                                        <span
                                          style={{
                                            color: "#0EA5E9",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {src.enrolled}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    style={{
                                      width: 86,
                                      height: 86,
                                      position: "relative",
                                    }}
                                  >
                                    <svg
                                      width="86"
                                      height="86"
                                      viewBox="0 0 100 100"
                                      style={{ transform: "rotate(-90deg)" }}
                                    >
                                      <circle
                                        cx="50"
                                        cy="50"
                                        r="36"
                                        stroke="#e5e7eb"
                                        strokeWidth="8"
                                        fill="none"
                                      />
                                      <circle
                                        cx="50"
                                        cy="50"
                                        r="36"
                                        stroke="#22c55e"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                        style={{
                                          transition:
                                            "stroke-dashoffset 800ms ease",
                                        }}
                                      />
                                    </svg>
                                    <div
                                      style={{
                                        position: "absolute",
                                        inset: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "bold",
                                        fontSize: 14,
                                        color: "#111827",
                                      }}
                                    >
                                      {rate}%
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    {/* {progress bars for statuses} */}

                    {/* Team-level Stats (filtered by timeRange) */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div style={{ fontWeight: "bold", margin: "8px 0" }}>
                        Team Performance Overview
                      </div>
                      {(() => {
                        // Mock team data - replace with actual data when available
                        const teamStats = [
                          {
                            name: "Alpha Team",
                            leads: 90,
                            processing: 20,
                            success: 30,
                            failed: 40,
                          },
                          {
                            name: "Beta Team",
                            leads: 75,
                            processing: 15,
                            success: 25,
                            failed: 35,
                          },
                          {
                            name: "Gamma Team",
                            leads: 120,
                            processing: 30,
                            success: 45,
                            failed: 45,
                          },
                          {
                            name: "Delta Team",
                            leads: 85,
                            processing: 20,
                            success: 35,
                            failed: 30,
                          },
                          {
                            name: "Echo Team",
                            leads: 95,
                            processing: 25,
                            success: 40,
                            failed: 30,
                          },
                          {
                            name: "Foxtrot Team",
                            leads: 110,
                            processing: 35,
                            success: 35,
                            failed: 40,
                          },
                        ];

                        return (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(280px, 1fr))",
                              gap: 16,
                            }}
                          >
                            {teamStats.map((team) => {
                              const successRate =
                                team.leads > 0
                                  ? Math.round(
                                      (team.success / team.leads) * 100
                                    )
                                  : 0;
                              const failureRate =
                                team.leads > 0
                                  ? Math.round((team.failed / team.leads) * 100)
                                  : 0;
                              const processingRate =
                                team.leads > 0
                                  ? Math.round(
                                      (team.processing / team.leads) * 100
                                    )
                                  : 0;

                              // Pie chart data for success vs failure (excluding processing)
                              const completedLeads = team.success + team.failed;
                              const pieData =
                                completedLeads > 0
                                  ? [
                                      {
                                        name: "Success",
                                        value: team.success,
                                        color: "#22c55e",
                                      },
                                      {
                                        name: "Failed",
                                        value: team.failed,
                                        color: "#ef4444",
                                      },
                                    ]
                                  : [];

                              return (
                                <div
                                  key={team.name}
                                  style={{
                                    background: "#fff",
                                    border: "1px solid #eee",
                                    borderRadius: 12,
                                    padding: 16,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 12,
                                  }}
                                >
                                  {/* Team Name */}
                                  <div
                                    style={{
                                      fontWeight: "bold",
                                      fontSize: 16,
                                      color: "#111827",
                                    }}
                                  >
                                    {team.name}
                                  </div>

                                  {/* Stats Grid */}
                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: "1fr 1fr",
                                      gap: 12,
                                    }}
                                  >
                                    {/* Left Column - Text Stats */}
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8,
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          fontSize: 14,
                                        }}
                                      >
                                        <span style={{ color: "#6b7280" }}>
                                          Leads:
                                        </span>
                                        <span
                                          style={{
                                            fontWeight: "bold",
                                            color: "#111827",
                                          }}
                                        >
                                          {team.leads}
                                        </span>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          fontSize: 14,
                                        }}
                                      >
                                        <span style={{ color: "#6b7280" }}>
                                          Processing:
                                        </span>
                                        <span
                                          style={{
                                            fontWeight: "bold",
                                            color: "#f59e0b",
                                          }}
                                        >
                                          {team.processing}
                                        </span>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          fontSize: 14,
                                        }}
                                      >
                                        <span style={{ color: "#6b7280" }}>
                                          Success:
                                        </span>
                                        <span
                                          style={{
                                            fontWeight: "bold",
                                            color: "#22c55e",
                                          }}
                                        >
                                          {team.success}
                                        </span>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          fontSize: 14,
                                        }}
                                      >
                                        <span style={{ color: "#6b7280" }}>
                                          Failed:
                                        </span>
                                        <span
                                          style={{
                                            fontWeight: "bold",
                                            color: "#ef4444",
                                          }}
                                        >
                                          {team.failed}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Right Column - Pie Chart */}
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      {pieData.length > 0 ? (
                                        <>
                                          <div
                                            style={{ width: 80, height: 80 }}
                                          >
                                            <ResponsiveContainer>
                                              <PieChart>
                                                <Pie
                                                  data={pieData}
                                                  dataKey="value"
                                                  nameKey="name"
                                                  innerRadius={20}
                                                  outerRadius={35}
                                                  paddingAngle={2}
                                                >
                                                  {pieData.map(
                                                    (entry, index) => (
                                                      <Cell
                                                        key={`cell-${entry.name}`}
                                                        fill={entry.color}
                                                      />
                                                    )
                                                  )}
                                                </Pie>
                                              </PieChart>
                                            </ResponsiveContainer>
                                          </div>

                                          {/* Legend */}
                                          <div
                                            style={{
                                              display: "flex",
                                              flexDirection: "column",
                                              gap: 4,
                                              marginTop: 8,
                                            }}
                                          >
                                            {pieData.map((item) => (
                                              <div
                                                key={item.name}
                                                style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: 6,
                                                  fontSize: 12,
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: "50%",
                                                    backgroundColor: item.color,
                                                  }}
                                                ></div>
                                                <span
                                                  style={{ color: "#6b7280" }}
                                                >
                                                  {item.name}: {item.value}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </>
                                      ) : (
                                        <div
                                          style={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: "50%",
                                            backgroundColor: "#f3f4f6",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#9ca3af",
                                            fontSize: 12,
                                          }}
                                        >
                                          No Data
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Success Rate Badge */}
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                      padding: "6px 12px",
                                      backgroundColor: "#f0f9ff",
                                      borderRadius: 8,
                                      border: "1px solid #e0f2fe",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: 12,
                                        color: "#0369a1",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      Success Rate: {successRate}%
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Pie/Doughnut */}
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #eee",
                        borderRadius: 10,
                        padding: 12,
                      }}
                    >
                      <div style={{ fontWeight: "bold", marginBottom: 8 }}>
                        Lead Sources Share
                      </div>
                      <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={pieData}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={2}
                            >
                              {pieData.map((entry, index) => (
                                <Cell
                                  key={`cell-${entry.name}`}
                                  fill={palette[index % palette.length]}
                                />
                              ))}
                            </Pie>
                            <ReTooltip formatter={(v, n) => [v, n]} />
                            <ReLegend verticalAlign="bottom" height={24} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Stacked Bar by Month */}
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #eee",
                        borderRadius: 10,
                        padding: 12,
                      }}
                    >
                      <div style={{ fontWeight: "bold", marginBottom: 8 }}>
                        Lead Sources by Month
                      </div>
                      <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer>
                          <BarChart data={stackedData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                            />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fontSize: 12 }}
                            />
                            <ReTooltip />
                            <ReLegend />
                            {stackKeys.map((k, idx) => (
                              <Bar
                                key={k}
                                dataKey={k}
                                stackId="a"
                                fill={palette[idx % palette.length]}
                                radius={[4, 4, 0, 0]}
                              />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Geographic Distribution (Choropleth + Dots) */}
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        background: "#fff",
                        border: "1px solid #eee",
                        borderRadius: 10,
                        padding: 12,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ fontWeight: "bold" }}>
                          Geographic Distribution of Leads
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              color: "#6b7280",
                              marginRight: 8,
                            }}
                          >
                            Darker shade = more leads
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() =>
                                setMapZoom((z) => Math.max(1, z - 0.5))
                              }
                              style={{
                                padding: "4px 10px",
                                border: "1px solid #e5e7eb",
                                borderRadius: 6,
                                background: "#f9fafb",
                                cursor: "pointer",
                              }}
                            >
                              -
                            </button>
                            <button
                              onClick={() =>
                                setMapZoom((z) => Math.min(8, z + 0.5))
                              }
                              style={{
                                padding: "4px 10px",
                                border: "1px solid #e5e7eb",
                                borderRadius: 6,
                                background: "#f9fafb",
                                cursor: "pointer",
                              }}
                            >
                              +
                            </button>
                            <button
                              onClick={() => {
                                setMapZoom(1);
                                setMapCenter([0, 20]);
                              }}
                              style={{
                                padding: "4px 10px",
                                border: "1px solid #e5e7eb",
                                borderRadius: 6,
                                background: "#f9fafb",
                                cursor: "pointer",
                              }}
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>
                      {(() => {
                        const leads = leadsQuery.data || [];
                        const toKey = (s) =>
                          (s || "").toString().trim().toLowerCase();
                        // Count by country from geocoded cities
                        const counts = leads.reduce((acc, l) => {
                          const k = toKey(l.city);
                          const info = k && cityGeo[k];
                          if (!info) return acc;
                          const country = info.country || "Unknown";
                          acc[country] = (acc[country] || 0) + 1;
                          return acc;
                        }, {});
                        // One dot per lead at city coordinates with slight jitter to avoid overlap
                        const citySeq = {};
                        const markers = leads
                          .map((l) => {
                            const k = toKey(l.city);
                            const info = k && cityGeo[k];
                            if (!info) return null;
                            const idx = (citySeq[k] = (citySeq[k] || 0) + 1);
                            const angle = idx * 2.399963;
                            const radius = 0.25 * Math.sqrt(idx);
                            const dLon = (radius * Math.cos(angle)) / 10;
                            const dLat = (radius * Math.sin(angle)) / 10;
                            return {
                              lon: info.lon + dLon,
                              lat: info.lat + dLat,
                              country: info.country,
                            };
                          })
                          .filter(Boolean);
                        const max = Object.values(counts).reduce(
                          (m, v) => Math.max(m, v),
                          0
                        );
                        const colorFor = (geoName) => {
                          const v = counts[geoName] || 0;
                          if (max === 0) return "#e5e7eb";
                          const t = v / max;
                          // Indigo palette to match other charts (light -> dark)
                          const light = [224, 231, 255]; // #E0E7FF
                          const dark = [99, 102, 241]; // #6366F1
                          const mix = (a, b) => Math.round(a + (b - a) * t);
                          const r = mix(light[0], dark[0]);
                          const g = mix(light[1], dark[1]);
                          const b = mix(light[2], dark[2]);
                          return `rgb(${r}, ${g}, ${b})`;
                        };
                        const GEO_URL =
                          "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
                        // Render every lead as a dot (no sampling)
                        const sampled = markers;
                        return (
                          <div style={{ width: "100%", height: 500 }}>
                            <ComposableMap
                              projectionConfig={{ scale: 200 }}
                              style={{ width: "100%", height: "100%" }}
                            >
                              <ZoomableGroup
                                zoom={mapZoom}
                                center={mapCenter}
                                minZoom={1}
                                maxZoom={8}
                                onMoveEnd={({ coordinates, zoom }) => {
                                  setMapCenter(coordinates);
                                  setMapZoom(zoom);
                                }}
                              >
                                <Geographies geography={GEO_URL}>
                                  {({ geographies }) =>
                                    geographies.map((geo) => {
                                      const geoName =
                                        geo.properties.name ||
                                        geo.properties.NAME ||
                                        geo.properties.ADMIN;
                                      return (
                                        <Geography
                                          key={geo.rsmKey}
                                          geography={geo}
                                          onMouseEnter={(e) => {
                                            const v = counts[geoName] || 0;
                                            setMapHover({
                                              name: geoName,
                                              count: v,
                                              visible: true,
                                              x: e.clientX,
                                              y: e.clientY,
                                            });
                                          }}
                                          onMouseMove={(e) => {
                                            setMapHover((prev) => ({
                                              ...prev,
                                              x: e.clientX,
                                              y: e.clientY,
                                            }));
                                          }}
                                          onMouseLeave={() =>
                                            setMapHover((prev) => ({
                                              ...prev,
                                              visible: false,
                                            }))
                                          }
                                          fill={colorFor(geoName)}
                                          stroke="#ffffff"
                                          strokeWidth={0.3}
                                          style={{ outline: "none" }}
                                        />
                                      );
                                    })
                                  }
                                </Geographies>
                                {sampled.map((m, idx) => (
                                  <Marker
                                    key={`mk-${idx}`}
                                    coordinates={[m.lon, m.lat]}
                                  >
                                    <circle
                                      r={2.1}
                                      fill="#6366F1"
                                      fillOpacity={0.55}
                                      stroke="#312E81"
                                      strokeOpacity={0.25}
                                      strokeWidth={0.3}
                                    />
                                  </Marker>
                                ))}
                              </ZoomableGroup>
                            </ComposableMap>
                            {mapHover.visible && (
                              <div
                                style={{
                                  position: "fixed",
                                  left: mapHover.x + 12,
                                  top: mapHover.y + 12,
                                  background: "#111827",
                                  color: "#fff",
                                  padding: "6px 8px",
                                  borderRadius: 6,
                                  fontSize: 12,
                                  pointerEvents: "none",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                }}
                              >
                                {mapHover.name}: {mapHover.count} leads
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}
            </div>
          </Card>
        )}
        {activeTab === "teams" && (
          // <Card
          //   title="My Teams"
          //   actions={
          //     <button
          //       className="bg-blue-600 text-white px-3 py-1 rounded"
          //       onClick={() => handleAddTeam()}
          //     >               
          //      + Add Team
          //     </button>
          //   }
          // >
          //   <ul className="text-sm space-y-1">
          //     {teams.data?.map((t) => (
          //       <li key={t._id}>
          //         <div
          //           style={{
          //             display: "flex",
          //             justifyContent: "space-between",
          //             alignItems: "center",
          //           }}
          //         >
          //           {/* Left side content */}
          //           <div>
          //             <strong>{t.name}</strong> — Lead: {t.lead?.name || "-"} ·
          //             Members: {t.members?.length || 0}
          //           </div>

          //           {/* Right side buttons */}
          //           <div style={{ display: "flex", gap: "12px" }}>
          //             <button
          //               className="text-blue-500 underline hover:text-blue-700"
          //               onClick={() => handleTeamEdit(t)}
          //             >
          //               Edit Team
          //             </button>
          //             <button
          //               className="text-red-500 underline hover:text-red-700"
          //               onClick={() => handleTeamDelete(t)}
          //             >
          //               Delete Team
          //             </button>

          //             {t.lead !== undefined && (
          //               <button
          //                 className="bg-violet-500 text-white px-3 py-1 rounded"
          //                 onClick={() => {
          //                   setShowTeamLeadModal(true);
          //                   setTeamData(t);
          //                   setCurrentLeadId(t.lead);
          //                 }}
          //               >
          //                 Change Lead
          //               </button>
          //             )}
          //             {t.lead === undefined && (
          //               <button
          //                 className="bg-green-500 text-white px-3 py-1 rounded"
          //                 onClick={() => {
          //                   setShowTeamLeadModal(true);
          //                   setTeamData(t);
          //                 }}
          //               >
          //                 Set Team Lead
          //               </button>
          //             )}
          //           </div>
          //         </div>

          //         {/* Members row */}
          //         <div style={{ marginLeft: 16, fontSize: 13, color: "#555" }}>
          //           Members: {t.members?.map((m) => m.name).join(", ") || "-"}
          //         </div>
          //       </li>
          //     ))}
          //   </ul>
          // </Card>
          <Card
  title="My Teams"
  actions={
    <button
      className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-md shadow-md flex items-center gap-2"
      onClick={() => handleAddTeam()}
    >
      <span>+</span> Add Team
    </button>
  }
>
  <ul className="space-y-4">
    {teams.data?.map((t) => (
      <li
        key={t._id}
        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left: Team Info */}
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">{t.name}</h3>
            <p className="text-sm text-gray-600">
              Lead:{" "}
              <span className="font-medium text-indigo-600">
                {t.lead?.name || "Not assigned"}
              </span>{" "}
              · Members:{" "}
              <span className="font-medium">{t.members?.length || 0}</span>
            </p>
            <p className="text-xs text-gray-500 truncate max-w-sm md:max-w-md">
              Members List:{" "}
              {t.members?.map((m) => m.name).join(", ") || "No members"}
            </p>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="text-blue-500 hover:text-blue-700 transition px-3 py-1 rounded-md hover:bg-blue-50"
              onClick={() => handleTeamEdit(t)}
            >
              Edit Team
            </button>
            <button
              className="text-red-500 hover:text-red-700 transition px-3 py-1 rounded-md hover:bg-red-50"
              onClick={() => handleTeamDelete(t)}
            >
              Delete Team
            </button>

            {t.lead !== undefined ? (
              <button
                className="bg-violet-500 hover:bg-violet-600 transition text-white px-4 py-2 rounded-md shadow"
                onClick={() => {
                  setShowTeamLeadModal(true);
                  setTeamData(t);
                  setCurrentLeadId(t.lead);
                }}
              >
                Change Lead
              </button>
            ) : (
              <button
                className="bg-green-500 hover:bg-green-600 transition text-white px-4 py-2 rounded-md shadow"
                onClick={() => {
                  setShowTeamLeadModal(true);
                  setTeamData(t);
                }}
              >
                Set Team Lead
              </button>
            )}
          </div>
        </div>
      </li>
    ))}
  </ul>
</Card>
        )}
        {activeTab === "data" && (
          <Card title="All Leads" style={{ marginLeft: 0, paddingLeft: 0 }}>
            {/* Filter + Refresh + Import Data */}
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
              <button
                style={{
                  padding: "10px 18px",
                  background: "#6366f1",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: 15,
                  boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
                }}
                onClick={() => setImportOpen(true)}
              >
                Import Data
              </button>
            </div>

            {importOpen && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>Import CSV</div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  />
                  <input
                    placeholder="Source (e.g., Facebook Ads)"
                    value={importSource}
                    onChange={(e) => setImportSource(e.target.value)}
                    style={{
                      padding: 8,
                      border: "1px solid #ddd",
                      borderRadius: 6,
                    }}
                  />
                  <button
                    style={{
                      padding: "8px 14px",
                      background: "#111827",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                    onClick={async () => {
                      setImportMsg("");
                      if (!importFile) {
                        setImportMsg("Please choose a CSV file");
                        return;
                      }
                      if (!importSource.trim()) {
                        setImportMsg("Please provide a source");
                        return;
                      }
                      const fd = new FormData();
                      fd.append("file", importFile);
                      fd.append("source", importSource.trim());
                      try {
                        const { data } = await api.post(
                          "/leads/import/csv",
                          fd,
                          { headers: { "Content-Type": "multipart/form-data" } }
                        );
                        setImportMsg(
                          `Imported: ${data.inserted}, Skipped: ${data.skipped}`
                        );
                        if (
                          typeof data.inserted === "number" &&
                          data.inserted > 0
                        ) {
                          alert("Successfully inserted");
                        } else {
                          alert("No valid rows to insert");
                        }
                        qc.invalidateQueries({ queryKey: ["leads"] });
                      } catch (e) {
                        setImportMsg(
                          e.response?.data?.error || "Import failed"
                        );
                      }
                    }}
                  >
                    Upload
                  </button>
                  <button
                    style={{
                      padding: "8px 14px",
                      background: "#e5e7eb",
                      color: "#111827",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setImportOpen(false);
                      setImportMsg("");
                      setImportFile(null);
                      setImportSource("");
                    }}
                  >
                    Close
                  </button>
                </div>
                {importMsg && (
                  <div style={{ marginTop: 10, fontSize: 14 }}>{importMsg}</div>
                )}
                <div style={{ marginTop: 8, color: "#6b7280", fontSize: 12 }}>
                  CSV columns supported: name, phone, email, city
                  (case-insensitive). All rows will get status "New" and the
                  provided source.
                </div>
              </div>
            )}

            {/* Add Lead Form */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 20,
                background: "#f8fafc",
                padding: 18,
                borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {successMsg && (
                <div
                  style={{
                    color: "#10b981",
                    fontWeight: "bold",
                    alignSelf: "center",
                  }}
                >
                  {successMsg}
                </div>
              )}
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  fontSize: 15,
                  background: "#fff",
                }}
              />
              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  fontSize: 15,
                  background: "#fff",
                }}
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  fontSize: 15,
                  background: "#fff",
                }}
              />
              <input
                placeholder="City"
                value={form.city}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, city: e.target.value }))
                }
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  fontSize: 15,
                  background: "#fff",
                }}
              />
              <input
                placeholder="Source"
                value={form.source}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, source: e.target.value }))
                }
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  fontSize: 15,
                  background: "#fff",
                }}
              />

              <button
                style={{
                  padding: "10px 18px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: 15,
                  boxShadow: "0 2px 8px rgba(37,99,235,0.08)",
                }}
                onClick={() => createLead.mutate(form)}
              >
                Add Lead
              </button>
            </div>
            <div>
            <button
                 type="button"
                 onClick={handleUnassignedLeadsClick}
                 aria-pressed={showUnassignedLeads}
                 className={`px-2.5 py-1.5 text-sm font-semibold rounded-md mx-2 my-2 transition-colors duration-150 focus:outline-none ${
                 showUnassignedLeads
                 ? "bg-white text-yellow-500 border border-yellow-400"
                 : "bg-red-600 text-white border border-red-600"
              }`}
            >
            {showUnassignedLeads ? "Show All Leads" : `Show Unassigned Leads ${unassignedLeadsQuery.data ? `(${unassignedLeadsQuery.data.length})` : ''}`}
           </button>

            </div>

            {/* Lead Assignment Controls */}
            {showUnassignedLeads && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px',
                padding: '15px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <h3 style={{ margin: 0, color: '#374151', fontSize: '16px', fontWeight: 'bold' }}>
                    Select leads to assign to teams
                  </h3>
                  <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                    {selectedLeads.length > 0 
                      ? `${selectedLeads.length} lead${selectedLeads.length !== 1 ? 's' : ''} selected`
                      : 'No leads selected'
                    }
                  </p>
                </div>
                <button
                  style={{
                    padding: "10px 20px",
                    background: selectedLeads.length > 0 ? "#10b981" : "#9ca3af",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: selectedLeads.length > 0 ? "pointer" : "not-allowed",
                    fontWeight: "bold",
                    fontSize: 14,
                    opacity: selectedLeads.length > 0 ? 1 : 0.6,
                  }}
                  onClick={handleSelectTeamClick}
                  disabled={selectedLeads.length === 0}
                >
                  Select Team to Assign
                </button>
              </div>
            )}
            
            {/* Table */}
            <div style={{ width: "100%", overflowX: "auto" }}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  padding: 18,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  width: "100%",
                  border: "1px solid #eee",
                }}
              >
                {showUnassignedLeads ? (
                  unassignedLeadsQuery.isLoading ? (
                    <p>Loading unassigned leads...</p>
                  ) : (
                    <LeadTableWithSelection
                      leads={unassignedLeadsQuery.data}
                      onOpen={onOpen}
                      onDelete={handleDelete}
                      statuses={statusesQuery.data}
                      onStatusChange={handleStatusChange}
                      showSelection={true}
                      selectedLeads={selectedLeads}
                      onSelectionChange={handleSelectionChange}
                      onSelectAll={handleSelectAllLeads}
                    />
                  )
                ) : (
                  leadsQuery.isLoading ? (
                    <p>Loading...</p>
                  ) : (
                    <LeadTable
                      leads={leadsQuery.data}
                      onOpen={onOpen}
                      onDelete={handleDelete}
                      statuses={statusesQuery.data}
                      onStatusChange={handleStatusChange}
                    />
                  )
                )}
              </div>
            </div>
          </Card>
        )}
        <AddTeamModal
          open={showAddTeam}
          onClose={() => setShowAddTeam(false)}
          onTeamAdded={handleTeamAdded}
        />
        <AddTeamLeadModal
          open={showTeamLeadModal}
          onClose={() => setShowTeamLeadModal(false)}
          members={teamData?.members || []}
          onTeamLeadSet={handleTeamLeadSet}
        />
        <TeamSelectionModal
          isOpen={showTeamSelectionModal}
          onClose={() => setShowTeamSelectionModal(false)}
          teams={teams.data || []}
          selectedLeadIds={selectedLeads}
          onAssignToTeam={handleAssignToTeam}
          isLoading={isAssigning}
        />
        <CustomDateRange
          open={showCustomDateRange}
          onClose={() => setShowCustomDateRange(false)}
          onCustomRangeFetch={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />
      </main>
    </div>
  );
}