import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Phone, Mail, MapPin, Link2 } from "lucide-react"; // icons
import api from '../services/api'
//import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "../components/LoadingSpinner";

export default function LeadDetailPage(){
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['lead',id], queryFn: async () => (await api.get(`/leads/${id}`)).data })
  const { data: statuses } = useQuery({ queryKey:['statuses'], queryFn: async() => (await api.get('/statuses')).data })

  const changeStatus = useMutation({
    mutationFn: async (payload) => (await api.post(`/leads/${id}/status`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead',id] });
      qc.invalidateQueries({ queryKey: ['leads'] }); // Refresh leads table in dashboard
    }
  })

  const [editForm, setEditForm] = useState({
    name: data?.name || '',
    phone: data?.phone || '',
    email: data?.email || '',
    city: data?.city || '',
    source: data?.source || ''
  });
  useEffect(() => {
    setEditForm({
      name: data?.name || '',
      phone: data?.phone || '',
      email: data?.email || '',
      city: data?.city || '',
      source: data?.source || ''
    });
  }, [data]);
  const updateLead = useMutation({
    mutationFn: async (payload) => (await api.put(`/leads/${id}`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead',id] });
      qc.invalidateQueries({ queryKey: ['leads'] });
    }
  });
  const [tab, setTab] = useState("details");
  const [loading, setLoading] = useState(false);
  // if(!data) 
  //   return <div className="p-4">Loading...</div>
  if (!data)
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={48} color="border-purple-500" />
      </div>
    );

    const handleChange = (e) => {
    const newStatus = e.target.value;
    setLoading(true);

    changeStatus.mutate(
      { statusName: newStatus },
      {
        onSuccess: () => {
          setTimeout(() => {
            setLoading(false);
          }, 1200);
        },
        onError: () => {
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        },
      }
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-orange-400">
            {data?.name.toUpperCase()}
          </h1>
          <p className="text-gray-800">Lead Information & History</p>
        </div>

        <StatusBadge name={data.status?.name} />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        {/* Status Dropdown */}
        <select
          className="rounded-lg border px-4 py-2"
          value={data?.status?.name}
          onChange={handleChange}
        >
          {statuses?.map((s) => (
            <option key={s._id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-purple-600 px-4 py-2 text-white shadow hover:bg-purple-700"
            onClick={() =>
              updateLead.mutate(editForm, {
                onSuccess: () => {
                  qc.invalidateQueries({ queryKey: ["leads"] });
                  const user = JSON.parse(localStorage.getItem("user"));
                  navigate(
                    user?.roleName === "Sales Representatives"
                      ? "/salesrep"
                      : "/teamlead"
                  );
                },
              })
            }
          >
            Save Changes
          </button>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <LoadingSpinner size={32} color="border-purple-500" />
        </div>
      )}

      {/* Card with Tabs */}
      <div className="bg-white rounded-xl shadow p-6">
        {/* Tabs */}
        <div className="flex gap-6 border-b">
          <button
            className={`pb-2 font-medium ${
              tab === "details"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500"
            }`}
            onClick={() => setTab("details")}
          >
            Details
          </button>
          <button
            className={`pb-2 font-medium ${
              tab === "history"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-500"
            }`}
            onClick={() => setTab("history")}
          >
            History
          </button>
        </div>

        {/* Details Tab */}
        {tab === "details" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Input with icon */}
            <InputField
              label="Full Name"
              icon={<User size={16} />}
              value={editForm.name}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <InputField
              label="Phone Number"
              icon={<Phone size={16} />}
              value={editForm.phone}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
            <InputField
              label="Email Address"
              icon={<Mail size={16} />}
              value={editForm.email}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, email: e.target.value }))
              }
            />
            <InputField
              label="City"
              icon={<MapPin size={16} />}
              value={editForm.city}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, city: e.target.value }))
              }
            />
            <InputField
              label="Source"
              icon={<Link2 size={16} />}
              value={editForm.source}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, source: e.target.value }))
              }
            />
          </div>
        )}

        {/* History Tab */}

        {tab === "history" && (
          <div className="flow-root flex-col mt-6">
            <ul role="list" className="-mb-5 space-y-2">
              {data.history?.slice().reverse().map((h, i, arr) => (
                <li key={i}>
                  <div className="relative pb-8">
                    {i !== arr.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-zinc-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-5">
                      <div>
                        <span className="space-y-4 h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center ring-8 ring-white">
                          <CheckCircleIcon
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm text-zinc-500">
                            → {new Date(h.at).toLocaleString()} set to <b>{h.status?.name || h.status}</b> by <b>{h.by?.name} - {h.by?.email}</b>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
    // <div className="space-y-4">
    //   <Card title={`Lead: ${data.name}`}>
    //     <div className="space-y-2">
    //       <div>
    //         <label>Name: </label>
    //         <input className="border rounded px-2 py-1" value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} />
    //       </div>
    //       <div>
    //         <label>Phone: </label>
    //         <input className="border rounded px-2 py-1" value={editForm.phone} onChange={e=>setEditForm(f=>({...f,phone:e.target.value}))} />
    //       </div>
    //       <div>
    //         <label>Email: </label>
    //         <input className="border rounded px-2 py-1" value={editForm.email} onChange={e=>setEditForm(f=>({...f,email:e.target.value}))} />
    //       </div>
    //       <div>
    //         <label>City: </label>
    //         <input className="border rounded px-2 py-1" value={editForm.city} onChange={e=>setEditForm(f=>({...f,city:e.target.value}))} />
    //       </div>
    //       <div>
    //         <label>Source: </label>
    //         <input className="border rounded px-2 py-1" value={editForm.source} onChange={e=>setEditForm(f=>({...f,source:e.target.value}))} />
    //       </div>
    //       <div>Status: <StatusBadge name={data.status?.name}/></div>
    //       <div className="flex gap-2 mt-2">
    //         <select className="border rounded px-2 py-1" onChange={(e)=>changeStatus.mutate({ statusName: e.target.value })}>
    //           <option>Change status...</option>
    //           {statuses?.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
    //         </select>
    //         <button className="ml-4 px-3 py-1 bg-blue-600 text-white rounded" onClick={()=>{
    //           updateLead.mutate(editForm, {
    //             onSuccess: () => {
    //               qc.invalidateQueries({ queryKey: ['leads'] });
    //               // Redirect based on role
    //               const user = JSON.parse(localStorage.getItem('user'));
    //               if (user?.roleName === 'Sales Representatives') {
    //                 navigate('/salesrep');
    //               } else {
    //                 navigate('/teamlead');
    //               }
    //             },
    //             onError: () => {
    //               const user = JSON.parse(localStorage.getItem('user'));
    //               if (user?.roleName === 'Sales Representatives') {
    //                 navigate('/salesrep');
    //               } else {
    //                 navigate('/teamlead');
    //               }
    //             }
    //           });
    //         }}>Done</button>
    //       </div>
    //     </div>
    //   </Card>

    //   <Card title="History">
    //     <ul className="text-sm space-y-1">
    //       {data.history?.slice().reverse().map((h,i)=>(
    //         <li key={i}>→ {new Date(h.at).toLocaleString()} set to <b>{h.status?.name || h.status}</b> by <b>{h.by?.name} - {h.by?.email}</b></li>
    //       ))}
    //     </ul>
    //   </Card>
    // </div>
  )
}

function InputField({ label, icon, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 flex items-center rounded-lg border px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-purple-200">
        {icon}
        <input
          className="ml-2 flex-1 outline-none"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}