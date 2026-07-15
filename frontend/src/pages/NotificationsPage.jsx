import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, CheckSquare, Loader2, AlertCircle, 
  Trash2, MailOpen, Calendar, ChevronRight 
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import API from '../services/api';

export const NotificationsPage = () => {
  const { showToast } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await API.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark single notification as read & navigate
  const handleNotificationClick = async (notif) => {
    if (notif.status === 'UNREAD') {
      try {
        await API.put(`/notifications/${notif.id}/read`);
        // update local state
        setNotifications((prev) => 
          prev.map((n) => n.id === notif.id ? { ...n, status: 'READ' } : n)
        );
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }

    // If notification links to a complaint, navigate to status
    if (notif.complaint && notif.complaint.id) {
      navigate(`/status?id=${notif.complaint.id}`);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (notifications.filter(n => n.status === 'UNREAD').length === 0) {
      showToast('info', 'No unread notifications.');
      return;
    }

    setMarkingAll(true);
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) => 
        prev.map((n) => ({ ...n, status: 'READ' }))
      );
      showToast('success', 'All notifications marked as read.');
    } catch (err) {
      console.error('Error marking all as read:', err);
      showToast('error', 'Failed to mark all as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showToast('success', 'Notification deleted successfully.');
    } catch (err) {
      console.error('Error deleting notification:', err);
      showToast('error', 'Failed to delete notification.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Notifications Log</h1>
          <p className="text-slate-500 text-sm mt-1">Stay updated with instant telemetry dispatches and resolution progress alerts.</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          disabled={loading || markingAll || notifications.length === 0}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md focus:outline-none transition-colors"
        >
          {markingAll ? (
            <Loader2 size={13} className="animate-spin text-cyan-400" />
          ) : (
            <CheckSquare size={14} />
          )}
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Main Alerts Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-[300px] flex flex-col">
        {loading ? (
          <div className="my-auto py-12 text-center text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-3" />
            <p className="text-sm font-semibold">Retrieving inbox notifications...</p>
          </div>
        ) : error ? (
          <div className="my-auto py-12 text-center text-red-500">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="my-auto py-12 text-center text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <h4 className="text-base font-bold text-slate-700">Inbox is Empty</h4>
            <p className="text-xs max-w-xs mx-auto mt-1 leading-normal">
              No notifications logged. Updates will appear here when your complaint status changes.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-150">
            {notifications.map((notif) => {
              const isUnread = notif.status === 'UNREAD';
              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`
                    px-6 py-4.5 flex gap-4.5 items-start cursor-pointer transition-colors relative
                    ${isUnread ? 'bg-primary-50/20 hover:bg-primary-50/40' : 'hover:bg-slate-50/50'}
                  `}
                >
                  {/* Unread Left Border Highlight */}
                  {isUnread && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600" />
                  )}

                  {/* Icon Circle */}
                  <div className={`
                    p-2.5 rounded-xl border flex-shrink-0 mt-0.5
                    ${isUnread 
                      ? 'bg-primary-50 border-primary-100 text-primary-600' 
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                    }
                  `}>
                    <Bell size={16} />
                  </div>

                  {/* Content details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className={`
                        text-xs font-bold leading-normal truncate
                        ${isUnread ? 'text-slate-900 font-extrabold' : 'text-slate-700'}
                      `}>
                        {notif.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold whitespace-nowrap">
                          <Calendar size={10} />
                          <span>{new Date(notif.createdTime).toLocaleString()}</span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteNotification(notif.id, e)}
                          className="p-1 rounded-md text-slate-450 hover:text-red-650 hover:bg-red-50 transition-colors focus:outline-none cursor-pointer"
                          title="Delete Notification"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p className={`
                      text-[11px] leading-relaxed mt-1
                      ${isUnread ? 'text-slate-700 font-semibold' : 'text-slate-500'}
                    `}>
                      {notif.message}
                    </p>
                    
                    {/* Related Ticket Link */}
                    {notif.complaint && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-primary-600 uppercase tracking-widest mt-2 hover:underline">
                        <span>View Complaint status ({notif.complaint.id})</span>
                        <ChevronRight size={10} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default NotificationsPage;
