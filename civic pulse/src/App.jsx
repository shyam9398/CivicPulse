import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import { 
  LogOut, LayoutDashboard, Brain, Activity, 
  Settings, Users, ShieldAlert, CheckCircle2, 
  MapPin, Clock, PlusCircle
} from 'lucide-react';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
          <p className="text-sm font-semibold tracking-wider text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Premium Dashboard Mockup View
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const metrics = [
    { title: 'AI-Sorted Reports', value: '1,284', change: '+14% this week', icon: Brain, color: 'text-primary-500 bg-primary-50' },
    { title: 'Active Dispatch Units', value: '18', change: 'Live tracking active', icon: Activity, color: 'text-cyan-500 bg-cyan-50' },
    { title: 'Avg. Response Time', value: '6.2m', change: '-2.4m efficiency', icon: Clock, color: 'text-amber-500 bg-amber-50' },
    { title: 'Civic Approval Rate', value: '96.4%', change: '+1.2% sentiment', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
  ];

  const recentIncidents = [
    { id: 'INC-2041', category: 'Infrastructure', title: 'Water Main Leak near Main St.', time: '12 mins ago', status: 'Dispatched', priority: 'High', location: 'District 4' },
    { id: 'INC-2040', category: 'Environment', title: 'Illegal Waste Disposal reported by AI camera', time: '45 mins ago', status: 'Analyzing', priority: 'Medium', location: 'District 1' },
    { id: 'INC-2039', category: 'Public Safety', title: 'Traffic Signal Malfunction at 5th Ave', time: '1 hr ago', status: 'Resolved', priority: 'Critical', location: 'District 3' },
    { id: 'INC-2038', category: 'Utilities', title: 'Power Grid fluctuation in industrial park', time: '3 hrs ago', status: 'Pending', priority: 'Low', location: 'District 7' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-cyan-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-wide">CivicPulse</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden sm:flex text-right">
              <span className="text-sm font-semibold text-slate-800">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="py-2 px-3 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-100"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Municipal Console</h1>
            <p className="text-sm text-slate-500 mt-1">Hello, {user?.name}. Operations are normal. 1 new priority incident requires dispatch.</p>
          </div>
          <button 
            onClick={() => alert('Simulating adding a new incident report...')}
            className="py-2.5 px-4 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md shadow-primary-500/10 cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary-500/25 transition-all"
          >
            <PlusCircle size={16} />
            <span>Create Dispatch</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{metric.title}</p>
                    <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{metric.value}</h3>
                  </div>
                  <div className={`p-2.5 rounded-xl ${metric.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {metric.change.split(' ')[0]}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {metric.change.substring(metric.change.indexOf(' ') + 1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Incidents Log */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-800">AI Dispatch Logs</h2>
              <p className="text-xs text-slate-500 mt-0.5">List of live incident feeds sorted by AI Priority Score.</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-100 rounded-full">
              4 Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Incident Title</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-sm">
                {recentIncidents.map((incident, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-500">{incident.id}</td>
                    <td className="px-6 py-4 text-slate-600 flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" />
                      {incident.location}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-slate-800">{incident.title}</div>
                        <div className="text-xs text-slate-400 font-medium">{incident.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        px-2 py-0.5 text-xs font-semibold rounded-full border
                        ${incident.priority === 'Critical' && 'bg-rose-50 border-rose-100 text-rose-700'}
                        ${incident.priority === 'High' && 'bg-amber-50 border-amber-100 text-amber-700'}
                        ${incident.priority === 'Medium' && 'bg-blue-50 border-blue-100 text-blue-700'}
                        ${incident.priority === 'Low' && 'bg-slate-100 border-slate-200 text-slate-600'}
                      `}>
                        {incident.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full 
                          ${incident.status === 'Resolved' && 'bg-emerald-500'}
                          ${incident.status === 'Dispatched' && 'bg-amber-500'}
                          ${incident.status === 'Analyzing' && 'bg-blue-500'}
                          ${incident.status === 'Pending' && 'bg-slate-400'}
                        `} />
                        <span className="font-medium text-slate-700">{incident.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400 font-medium">{incident.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

// Main Routing App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          {/* Fallbacks */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
