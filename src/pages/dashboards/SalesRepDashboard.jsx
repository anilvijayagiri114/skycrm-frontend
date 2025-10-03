import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Card from '../../components/Card'
import LeadTable from '../../components/LeadTable'
import handleLogout from '../../logoutHandler';

export default function SalesRepDashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const leads = useQuery({ queryKey:['leads'], queryFn: async()=> (await api.get('/leads')).data });
  const statuses = useQuery({ queryKey:['statuses'], queryFn: async()=> (await api.get('/statuses')).data });
  const statusMutation = useMutation({
    mutationFn: async (payload) => (await api.post(`/leads/${payload.id}/status`, { statusName: payload.statusName })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
    }
  });
  const onOpen = (lead) => navigate(`/leads/${lead._id}`);
  const handleDelete = () => {};
  const handleStatusChange = (id, statusName) => {
    statusMutation.mutate({ id, statusName });
  };

  return (
    // <div style={{ display: 'flex', minHeight: '80vh' }}>
    //   <aside style={{ width: 140, background: '#f8fafc', borderRight: '1px solid #eee', padding: 16, display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center', height: '100%' }}>
    //     {[{tab:'home',label:'Home',color:'#2563eb'},{tab:'data',label:'Data',color:'#f59e0b'},{tab:'logout',label:'Logout',color:'#dc2626'}].map(btn => (
    //       <button
    //         key={btn.tab}
    //         onClick={() => btn.tab==='logout'?navigate('/login'):setActiveTab(btn.tab)}
    //         style={{
    //           fontWeight: activeTab===btn.tab?'bold':'normal',
    //           color: btn.color,
    //           background: activeTab===btn.tab?'#e0e7ef':'none',
    //           border: 'none',
    //           textAlign: 'left',
    //           fontSize: 16,
    //           cursor: 'pointer',
    //           borderRadius: 8,
    //           padding: '8px 20px 8px 18px',
    //           marginBottom: 4,
    //           transition: 'background 0.2s',
    //           boxShadow: activeTab===btn.tab?'0 2px 8px rgba(0,0,0,0.04)':'none'
    //         }}
    //         onMouseOver={e=>e.currentTarget.style.background='#e0e7ef'}
    //         onMouseOut={e=>e.currentTarget.style.background=activeTab===btn.tab?'#e0e7ef':'none'}
    //       >{btn.label}</button>
    //     ))}
    <div className="min-h-screen bg-gray-100 w-full p-6 overflow-x-hidden">
  <h1 className="text-3xl font-bold text-gray-800 mb-2">
    Sales Representatives Dashboard
  </h1>
  <h2 className="text-gray-500 text-lg font-normal">Sales Representatives Analytics</h2>

  {/* ---- Horizontal tab buttons ---- */}
  <aside className="
      w-full border-b border-gray-200 px-2 sm:px-4 py-2
      flex gap-3 sm:gap-4 items-center overflow-x-auto no-scrollbar
    ">
    {[
      { tab: "home", label: "Home", color: "text-blue-600" },
      { tab: "data", label: "Data", color: "text-yellow-500" },
      { tab: "logout", label: "Logout", color: "text-red-600" },
    ].map((btn) => (
      <button
        key={btn.tab}
        onClick={() =>
          btn.tab === "logout" ? handleLogout(navigate) : setActiveTab(btn.tab)
        }
        className={`
          text-xs sm:text-sm md:text-base
          px-3 sm:px-4 py-2
          rounded-md font-medium whitespace-nowrap min-w-[160px] sm:min-w-[220px]
          flex-shrink-0
          ${btn.color}
          ${
            activeTab === btn.tab
              ? "bg-blue-100 font-semibold shadow"
              : "hover:bg-gray-100"
          }
          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1
        `}
      >
        {btn.label}
      </button>
    ))}
      </aside>
      <main style={{ flex: 1, padding: 0 }}>
        {activeTab === 'home' && (
          <Card title="Welcome">
            <div style={{padding:20}}>
              <h2 style={{fontWeight:'bold',fontSize:'1.2rem'}}>Sales Rep Home</h2>
              <p>Welcome to your dashboard.</p>
            </div>
          </Card>
        )}
        {activeTab === 'data' && (
          <Card title="My Leads">
            {leads.isLoading || statuses.isLoading
              ? <p>Loading...</p>
              : <LeadTable
                  leads={leads.data}
                  onOpen={onOpen}
                  onDelete={handleDelete}
                  statuses={statuses.data}
                  onStatusChange={handleStatusChange}
                />}
          </Card>
        )}
      </main>
    </div>
  );
}

