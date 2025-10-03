// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import api from '../../services/api'
// import Card from '../../components/Card'
// import LeadTable from '../../components/LeadTable'
// import handleLogout from '../../logoutHandler'


// export default function TeamLeadDashboard() {
//   const qc = useQueryClient();
//   const nav = useNavigate();
//   const [activeTab, setActiveTab] = useState('home');
//   const [filter, setFilter] = useState('');
//   const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', source: '' });
//   const [successMsg, setSuccessMsg] = useState('');

//   // Fetch team info for Team Members tab
//   const teams = useQuery({ queryKey:['teams'], queryFn: async()=> (await api.get('/team')).data });
//   // Fetch leads and statuses for Data tab
//   const leadsQuery = useQuery({
//     queryKey: ['leads', filter],
//     queryFn: async () => {
//       const params = filter ? { status: filter } : {};
//       const { data } = await api.get('/leads', { params });
//       return data;
//     },
//     refetchInterval: 5000
//   });
//   const statusesQuery = useQuery({
//     queryKey: ['statuses'],
//     queryFn: async () => (await api.get('/statuses')).data
//   });
//   const deleteLead = useMutation({
//     mutationFn: async (id) => await api.delete(`/leads/${id}`),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] })
//   });
//   const onOpen = (lead) => nav(`/leads/${lead._id}`);
//   const handleDelete = (id) => {
//     if(window.confirm('Are you sure you want to delete this lead?')) {
//       deleteLead.mutate(id);
//     }
//   };
//   const statusMutation = useMutation({
//     mutationFn: async (payload) => (await api.post(`/leads/${payload.id}/status`, { statusName: payload.statusName })).data,
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['leads'] });
//     }
//   });
//   const handleStatusChange = (id, statusName) => {
//     statusMutation.mutate({ id, statusName });
//   };

//   return (
//     // <div style={{ display: 'flex', minHeight: '80vh' }}>
//     //   <aside style={{ width: 140, background: '#f8fafc', borderRight: '1px solid #eee', padding: 16, display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center', height: '100%' }}>
//     //     {[{tab:'home',label:'Home',color:'#2563eb'},{tab:'team',label:'Team Members',color:'#10b981'},{tab:'data',label:'Data Table',color:'#f59e0b'},{ tab: "follow-up", label: "Follow Up List", color: "#4709abff" },{tab:'logout',label:'Logout',color:'#dc2626'}].map(btn => (
//     //       <button
//     //         key={btn.tab}
//     //         onClick={() => btn.tab==='logout'?nav('/login'):setActiveTab(btn.tab)}
//     //         style={{
//     //           fontWeight: activeTab===btn.tab?'bold':'normal',
//     //           color: btn.color,
//     //           background: activeTab===btn.tab?'#e0e7ef':'none',
//     //           border: 'none',
//     //           textAlign: 'left',
//     //           fontSize: 16,
//     //           cursor: 'pointer',
//     //           borderRadius: 8,
//     //           padding: '8px 20px 8px 18px',
//     //           marginBottom: 4,
//     //           transition: 'background 0.2s',
//     //           boxShadow: activeTab===btn.tab?'0 2px 8px rgba(0,0,0,0.04)':'none'
//     //         }}
//     //         onMouseOver={e=>e.currentTarget.style.background='#e0e7ef'}
//     //         onMouseOut={e=>e.currentTarget.style.background=activeTab===btn.tab?'#e0e7ef':'none'}
//     //       >{btn.label}</button>
//     //     ))}
//     //   </aside>
//     //   <main style={{ flex: 1, padding: 0 }}>
//     //     {activeTab === 'home' && (
//     //       <Card title="Team Lead Analytics">
//     //         <div style={{padding:20}}>
//     //           <h2 style={{fontWeight:'bold',fontSize:'1.2rem'}}>Team Lead Dashboard</h2>
//     //           <p>Show charts, stats, and summary here.</p>
//     //         </div>
//     //       </Card>
//     //     )}
// <div className="min-h-screen bg-gray-100 w-full p-6 overflow-x-hidden">
//       <h1 className="text-3xl font-bold text-gray-800 mb-2">
//         Team Lead Dashboard
//       </h1>
//       <h2 style={{ color: "gray", fontWeight: "normal", fontSize: "1.2rem" }}>
//         Team Analytics
//       </h2>
//   <aside
//     style={{
//       width: '100%',
//       borderBottom: '1px solid #eee',
//       padding: '12px 16px',
//       display: 'flex',
//       gap: 16,
//       overflowX: 'auto',
//       alignItems: 'center',
//     }}
//   >
//     {[
//       { tab: 'home', label: 'Home', color: '#2563eb' },
//       { tab: 'team', label: 'Team Members', color: '#10b981' },
//       { tab: 'data', label: 'Data Table', color: '#f59e0b' },
//       { tab: 'follow-up', label: 'Follow Up List', color: '#4709abff' },
//       { tab: 'logout', label: 'Logout', color: '#dc2626' },
//     ].map((btn) => (
//       <button
//         key={btn.tab}
//         onClick={() =>
//           btn.tab === 'logout' ? handleLogout(nav) : setActiveTab(btn.tab)
//         }
//         style={{
//           flexShrink: 0,
//           minWidth: 140,
//           fontWeight: activeTab === btn.tab ? '600' : 'normal',
//           color: btn.color,
//           background: activeTab === btn.tab ? '#e0e7ef' : 'transparent',
//           border: 'none',
//           fontSize: 16,
//           cursor: 'pointer',
//           borderRadius: 8,
//           padding: '8px 20px',
//           transition: 'background 0.2s',
//           boxShadow:
//             activeTab === btn.tab ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
//         }}
//         onMouseOver={(e) => (e.currentTarget.style.background = '#e0e7ef')}
//         onMouseOut={(e) =>
//           (e.currentTarget.style.background =
//             activeTab === btn.tab ? '#e0e7ef' : 'transparent')
//         }
//       >
//         {btn.label}
//       </button>
//     ))}
//   </aside>

