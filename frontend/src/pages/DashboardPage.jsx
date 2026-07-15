import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlusCircle, Search, History, User, 
  AlertCircle, CheckCircle2, Clock, Activity, 
  MapPin, Bell, ChevronRight, Calendar, ShieldAlert
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import API from '../services/api';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [complaintsRes, notificationsRes] = await Promise.all([
          API.get('/complaints'),
          API.get('/notifications')
        ]);
        setComplaints(complaintsRes.data);
        setNotifications(notificationsRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-6 animate-pulse select-none">
        <div className="h-32 bg-white border border-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white border border-slate-200 rounded-xl"></div>
          <div className="h-96 bg-white border border-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-red-800">Error Loading Dashboard</h3>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Calculate Metrics from raw data
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Pending' || c.status === 'Submitted').length;
  const verifiedCount = complaints.filter(c => c.status === 'Verified').length;
  const assignedCount = complaints.filter(c => c.status === 'Assigned').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Work Started' || c.status === 'WorkStarted').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const rejectedCount = complaints.filter(c => c.status === 'Rejected').length;

  const metrics = [
    { title: 'Total Complaints', value: totalCount, icon: Activity, color: 'text-primary-600 bg-primary-50 border-primary-100' },
    { title: 'Pending', value: pendingCount, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { title: 'Verified', value: verifiedCount, icon: CheckCircle2, color: 'text-teal-650 bg-teal-50 border-teal-100' },
    { title: 'Assigned', value: assignedCount, icon: User, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { title: 'In Progress', value: inProgressCount, icon: Activity, color: 'text-indigo-650 bg-indigo-50 border-indigo-105' },
    { title: 'Resolved', value: resolvedCount, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { title: 'Rejected', value: rejectedCount, icon: ShieldAlert, color: 'text-rose-650 bg-rose-50 border-rose-100' },
  ];

  // Group Complaints by Category (14 production categories)
  const categoriesList = [
    "Pothole", "Garbage", "Water Leakage", "Road Damage", 
    "Broken Drain", "Open Manhole", "Fallen Tree", "Street Light Failure", 
    "Electric Pole Damage", "Illegal Dumping", "Traffic Signal Damage", 
    "Construction Waste", "Sewage Overflow", "Damaged Footpath"
  ];
  const categoryCounts = categoriesList.reduce((acc, cat) => {
    acc[cat] = complaints.filter(c => c.category === cat).length;
    return acc;
  }, {});
  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  // Group Complaints by Priority
  const prioritiesList = ["Low", "Medium", "High", "Emergency"];
  const priorityCounts = prioritiesList.reduce((acc, prio) => {
    acc[prio] = complaints.filter(c => c.priority === prio).length;
    return acc;
  }, {});
  const maxPriorityCount = Math.max(...Object.values(priorityCounts), 1);

  // Group Complaints by Month of current year
  const monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyCounts = monthsList.reduce((acc, month, idx) => {
    acc[month] = complaints.filter(c => {
      if (!c.createdTime) return false;
      const date = new Date(c.createdTime);
      return date.getMonth() === idx && date.getFullYear() === new Date().getFullYear();
    }).length;
    return acc;
  }, {});
  const maxMonthlyCount = Math.max(...Object.values(monthlyCounts), 1);

  // Group Complaints by Department
  const deptCounts = complaints.reduce((acc, c) => {
    if (c.department) {
      acc[c.department] = (acc[c.department] || 0) + 1;
    }
    return acc;
  }, {});
  const deptsSorted = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  // Format today's date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex-1 flex flex-col gap-6">
      
      {/* Welcome Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_-20%,#c2dbff_0%,transparent_40%)] opacity-35"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="text-slate-500 text-sm mt-1">
            {user?.role === 'ADMIN' 
              ? 'Administrator dashboard. Monitor incoming reports and dispatch municipal personnel.'
              : 'Keep track of your civic complaints and check real-time resolution timelines.'
            }
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 shadow-inner">
          <Calendar size={14} className="text-slate-400" />
          <span>{today}</span>
        </div>
      </div>

      {/* Quick Actions */}
      {user?.role !== 'ADMIN' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/complaint" className="bg-white border border-slate-200 hover:border-primary-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 group">
            <div className="p-3 rounded-xl bg-primary-50 text-primary-600 group-hover:scale-105 transition-transform">
              <PlusCircle size={22} />
            </div>
            <span className="text-xs font-bold text-slate-700">Raise Complaint</span>
          </Link>
          <Link to="/status" className="bg-white border border-slate-200 hover:border-primary-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 group">
            <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600 group-hover:scale-105 transition-transform">
              <Search size={22} />
            </div>
            <span className="text-xs font-bold text-slate-700">Track Status</span>
          </Link>
          <Link to="/history" className="bg-white border border-slate-200 hover:border-primary-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 group">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <History size={22} />
            </div>
            <span className="text-xs font-bold text-slate-700">My History</span>
          </Link>
          <Link to="/profile" className="bg-white border border-slate-200 hover:border-primary-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 group">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <User size={22} />
            </div>
            <span className="text-xs font-bold text-slate-700">My Profile</span>
          </Link>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-sm min-h-[105px]">
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">{m.title}</span>
                <div className={`p-1.5 rounded-lg border flex-shrink-0 ${m.color}`}>
                  <Icon size={13} />
                </div>
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mt-2">{m.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Monthly Complaints (Bar Chart) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800">Monthly Complaints</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Complaints registered in {new Date().getFullYear()}.</p>
          
          <div className="flex-1 flex items-end justify-between gap-1 h-56 mt-6 px-1 pb-1">
            {monthsList.map((month, idx) => {
              const count = monthlyCounts[month];
              const pct = (count / maxMonthlyCount) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="w-full relative flex justify-center items-end h-[80%]">
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] font-bold px-1 py-0.5 rounded shadow-sm pointer-events-none z-15">
                      {count}
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="w-full max-w-[10px] rounded-t bg-gradient-to-t from-primary-600 to-indigo-400 cursor-pointer hover:brightness-110 transition-all"
                    />
                  </div>
                  <span className="text-[8px] font-bold text-slate-400">{month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Category Distribution (Horizontal Bar List for 14 Categories) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col max-h-[302px]">
          <h3 className="text-sm font-bold text-slate-800">Category Distribution</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Distribution across major issue types.</p>
          
          <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2.5">
            {categoriesList.map((cat, idx) => {
              const count = categoryCounts[cat];
              const pct = totalCount ? (count / totalCount) * 100 : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-650">
                    <span className="truncate max-w-[160px]">{cat}</span>
                    <span>{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Priority Distribution (Vertical Bar Chart) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800">Priority Distribution</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Incident severity classification metrics.</p>
          
          <div className="flex-1 flex items-end justify-around gap-4 h-56 mt-6 px-2 pb-2">
            {prioritiesList.map((prio, idx) => {
              const count = priorityCounts[prio];
              const pct = (count / maxPriorityCount) * 100;
              let barColor = "from-slate-500 to-slate-400";
              if (prio === "Emergency") barColor = "from-rose-600 to-rose-450";
              else if (prio === "High") barColor = "from-amber-500 to-amber-400";
              else if (prio === "Medium") barColor = "from-blue-500 to-blue-400";
              
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group min-w-[40px]">
                  <div className="w-full relative flex justify-center items-end h-[80%]">
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm pointer-events-none z-15">
                      {count}
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className={`w-8 rounded-t bg-gradient-to-t ${barColor} cursor-pointer hover:brightness-110 transition-all`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{prio}</span>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>

      {/* Grid: Recent Table & Recent Notifications / Dept Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Recent Complaints Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="px-6 py-5 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-800">Recent Complaints Log</h3>
                <p className="text-xs text-slate-400 mt-0.5">Quick overview of your latest submissions.</p>
              </div>
              <Link to="/history" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-0.5 hover:underline">
                <span>View All</span>
                <ChevronRight size={14} />
              </Link>
            </div>
            
            {complaints.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No complaints logged yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Incident Title</th>
                      <th className="px-6 py-3">Department</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-xs font-medium">
                    {complaints.slice(0, 5).map((comp, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/status?id=${comp.id}`)}
                      >
                        <td className="px-6 py-3.5 font-bold text-slate-500">{comp.id}</td>
                        <td className="px-6 py-3.5 text-slate-700">
                          <div>
                            <div className="font-bold truncate max-w-[160px]">{comp.title}</div>
                            <div className="text-[10px] text-slate-400 font-semibold">{comp.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 truncate max-w-[140px]">{comp.department}</td>
                        <td className="px-6 py-3.5">
                          <span className={`
                            px-2 py-0.5 text-[10px] font-bold rounded-full border
                            ${comp.status === 'Resolved' && 'bg-emerald-50 border-emerald-100 text-emerald-700'}
                            ${comp.status === 'In Progress' && 'bg-blue-50 border-blue-100 text-blue-700'}
                            ${comp.status === 'Pending' && 'bg-amber-50 border-amber-100 text-amber-700'}
                            ${comp.status === 'Rejected' && 'bg-red-50 border-red-100 text-red-700'}
                          `}>
                            {comp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Recent Notifications / Department performance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Notifications</h3>
            <p className="text-xs text-slate-400 mt-0.5">Immediate updates from municipal offices.</p>

            <div className="mt-5 space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No new updates.</p>
                </div>
              ) : (
                notifications.slice(0, 3).map((notif, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                    <div className="p-1.5 rounded-lg bg-primary-50 text-primary-500 flex-shrink-0 mt-0.5">
                      <Bell size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{notif.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5 line-clamp-2">{notif.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Department-wise load list */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Top Departments load</h4>
            <div className="space-y-2.5">
              {deptsSorted.length === 0 ? (
                <p className="text-xs text-slate-400">No departments assigned yet.</p>
              ) : (
                deptsSorted.map(([dept, count], idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span className="truncate max-w-[180px]">{dept}</span>
                      <span>{count} {count === 1 ? 'case' : 'cases'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-500 to-cyan-400"
                        style={{ width: `${(count / totalCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardPage;
