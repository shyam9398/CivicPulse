import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, ArrowUpDown, Download, 
  MapPin, Clock, CheckCircle2, X, AlertCircle, 
  Calendar, User, ShieldAlert, FileText, ChevronRight 
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import API from '../services/api';
import { jsPDF } from 'jspdf';

export const HistoryPage = () => {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  // Data States
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc'); // desc: newest first, asc: oldest first

  // Details Modal State
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch history list
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Get user's own complaint history
        const response = await API.get(`/history/user/${user.id}`);
        setComplaints(response.data);
      } catch (err) {
        console.error('Error fetching complaint history:', err);
        setError('Failed to fetch complaint history.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchHistory();
    }
  }, [user]);

  // Fetch full details & timeline when selecting a row
  useEffect(() => {
    if (!selectedComplaintId) {
      setModalData(null);
      return;
    }

    const fetchDetails = async () => {
      setModalLoading(true);
      try {
        const response = await API.get(`/status/${selectedComplaintId}`);
        setModalData(response.data);
      } catch (err) {
        console.error('Error fetching details in modal:', err);
        showToast('error', 'Failed to retrieve complaint timeline.');
        setSelectedComplaintId(null);
      } finally {
        setModalLoading(false);
      }
    };

    fetchDetails();
  }, [selectedComplaintId]);

  // Handle Receipt PDF Download
  const handleDownloadPDF = (complaint) => {
    try {
      const doc = new jsPDF();
      
      // Branding Header
      doc.setFillColor(11, 19, 43); // Dark Navy background
      doc.rect(0, 0, 210, 42, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("CIVICPULSE INCIDENT RECEIPT", 15, 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Smart Civic Complaint Management System - Official Receipt Document", 15, 30);
      
      // Separator Line
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 50, 195, 50);
      
      // Body Fields Setup
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text("Incident Docket Details:", 15, 60);

      doc.setFontSize(10);
      let y = 72;
      
      const drawField = (label, value) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, 15, y);
        doc.setFont("helvetica", "normal");
        doc.text(value || 'N/A', 60, y);
        y += 10;
      };

      drawField("Complaint ID", complaint.id);
      drawField("Date Submitted", new Date(complaint.createdTime).toLocaleString());
      drawField("Category", complaint.category);
      drawField("Priority Status", complaint.priority);
      drawField("Assigned Dept", complaint.department);
      drawField("Resolution Status", complaint.status);
      
      // Title wrap
      doc.setFont("helvetica", "bold");
      doc.text("Complaint Title:", 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(complaint.title || '', 60, y, { maxWidth: 130 });
      y += 12;

      // Description wrap
      doc.setFont("helvetica", "bold");
      doc.text("Full Description:", 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(complaint.description || '', 60, y, { maxWidth: 130 });
      y += 24;

      // GPS location
      doc.setFont("helvetica", "bold");
      doc.text("GPS Telemetry:", 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(`Latitude: ${complaint.latitude || 'N/A'}, Longitude: ${complaint.longitude || 'N/A'}`, 60, y);
      y += 10;

      // Address wrap
      doc.setFont("helvetica", "bold");
      doc.text("Incident Address:", 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(complaint.address || '', 60, y, { maxWidth: 130 });
      y += 22;

      // Footer notice
      doc.line(15, y, 195, y);
      y += 10;
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("This receipt serves as official proof of submission. Keep the Docket ID for tracking references.", 15, y);
      
      // Save trigger
      doc.save(`CivicPulse_Receipt_${complaint.id}.pdf`);
      showToast('success', 'PDF Receipt downloaded successfully.');
    } catch (err) {
      console.error('Error generating PDF:', err);
      showToast('error', 'Failed to generate PDF. Please try again.');
    }
  };

  // Filter and Search logic
  const filteredComplaints = complaints
    .filter((c) => {
      const matchSearch = 
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
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

  // Pagination calculations
  const totalItems = filteredComplaints.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categories = [
    "Pothole", "Garbage", "Water Leakage", "Road Damage", 
    "Broken Drain", "Open Manhole", "Fallen Tree", "Street Light Failure", 
    "Electric Pole Damage", "Illegal Dumping", "Traffic Signal Damage", 
    "Construction Waste", "Sewage Overflow", "Damaged Footpath"
  ];

  return (
    <div className="flex-1 flex flex-col gap-6">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Complaint History</h1>
        <p className="text-slate-500 text-sm mt-1">Review all your submitted reports, download receipts, and view live resolution updates.</p>
      </div>

      {/* Search & Filter Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Search box */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search by ID, title, or details..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-slate-50/50 transition-all"
            />
          </div>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowUpDown size={16} />
            <span>Date: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>

        {/* Categories, Priority, Status Dropdowns */}
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

      {/* Main Content: Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between flex-1 min-h-[300px]">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-3" />
            <p className="text-sm font-semibold">Loading complaint history...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center text-slate-400 my-auto">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <h4 className="text-base font-bold text-slate-700">No Incidents Found</h4>
            <p className="text-xs max-w-xs mx-auto mt-1 leading-normal">
              No complaint matches the search query or filters. Adjust options to expand searching.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Complaint details</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Date Sub.</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-sm font-medium">
                {paginatedComplaints.map((comp, idx) => (
                  <tr 
                    key={idx} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/status?id=${comp.id}`)}
                  >
                    <td className="px-6 py-4.5 font-bold text-slate-500">{comp.id}</td>
                    <td className="px-6 py-4.5">
                      <div>
                        <div className="font-bold text-slate-800 truncate max-w-[200px] group-hover:text-primary-600 transition-colors">
                          {comp.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">{comp.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-slate-600 max-w-[150px] truncate">{comp.department}</td>
                    <td className="px-6 py-4.5 text-slate-500 text-xs">
                      {new Date(comp.createdTime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`
                        px-2 py-0.5 text-[10px] font-bold rounded-full border
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
                        px-2 py-0.5 text-[10px] font-bold rounded-full border
                        ${comp.status === 'Resolved' && 'bg-emerald-50 border-emerald-100 text-emerald-700'}
                        ${comp.status === 'In Progress' && 'bg-blue-50 border-blue-100 text-blue-700'}
                        ${comp.status === 'Pending' && 'bg-amber-50 border-amber-100 text-amber-700'}
                        ${comp.status === 'Rejected' && 'bg-red-50 border-red-100 text-red-700'}
                      `}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDownloadPDF(comp)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-primary-400 hover:bg-primary-50 text-slate-500 hover:text-primary-600 cursor-pointer focus:outline-none transition-all"
                        title="Download Receipt PDF"
                      >
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
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

      {/* Details Side Modal Drawer */}
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

            {/* Modal Box */}
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
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Complaint File</span>
                    <h3 className="text-base font-black text-slate-800">{selectedComplaintId}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedComplaintId(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Body Content */}
                {modalLoading ? (
                  <div className="p-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold">Gathering tracking metrics...</p>
                  </div>
                ) : modalData ? (
                  <div className="p-6 space-y-6">
                    {/* General Info */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Incident Summary</span>
                      <h4 className="text-base font-bold text-slate-800 leading-snug">{modalData.complaint.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                        {modalData.complaint.description}
                      </p>
                    </div>

                    {/* Meta stats */}
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">Category</span>
                        <span className="text-slate-800">{modalData.complaint.category}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">Priority Status</span>
                        <span className="text-slate-800">{modalData.complaint.priority}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">Assigned Dept</span>
                        <span className="text-slate-800">{modalData.complaint.department}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">Current Resolution Status</span>
                        <span className="text-slate-800">{modalData.complaint.status}</span>
                      </div>
                    </div>

                    {/* View Image */}
                    {modalData.images && modalData.images.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Visual Asset Log</span>
                        <div className="flex gap-2.5 flex-wrap">
                          {modalData.images.map((img, i) => (
                            <a 
                              key={i} 
                              href={`http://localhost:8080${img.imagePath}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200"
                            >
                              <img src={`http://localhost:8080${img.imagePath}`} alt="visual check" className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View Location Map */}
                    {modalData.complaint.latitude && modalData.complaint.longitude && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location Coordinates</span>
                        <p className="text-xs text-slate-600 leading-normal font-semibold flex items-start gap-1">
                          <MapPin size={14} className="text-primary-500 mt-0.5 flex-shrink-0" />
                          <span>{modalData.complaint.address}</span>
                        </p>
                        <div className="w-full aspect-video rounded-xl border border-slate-200 overflow-hidden mt-2">
                          <iframe
                            title="Modal maps preview"
                            src={`https://maps.google.com/maps?q=${modalData.complaint.latitude},${modalData.complaint.longitude}&z=15&output=embed`}
                            className="w-full h-full border-0"
                            allowFullScreen
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}

                    {/* Timeline History */}
                    <div className="space-y-4 pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Timeline History</span>
                      <div className="pl-4 border-l-2 border-slate-100 space-y-5 relative">
                        {modalData.timeline && modalData.timeline.map((node, i) => (
                          <div key={i} className="relative flex flex-col items-start text-xs font-semibold">
                            <span className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-primary-600 border-2 border-white" />
                            <div className="flex items-center justify-between w-full">
                              <span className="text-slate-800 font-bold">{node.status}</span>
                              <span className="text-[10px] text-slate-400 font-bold">{new Date(node.updatedTime).toLocaleString()}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed bg-slate-50 border border-slate-100/50 p-2.5 rounded-xl w-full">
                              {node.remarks}
                              <span className="block text-[8.5px] text-slate-400 font-bold uppercase mt-1">By: {node.officerName}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="p-8 text-center text-xs text-slate-400">Failed to render ticket telemetry.</p>
                )}
              </div>

              {/* Download receipt bar */}
              {modalData && (
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                  <button
                    onClick={() => handleDownloadPDF(modalData.complaint)}
                    className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md shadow-primary-500/10 focus:outline-none"
                  >
                    <Download size={14} />
                    <span>Download Receipt (PDF)</span>
                  </button>
                  <button
                    onClick={() => navigate(`/status?id=${selectedComplaintId}`)}
                    className="py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors focus:outline-none"
                  >
                    <span>Timeline View</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default HistoryPage;