//   {/* ===== Main Content ===== */}
//   <main style={{ flex: 1, padding: '20px' }}>
//     {activeTab === 'home' && (
//       <Card title="Team Analytics">
//         <p>Show charts, stats, and summary here.</p>
        
//       </Card>
//     )}
//         {activeTab === 'team' && (
//           <Card title="Team Members">
//             <ul className="text-sm space-y-1">
//               {teams.data?.map(t => (
//                 <li key={t._id}>
//                   <div><strong>{t.name}</strong> — Lead: {t.lead?.name||'-'} · Members: {t.members?.length||0}</div>
//                   <div style={{marginLeft:16, fontSize:13, color:'#555'}}>
//                     Members: {t.members?.map(m => m.name).join(', ') || '-'}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </Card>
//         )}
//         {activeTab === "follow-up" && (
//                   <Card
//                     title="Follow-Up list"
//                     style={{ marginLeft: 0, paddingLeft: 0 }}
//                   >
//                     <div style={{ width: "100%", overflowX: "auto" }}>
//                       <div
//                         style={{
//                           background: "#fff",
//                           borderRadius: 10,
//                           padding: 18,
//                           boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
//                           width: "100%",
//                           border: "1px solid #eee",
//                         }}
//                       >
//                         {leadsQuery.isLoading ? (
//                           <p>Loading...</p>
//                         ) : (
//                           <LeadTable
//                             leads={leadsQuery.data.filter(
//                               (lead) => lead.status?.name === "Follow-Up"
//                             )}
//                             onOpen={onOpen}
//                             onDelete={handleDelete}
//                             statuses={statusesQuery.data}
//                             onStatusChange={handleStatusChange}
//                           />
//                         )}
//                       </div>
//                     </div>
//                   </Card>
//                 )}
//         {activeTab === 'data' && (
//           <Card title="All Leads" style={{marginLeft:0, paddingLeft:0}}>
//             {/* Filter + Refresh */}
//             <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
//               <select
//                 onChange={e => setFilter(e.target.value)}
//                 defaultValue=""
//                 style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', minWidth: 140, fontSize: 15 }}
//               >
//                 <option value="">All Statuses</option>
//                 {statusesQuery.data?.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
//               </select>
//               <button
//                 style={{
//                   padding: '10px 18px',
//                   background: '#10b981',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: 8,
//                   cursor: 'pointer',
//                   fontWeight: 'bold',
//                   fontSize: 15,
//                   boxShadow: '0 2px 8px rgba(16,185,129,0.08)'
//                 }}
//                 onClick={() => qc.invalidateQueries({ queryKey: ['leads'] })}
//               >
//                 Refresh
//               </button>
//             </div>

//             {/* Table */}
//             <div style={{ width: '100%', overflowX: 'auto' }}>
//               <div
//                 style={{
//                   background: '#fff',
//                   borderRadius: 10,
//                   padding: 18,
//                   boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
//                   width: '100%',
//                   border: '1px solid #eee'
//                 }}
//               >
//                 {leadsQuery.isLoading
//                   ? <p>Loading...</p>
//                   : <LeadTable leads={leadsQuery.data} onOpen={onOpen} onDelete={handleDelete} statuses={statusesQuery.data} onStatusChange={handleStatusChange} />}
//               </div>
//             </div>
//           </Card>
//         )}
//       </main>
//     </div>
//   )
// }

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Card from '../../components/Card'
import LeadTable from '../../components/LeadTable'
import handleLogout from '../../logoutHandler'


