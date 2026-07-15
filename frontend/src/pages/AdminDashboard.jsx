import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Activity, Clock, CheckCircle2, 
  Search, Filter, ArrowUpDown, X, MapPin, 
  Check, AlertCircle, Loader2, ArrowRight, UserPlus 
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import API from '../services/api';

export const AdminDashboard = () => {
  const { showToast } = useAuth();

  // Data States
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');

  // Edit Drawer State
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [savingAction, setSavingAction] = useState(false);

  // Admin Action Form Fields
  const [actionStatus, setActionStatus] = useState('');
  const [actionDept, setActionDept] = useState('');
  const [actionPriority, setActionPriority] = useState('');
  const [actionOfficer, setActionOfficer] = useState('');
  const [actionRemarks, setActionRemarks] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all complaints
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await API.get('/complaints');
      setComplaints(response.data);
    } catch (err) {
      console.error('Error fetching admin complaints:', err);
      setError('Failed to fetch administrative complaints database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Fetch specific complaint details for edit drawer
  useEffect(() => {
    if (!selectedComplaintId) {
      setDrawerData(null);
      return;
    }

    const fetchDrawerDetails = async () => {
      setDrawerLoading(true);
      try {
        const response = await API.get(`/status/${selectedComplaintId}`);
        setDrawerData(response.data);

        // Prepopulate action fields
        setActionStatus(response.data.complaint.status || '');
        setActionDept(response.data.complaint.department || '');
        setActionPriority(response.data.complaint.priority || '');
        setActionOfficer(response.data.officerName === 'Not Assigned Yet' ? '' : response.data.officerName);
        setActionRemarks('');
      } catch (err) {
        console.error('Error loading drawer details:', err);
        showToast('error', 'Failed to retrieve complaint logs.');
        setSelectedComplaintId(null);
      } finally {
        setDrawerLoading(false);
      }
    };

    fetchDrawerDetails();
  }, [selectedComplaintId]);

  // Submit Admin Updates
  const handleAdminActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionStatus) {
      showToast('error', 'Status selection is required.');
      return;
    }

    setSavingAction(true);
    try {
      await API.put(`/complaints/${selectedComplaintId}`, {
        status: actionStatus,
        department: actionDept,
        priority: actionPriority,
        officerName: actionOfficer,
        remarks: actionRemarks
      });

      showToast('success', `Complaint ${selectedComplaintId} updated successfully.`);
      setSelectedComplaintId(null);
      
      // Refresh database listing
      fetchComplaints();
    } catch (err) {
      console.error('Error submitting admin action:', err);
      showToast('error', 'Failed to update complaint.');
    } finally {
      setSavingAction(false);
    }
  };

  // Stats Counters
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Pending' || c.status === 'Submitted').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

  // Filter & Search Logics
  const filteredComplaints = complaints
    .filter((c) => {
      const matchSearch = 
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.user && c.user.name && c.user.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchCategory = categoryFilter === 'All' || c.category === categoryFilter;
      const matchPriority = priorityFilter === 'All' || c.priority === priorityFilter;

      return matchSearch && matchStatus && matchCategory && matchPriority;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdTime);
      const dateB = new Date(b.createdTime);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  // Pagination Calculations
  const totalItems = filteredComplaints.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categories = [
    "Road Damage", "Street Light", "Garbage", "Water Leakage", 
    "Drainage", "Electricity", "Traffic", "Public Property", "Other"
  ];

  const departments = [
    "Public Works Department", "Electricity & Lighting Department", 
    "Sanitation & Waste Management", "Water Supply & Sewage Board", 
    "Electricity Distribution Corp", "Traffic Control & Police", 
    "Urban Land & Properties", "General City Administration"
  ];

  return (
    <div className="flex-1 flex flex-col gap-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Municipal Command Console</h1>
        <p className="text-slate-500 text-sm mt-1">Review citizen complaints, assign municipal departments, delegate field officers, and log remarks.</p>
      </div>

      {/* Aggregate Counts Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Dockets</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">{totalCount}</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pending Dispatch</span>
          <h3 className="text-2xl font-black text-amber-500 mt-1">{pendingCount}</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Field Work</span>
          <h3 className="text-2xl font-black text-blue-500 mt-1">{inProgressCount}</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Resolved Cases</span>
          <h3 className="text-2xl font-black text-emerald-500 mt-1">{resolvedCount}</h3>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search ID, title, details, or citizen name..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-slate-50/50 transition-all"
            />
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowUpDown size={16} />
            <span>Date: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-slate-50/50 cursor-pointer focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-slate-50/50 cursor-pointer focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</span>
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-slate-50/50 cursor-pointer focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main complaints Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between flex-1 min-h-[350px]">
        {loading ? (
          <div className="p-12 text-center text-slate-400 my-auto">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-3" />
            <p className="text-sm font-semibold">Loading command registry databases...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 my-auto">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center text-slate-400 my-auto">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <h4 className="text-base font-bold text-slate-700">No Complaints Registered</h4>
            <p className="text-xs max-w-xs mx-auto mt-1 leading-normal font-semibold">
              The query matching parameters returned no results.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Citizen</th>
                  <th className="px-6 py-4">Complaint Summary</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs font-semibold">
                {paginatedComplaints.map((comp, idx) => (
                  <tr 
                    key={idx} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedComplaintId(comp.id)}
                  >
                    <td className="px-6 py-4.5 font-bold text-slate-500">{comp.id}</td>
                    <td className="px-6 py-4.5 font-bold text-slate-700">{comp.user?.name || 'Unknown User'}</td>
                    <td className="px-6 py-4.5">
                      <div>
                        <div className="font-extrabold text-slate-800 truncate max-w-[180px] group-hover:text-primary-600 transition-colors">
                          {comp.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">{comp.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-slate-600 truncate max-w-[140px]">{comp.department}</td>
                    <td className="px-6 py-4.5">
                      <span className={`
                        px-2 py-0.5 text-[9px] font-bold rounded-full border
                        ${comp.priority === 'Emergency' && 'bg-rose-50 border-rose-100 text-rose-700'}
                        ${comp.priority === 'High' && 'bg-amber-50 border-amber-100 text-amber-700'}
                        ${comp.priority === 'Medium' && 'bg-blue-50 border-blue-100 text-blue-700'}
                        ${comp.priority === 'Low' && 'bg-slate-100 border-slate-200 text-slate-600'}
                      `}>
                        {comp.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`
                        px-2 py-0.5 text-[9px] font-bold rounded-full border
                        ${comp.status === 'Resolved' && 'bg-emerald-50 border-emerald-100 text-emerald-700'}
                        ${comp.status === 'In Progress' && 'bg-blue-50 border-blue-100 text-blue-700'}
                        ${comp.status === 'Pending' && 'bg-amber-50 border-amber-100 text-amber-700'}
                        ${comp.status === 'Rejected' && 'bg-red-50 border-red-100 text-red-700'}
                      `}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <span className="text-[10px] font-bold text-primary-600 group-hover:underline flex items-center justify-center gap-0.5">
                        <span>Review</span>
                        <ArrowRight size={10} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalItems > itemsPerPage && (
          <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/50">
            <span className="text-xs font-semibold text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3.5 py-1.5 border border-slate-250 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50 cursor-pointer transition-colors"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3.5 py-1.5 border border-slate-250 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50 cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Action Drawer Side Modal */}
      <AnimatePresence>
        {selectedComplaintId && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900"
              onClick={() => setSelectedComplaintId(null)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white h-screen shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div>
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Admin Review Panel</span>
                    <h3 className="text-base font-black text-slate-800">Docket: {selectedComplaintId}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedComplaintId(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Details Summary */}
                {drawerLoading ? (
                  <div className="p-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold">Retrieving database files...</p>
                  </div>
                ) : drawerData ? (
                  <div className="p-6 space-y-6">
                    
                    {/* Citizen Details */}
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Submitter Details</span>
                      <div className="flex gap-4 items-center bg-slate-50 border border-slate-100 p-3.5 rounded-2xl mt-1.5">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-extrabold flex items-center justify-center text-sm uppercase">
                          {drawerData.complaint.user?.name?.substring(0, 2)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{drawerData.complaint.user?.name}</h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{drawerData.complaint.user?.email}</span>
                          <span className="text-[10px] text-slate-400 block">{drawerData.complaint.user?.phoneNumber || 'No phone number'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Complaint Details */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Description Details</span>
                      <h4 className="text-sm font-bold text-slate-800 leading-snug">{drawerData.complaint.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                        {drawerData.complaint.description}
                      </p>
                    </div>

                    {/* Image Preview */}
                    {drawerData.images && drawerData.images.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Attached Reference Photo</span>
                        <div className="flex gap-2">
                          {drawerData.images.map((img, i) => (
                            <a 
                              key={i} 
                              href={`http://localhost:8080${img.imagePath}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200"
                            >
                              <img src={`http://localhost:8080${img.imagePath}`} alt="visual proof" className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Location Info */}
                    {drawerData.complaint.latitude && (
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">GIS Telemetry location</span>
                        <p className="text-xs text-slate-600 leading-normal font-semibold flex items-start gap-1">
                          <MapPin size={14} className="text-primary-500 mt-0.5 flex-shrink-0" />
                          <span>{drawerData.complaint.address}</span>
                        </p>
                      </div>
                    )}

                    {/* ACTION PANEL FORM */}
                    <form onSubmit={handleAdminActionSubmit} className="space-y-4 border-t border-slate-100 pt-5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Administrative Actions</span>
                      
                      {/* Priority and Status Selects */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Update Status</label>
                          <select
                            value={actionStatus}
                            onChange={(e) => setActionStatus(e.target.value)}
                            className="px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 cursor-pointer"
                          >
                            <option value="Pending">Pending Approval</option>
                            <option value="In Progress">In Progress / Dispatch</option>
                            <option value="Resolved">Resolved / Complete</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Update Priority</label>
                          <select
                            value={actionPriority}
                            onChange={(e) => setActionPriority(e.target.value)}
                            className="px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 cursor-pointer"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Emergency">Emergency</option>
                          </select>
                        </div>
                      </div>

                      {/* Assign Department */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Assign Department</label>
                        <select
                          value={actionDept}
                          onChange={(e) => setActionDept(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 cursor-pointer"
                        >
                          {departments.map((dept, i) => (
                            <option key={i} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      {/* Officer Name & Remarks */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Assign Field Officer</label>
                        <input
                          type="text"
                          value={actionOfficer}
                          onChange={(e) => setActionOfficer(e.target.value)}
                          placeholder="Enter officer full name (e.g. Officer Frank Miller)"
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Officer Remarks / Comments</label>
                        <textarea
                          value={actionRemarks}
                          onChange={(e) => setActionRemarks(e.target.value)}
                          rows={3}
                          placeholder="Provide remarks explaining updates (e.g. Pothole filler truck dispatched to site.)"
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 resize-y"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingAction}
                        className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 shadow-md shadow-primary-500/10 focus:outline-none transition-colors"
                      >
                        {savingAction ? (
                          <Loader2 size={13} className="animate-spin text-cyan-400" />
                        ) : (
                          <Check size={14} />
                        )}
                        <span>Update Docket Records</span>
                      </button>

                    </form>

                  </div>
                ) : (
                  <p className="p-8 text-center text-xs text-slate-400">Failed to render telemetry records.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
