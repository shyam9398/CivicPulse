import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, Search, History, 
  User, Bell, Settings, HelpCircle, LogOut, 
  ShieldAlert, Menu, X, Shield 
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import API from '../services/api';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch unread notification counts
  const fetchUnreadCount = async () => {
    try {
      const response = await API.get('/notifications/unread-count');
      setUnreadCount(response.data);
    } catch (err) {
      console.error('Error fetching unread notifications count:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll every 30 seconds for new alerts
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'ADMIN' ? [
    { name: 'Admin Console', path: '/admin', icon: Shield },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help', path: '/help', icon: HelpCircle },
  ] : [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Raise Complaint', path: '/complaint', icon: PlusCircle },
    { name: 'Track Status', path: '/status', icon: Search },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: true },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help', path: '/help', icon: HelpCircle },
  ];

  const activeClass = "bg-primary-600 text-white font-semibold shadow-md shadow-primary-500/10";
  const inactiveClass = "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Top Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 lg:hidden px-4 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-cyan-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-base font-bold text-slate-800 tracking-wide">CivicPulse</span>
          {user?.role === 'ADMIN' && (
            <span className="px-2 py-0.5 text-[9px] font-bold text-rose-500 bg-rose-50 border border-rose-100 rounded-full uppercase tracking-wider">
              Admin
            </span>
          )}
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <nav className="fixed top-16 left-0 bottom-0 w-72 bg-white border-r border-slate-200 flex flex-col justify-between p-5 animate-slideInRight shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center text-sm shadow-inner uppercase">
                  {user?.name?.substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {navItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-lg text-sm transition-all ${isActive ? activeClass : inactiveClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-3 mt-4 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100/70 rounded-lg cursor-pointer transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col justify-between sticky top-0 h-screen p-6 select-none shadow-sm flex-shrink-0">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary-600 to-cyan-500 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-slate-800 tracking-wide">CivicPulse</span>
            {user?.role === 'ADMIN' && (
              <span className="px-2 py-0.5 text-[9px] font-bold text-rose-500 bg-rose-50 border border-rose-100 rounded-full uppercase tracking-wider">
                Admin
              </span>
            )}
          </div>

          {/* Nav Items */}
          <div className="flex flex-col gap-1.5">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? activeClass : inactiveClass}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && unreadCount > 0 && (
                    <span className="w-5.5 h-5.5 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-extrabold flex items-center justify-center text-sm shadow-inner uppercase">
              {user?.name?.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl cursor-pointer focus:outline-none transition-all"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 min-w-0 flex flex-col p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