export default function TeamLeadDashboard() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', source: '' });
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch team info for Team Members tab
  const teams = useQuery({ queryKey:['teams'], queryFn: async()=> (await api.get('/team')).data });
  // Fetch leads and statuses for Data tab
  const leadsQuery = useQuery({
    queryKey: ['leads', filter],
    queryFn: async () => {
      const params = filter ? { status: filter } : {};
      const { data } = await api.get('/leads', { params });
      return data;
    },
    refetchInterval: 5000
  });
  const myTeamQuery = useQuery({
    queryKey: ['myTeam'],
    queryFn: async () => {
      try {
        // Get user role from token
        const user = JSON.parse(localStorage.getItem('user'));
        const isAdmin = user?.roleName === 'Admin';
        
        // If admin, add teamId as query parameter (you can get this from URL or state)
        const endpoint = '/team/my-team' + (isAdmin ? '?viewAll=true' : '');
        const response = await api.get(endpoint);
        return response.data;
      } catch (error) {
        console.error('Error fetching team data:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch team data');
      }
    },
    retry: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('My Team Data:', myTeamQuery.data);

  const statusesQuery = useQuery({
    queryKey: ['statuses'],
    queryFn: async () => (await api.get('/statuses')).data
  });
  const deleteLead = useMutation({
    mutationFn: async (id) => await api.delete(`/leads/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] })
  });
  const onOpen = (lead) => nav(`/leads/${lead._id}`);
  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this lead?')) {
      deleteLead.mutate(id);
    }
  };
  const statusMutation = useMutation({
    mutationFn: async (payload) => (await api.post(`/leads/${payload.id}/status`, { statusName: payload.statusName })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
    }
  });
  const handleStatusChange = (id, statusName) => {
    statusMutation.mutate({ id, statusName });
  };

  return (
    // <div style={{ display: 'flex', minHeight: '80vh' }}>
    //   <aside style={{ width: 140, background: '#f8fafc', borderRight: '1px solid #eee', padding: 16, display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center', height: '100%' }}>
    //     {[{tab:'home',label:'Home',color:'#2563eb'},{tab:'team',label:'Team Members',color:'#10b981'},{tab:'data',label:'Data Table',color:'#f59e0b'},{ tab: "follow-up", label: "Follow Up List", color: "#4709abff" },{tab:'logout',label:'Logout',color:'#dc2626'}].map(btn => (
    //       <button
    //         key={btn.tab}
    //         onClick={() => btn.tab==='logout'?nav('/login'):setActiveTab(btn.tab)}
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
    //   </aside>
    //   <main style={{ flex: 1, padding: 0 }}>
    //     {activeTab === 'home' && (
    //       <Card title="Team Lead Analytics">
    //         <div style={{padding:20}}>
    //           <h2 style={{fontWeight:'bold',fontSize:'1.2rem'}}>Team Lead Dashboard</h2>
    //           <p>Show charts, stats, and summary here.</p>
    //         </div>
    //       </Card>
    //     )}
<div className="min-h-screen bg-gray-100 w-full p-6 overflow-x-hidden">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Team Lead Dashboard
      </h1>
      <h2 style={{ color: "gray", fontWeight: "normal", fontSize: "1.2rem" }}>
        Team Analytics
      </h2>
  <aside
    style={{
      width: '100%',
      borderBottom: '1px solid #eee',
      padding: '12px 16px',
      display: 'flex',
      gap: 16,
      overflowX: 'auto',
      alignItems: 'center',
    }}
  >
    {[
      { tab: 'home', label: 'Home', color: '#2563eb' },
      { tab: 'team', label: 'Team Members', color: '#10b981' },
      { tab: 'data', label: 'Data Table', color: '#f59e0b' },
      { tab: 'follow-up', label: 'Follow Up List', color: '#4709abff' },
      { tab: 'logout', label: 'Logout', color: '#dc2626' },
    ].map((btn) => (
      <button
        key={btn.tab}
        onClick={() =>
          btn.tab === 'logout' ? handleLogout(nav) : setActiveTab(btn.tab)
        }
        style={{
          flexShrink: 0,
          minWidth: 140,
          fontWeight: activeTab === btn.tab ? '600' : 'normal',
          color: btn.color,
          background: activeTab === btn.tab ? '#e0e7ef' : 'transparent',
          border: 'none',
          fontSize: 16,
          cursor: 'pointer',
          borderRadius: 8,
          padding: '8px 20px',
          transition: 'background 0.2s',
          boxShadow:
            activeTab === btn.tab ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = '#e0e7ef')}
        onMouseOut={(e) =>
          (e.currentTarget.style.background =
            activeTab === btn.tab ? '#e0e7ef' : 'transparent')
        }
      >
        {btn.label}
      </button>
    ))}
  </aside>

  {/* ===== Main Content ===== */}
  <main style={{ flex: 1, padding: '20px' }}>
    {/* {activeTab === 'home' && (
      <Card title="Team Analytics">
        <p>Show charts, stats, and summary here.</p>
        
      </Card>
    )} */}
    {activeTab === 'home' && (
  <Card title="Team Lead Analytics">
    <div style={{padding:20}}>
      {myTeamQuery.isLoading && <p>Loading team summary...</p>}
      {myTeamQuery.isError && <p style={{color: '#dc2626'}}>Error loading team data.</p>}
      
      {myTeamQuery.data && (
        <>
          <h2 style={{fontWeight:'bold',fontSize:'1.2rem', marginBottom: '10px'}}>
            {myTeamQuery.data.name} Dashboard
          </h2>
          <p>
            Manager: {myTeamQuery.data.manager?.name || 'N/A'}
          </p>
          <p>
            Total Members: {myTeamQuery.data.members?.length || 0}
          </p>
          <p>
            Assigned Leads: {myTeamQuery.data.leadsAssigned?.length || 0}
          </p>
        </>
      )}
      <p style={{marginTop: '20px'}}>Show charts, stats, and summary here.</p>
    </div>
  </Card>
)}

        {/* {activeTab === 'team' && (
          <Card title="Team Members">
            <ul className="text-sm space-y-1">
              {teams.data?.map(t => (
                <li key={t._id}>
                  <div><strong>{t.name}</strong> — Lead: {t.lead?.name||'-'} · Members: {t.members?.length||0}</div>
                  <div style={{marginLeft:16, fontSize:13, color:'#555'}}>
                    Members: {t.members?.map(m => m.name).join(', ') || '-'}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )} */}

{activeTab === 'team' && (
  <Card title="Team Members">
    {myTeamQuery.isLoading ? (
      <p>Loading team member data...</p>
    ) : myTeamQuery.isError ? (
      <p style={{ color: '#dc2626' }}>
        Failed to load team data: {myTeamQuery.error.response?.data?.message || 'Server Error'}
      </p>
    ) : myTeamQuery.data ? (
      <div style={{padding: '0 20px'}}>
        <h3 style={{ marginBottom: 10, fontWeight: 'bold' }}>Team: {myTeamQuery.data.name}</h3>
        <p style={{ marginBottom: 10 }}>Manager: {myTeamQuery.data.manager.name} ({myTeamQuery.data.manager.email})</p>
        <p style={{ marginBottom: 20 }}>Team Lead (You): {myTeamQuery.data.lead.name} ({myTeamQuery.data.lead.email})</p>

        <h4 style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: 5, marginBottom: 10 }}>
          Sales Representatives ({myTeamQuery.data.members.length})
        </h4>
        <ul className="text-sm space-y-1" style={{ listStyle: 'disc', marginLeft: 20 }}>
          {myTeamQuery.data.members.map(member => (
            <li key={member._id} style={{ marginBottom: 4 }}>
              <strong style={{ color: '#10b981' }}>{member.name}</strong> - {member.email}
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <p>No team information available for this user.</p>
    )}
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
                          background: "#fff",
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
        {activeTab === 'data' && (
          <Card title="All Leads" style={{marginLeft:0, paddingLeft:0}}>
            {/* Filter + Refresh */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <select
                onChange={e => setFilter(e.target.value)}
                defaultValue=""
                style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', minWidth: 140, fontSize: 15 }}
              >
                <option value="">All Statuses</option>
                {statusesQuery.data?.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
              <button
                style={{
                  padding: '10px 18px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: 15,
                  boxShadow: '0 2px 8px rgba(16,185,129,0.08)'
                }}
                onClick={() => qc.invalidateQueries({ queryKey: ['leads'] })}
              >
                Refresh
              </button>
            </div>

            {/* Table */}
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <div
                style={{
                  background: '#fff',
                  borderRadius: 10,
                  padding: 18,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  width: '100%',
                  border: '1px solid #eee'
                }}
              >
                {leadsQuery.isLoading
                  ? <p>Loading...</p>
                  : <LeadTable leads={leadsQuery.data} onOpen={onOpen} onDelete={handleDelete} statuses={statusesQuery.data} onStatusChange={handleStatusChange} />}
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
