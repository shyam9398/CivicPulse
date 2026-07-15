import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, ShieldAlert, CheckCircle2, Clock, 
  MapPin, Loader2, ArrowRight, Calendar, User, 
  Info, AlertCircle, FileText, ExternalLink, Navigation
} from 'lucide-react';
import API from '../services/api';
import useAuth from '../hooks/useAuth';

export const StatusPage = () => {
  const { showToast } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get('id') || '';

  // Data States
  const [complaints, setComplaints] = useState([]);
  const [selectedId, setSelectedId] = useState(queryId);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [data, setData] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all complaints on mount
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoadingList(true);
        const response = await API.get('/complaints');
        setComplaints(response.data);
        
        // If a query parameter ID exists and is valid, select it.
        // Otherwise, select the first complaint in the list.
        if (queryId) {
          setSelectedId(queryId);
        } else if (response.data.length > 0) {
          setSelectedId(response.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching complaints list:', err);
        showToast('error', 'Failed to retrieve your complaints database.');
      } finally {
        setLoadingList(false);
      }
    };
    fetchComplaints();
  }, [queryId]);

  // Fetch detailed status whenever selectedId changes
  useEffect(() => {
    if (!selectedId) {
      setData(null);
      return;
    }

    const fetchDetail = async () => {
      setLoadingDetail(true);
      setErrorDetail(null);
      try {
        const response = await API.get(`/status/${selectedId}`);
        setData(response.data);
      } catch (err) {
        console.error('Error fetching complaint status detail:', err);
        setErrorDetail('Details for this complaint could not be resolved.');
        setData(null);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [selectedId]);

  // Handle card click selection
  const handleSelectComplaint = (id) => {
    setSelectedId(id);
    setSearchParams({ id });
  };

  // Filter complaints based on Search input (matches ID, title, address)
  const filteredComplaints = complaints.filter(c => 
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Status mapping styles
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pending':
      case 'Submitted':
        return { color: 'text-amber-700 bg-amber-50 border-amber-100', label: 'Submitted' };
      case 'Verified':
        return { color: 'text-teal-700 bg-teal-50 border-teal-100', label: 'Verified' };
      case 'Assigned':
        return { color: 'text-blue-700 bg-blue-50 border-blue-100', label: 'Assigned' };
      case 'In Progress':
      case 'Work Started':
      case 'WorkStarted':
        return { color: 'text-indigo-700 bg-indigo-50 border-indigo-150', label: 'Work Started' };
      case 'Resolved':
      case 'Closed':
        return { color: 'text-emerald-700 bg-emerald-50 border-emerald-100', label: 'Resolved' };
      case 'Rejected':
        return { color: 'text-red-700 bg-red-50 border-red-100', label: 'Rejected' };
      default:
        return { color: 'text-slate-700 bg-slate-50 border-slate-100', label: 'Submitted' };
    }
  };

  // Predefined stages of complaint workflow
  const steps = ['Submitted', 'Verified', 'Assigned', 'Work Started', 'Resolved'];

  // Map database status log nodes dynamically to our timeline
  const getTimelineStepInfo = (stepName) => {
    if (!data || !data.timeline) return null;
    return data.timeline.find(node => {
      const nodeStatus = node.status.toLowerCase();
      const step = stepName.toLowerCase();
      if (step === 'work started') {
        return nodeStatus === 'work started' || nodeStatus === 'workstarted' || nodeStatus === 'in progress';
      }
      return nodeStatus === step;
    });
  };

  const getStepIndex = (status) => {
    if (status === 'Rejected') return -1;
    if (status === 'Pending' || status === 'Submitted') return 0;
    if (status === 'Verified') return 1;
    if (status === 'Assigned') return 2;
    if (status === 'In Progress' || status === 'Work Started' || status === 'WorkStarted') return 3;
    if (status === 'Resolved' || status === 'Closed') return 4;
    return 0;
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-display">Track Complaint Status</h1>
        <p className="text-slate-500 text-sm mt-1">Select a complaint from the panel on the left or search by Docket ID to view active timelines, remarks, and dispatches.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px] items-start">
        
        {/* Left Panel: Search & Cards List (Col Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm h-full max-h-[800px] overflow-y-auto">
          
          {/* Search box */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, title, or address..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-slate-50/50 uppercase transition-all"
            />
          </div>

          {/* Cards List container */}
          <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 flex-1">
            {loadingList ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto mb-2" />
                <p className="text-xs font-semibold">Loading complaints...</p>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="py-12 text-center text-slate-400 my-auto">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <h4 className="text-xs font-bold text-slate-700">No Complaints Found</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">No complaint matches search criteria.</p>
              </div>
            ) : (
              filteredComplaints.map((comp) => {
                const isSelected = selectedId === comp.id;
                const statusStyles = getStatusConfig(comp.status);
                return (
                  <div
                    key={comp.id}
                    onClick={() => handleSelectComplaint(comp.id)}
                    className={`p-3.5 border rounded-xl cursor-pointer transition-all flex gap-3 items-start select-none ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-50/10 shadow-sm shadow-primary-500/5' 
                        : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Complaint Image thumbnail */}
                    <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                      {comp.imagePath ? (
                        <img 
                          src={`http://localhost:8080${comp.imagePath}`} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase">
                          No Pic
                        </div>
                      )}
                    </div>

                    {/* Metadata summary */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-400 font-mono block">{comp.id}</span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${statusStyles.color}`}>
                          {statusStyles.label}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 truncate mt-1">{comp.title}</h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{comp.address || 'No Address coordinates'}</p>
                      
                      <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-100">
                        <span className="text-[9px] text-slate-400 font-bold">
                          {new Date(comp.createdTime).toLocaleDateString()}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full border ${
                          comp.priority === 'Emergency' && 'bg-rose-50 border-rose-100 text-rose-700' ||
                          comp.priority === 'High' && 'bg-amber-50 border-amber-100 text-amber-700' ||
                          comp.priority === 'Medium' && 'bg-blue-50 border-blue-100 text-blue-700' ||
                          'bg-slate-100 border-slate-200 text-slate-650'
                        }`}>
                          {comp.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Detail Metrics & Maps & Timeline (Col Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {loadingDetail ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm w-full select-none animate-pulse">
              <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">Loading tracking logs...</p>
            </div>
          ) : errorDetail ? (
            <div className="bg-red-50 border border-red-250 rounded-2xl p-6 text-center shadow-sm w-full">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
              <h4 className="text-base font-bold text-red-800">Tracking Error</h4>
              <p className="text-xs text-red-650 mt-1">{errorDetail}</p>
            </div>
          ) : data ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
              
              {/* Left Column in Detail Pane: Summary and Geolocation (Col Span 2) */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Information Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Incident Docket ID</span>
                      <h2 className="text-lg font-black text-slate-800 mt-0.5">{data.complaint.id}</h2>
                    </div>
                    <span className={`
                      px-3 py-1 text-xs font-bold rounded-full border
                      ${getStatusConfig(data.complaint.status).color}
                    `}>
                      {getStatusConfig(data.complaint.status).label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-bold">Created Date</span>
                        <span className="text-slate-700">
                          {new Date(data.complaint.createdTime).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-bold">Assigned Officer</span>
                        <span className="text-slate-700 font-extrabold">{data.officerName || 'Not Assigned Yet'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Title & Description</span>
                    <h4 className="text-sm font-bold text-slate-800">{data.complaint.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      {data.complaint.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold">Department</span>
                      <span className="text-slate-700 truncate block mt-0.5">{data.complaint.department || 'Resolving department not set'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold">Resolution Estimate</span>
                      <span className="text-slate-700 truncate block mt-0.5">{data.estimatedResolutionTime || 'Pending assignment'}</span>
                    </div>
                  </div>

                  {/* Attachment image */}
                  {data.complaint.imagePath && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Incident Snapshot</span>
                      <div className="rounded-xl border border-slate-200 overflow-hidden w-full max-h-60 aspect-video shadow-inner bg-slate-50">
                        <img 
                          src={`http://localhost:8080${data.complaint.imagePath}`} 
                          alt="Incident Reference" 
                          className="w-full h-full object-cover cursor-zoom-in"
                          onClick={() => window.open(`http://localhost:8080${data.complaint.imagePath}`, "_blank")}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Geocoding details, interactive map & navigation actions */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <MapPin size={18} className="text-primary-500" />
                    <span>Incident Location telemetry</span>
                  </h3>
                  
                  <div className="text-xs font-semibold text-slate-650 space-y-3">
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] block">Latitude</span>
                        <span className="text-slate-800 font-mono block mt-0.5">{data.complaint.latitude?.toFixed(6) || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] block">Longitude</span>
                        <span className="text-slate-800 font-mono block mt-0.5">{data.complaint.longitude?.toFixed(6) || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] block">Accuracy</span>
                        <span className="text-slate-800 block mt-0.5">{data.complaint.gpsAccuracy ? `${data.complaint.gpsAccuracy} meters` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] block">Capture Timestamp</span>
                        <span className="text-slate-800 block mt-0.5">
                          {data.complaint.captureTime ? new Date(data.complaint.captureTime).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 uppercase text-[9px] block font-bold">Structured Address</span>
                      <p className="text-slate-700 leading-normal">{data.complaint.address || 'N/A'}</p>
                    </div>

                    {/* Google Map iframe */}
                    {data.complaint.latitude && data.complaint.longitude && (
                      <div className="space-y-3.5">
                        <div className="w-full aspect-video rounded-xl border border-slate-200 overflow-hidden shadow-inner mt-2">
                          <iframe
                            title="Incident Interactive Map"
                            src={`https://maps.google.com/maps?q=${data.complaint.latitude},${data.complaint.longitude}&z=16&output=embed`}
                            className="w-full h-full border-0"
                            allowFullScreen
                            loading="lazy"
                          />
                        </div>

                        {/* Navigation buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${data.complaint.latitude},${data.complaint.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2.5 px-4 rounded-xl border border-slate-250 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs transition-colors"
                          >
                            <ExternalLink size={14} className="text-slate-450" />
                            <span>Open in Google Maps</span>
                          </a>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${data.complaint.latitude},${data.complaint.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center gap-2 cursor-pointer font-bold text-xs transition-colors shadow-md shadow-primary-500/10"
                          >
                            <Navigation size={14} />
                            <span>Get Directions</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column in Detail Pane: Vertical stage progress with logs (Col Span 1) */}
              <div className="space-y-6">
                
                {/* Resolution Timeline container */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolution Timeline</h3>
                  
                  {data.complaint.status === 'Rejected' ? (
                    <div className="flex flex-col items-center justify-center text-center py-8 text-red-500 gap-2 border border-red-100 bg-red-50/50 rounded-2xl animate-shake">
                      <ShieldAlert className="w-10 h-10" />
                      <h4 className="text-sm font-bold">Incident Rejected</h4>
                      <p className="text-[10px] text-red-400 px-4 leading-normal font-semibold">
                        This complaint has been rejected by administration. Please read logs below.
                      </p>
                    </div>
                  ) : (
                    <div className="relative flex flex-col gap-8 pl-6 border-l-2 border-slate-100">
                      {/* Active line indicator */}
                      <div 
                        className="absolute left-[-2px] top-0 bottom-0 bg-primary-500 transition-all duration-700 origin-top"
                        style={{ 
                          height: `${Math.max(0, (getStepIndex(data.complaint.status) / (steps.length - 1)) * 100)}%`,
                          width: '2px'
                        }}
                      />

                      {steps.map((step, idx) => {
                        const targetStepIdx = getStepIndex(data.complaint.status);
                        const isCompleted = idx <= targetStepIdx;
                        const isCurrent = idx === targetStepIdx;
                        
                        // Resolve the exact database timeline log node if available
                        const logNode = getTimelineStepInfo(step);

                        return (
                          <div key={idx} className="relative flex items-start gap-3">
                            
                            {/* Circle Indicator */}
                            <div className={`
                              absolute left-[-32px] w-5 h-5 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300
                              ${isCompleted 
                                ? 'bg-primary-600 border-primary-600 text-white shadow-sm shadow-primary-500/20' 
                                : 'bg-white border-slate-200 text-slate-300'
                              }
                            `}>
                              {isCompleted ? (
                                <CheckCircle2 size={12} className="stroke-[3]" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                              )}
                            </div>

                            {/* Node Metadata content */}
                            <div className="flex-1 min-w-0">
                              <h4 className={`
                                text-xs font-bold transition-colors
                                ${isCurrent && 'text-primary-600'}
                                ${isCompleted && !isCurrent && 'text-slate-800'}
                                ${!isCompleted && 'text-slate-400'}
                              `}>
                                {step}
                              </h4>
                              
                              {logNode ? (
                                <div className="mt-1.5 space-y-1.5 bg-slate-50/50 border border-slate-100 rounded-lg p-2 animate-fadeIn text-[10px] font-semibold">
                                  <div className="flex justify-between items-center text-slate-400">
                                    <span>{new Date(logNode.updatedTime).toLocaleDateString()}</span>
                                    <span>{new Date(logNode.updatedTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  </div>
                                  {logNode.remarks && (
                                    <p className="text-slate-600 font-medium leading-relaxed italic border-l border-slate-200 pl-1.5">
                                      "{logNode.remarks}"
                                    </p>
                                  )}
                                  {logNode.officerName && (
                                    <div className="text-[9px] text-slate-400 text-right">
                                      Officer: <span className="text-slate-600 font-bold">{logNode.officerName}</span>
                                    </div>
                                  )}
                                </div>
                              ) : isCompleted ? (
                                <p className="text-[9px] text-slate-400 mt-0.5">Log node updated by municipal administration.</p>
                              ) : (
                                <p className="text-[9px] text-slate-350 mt-0.5">Stage is pending resolution steps.</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Latest Remarks info alert box */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4.5 flex gap-3 items-start">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-800">Municipal Console Notes</h4>
                    <p className="text-xs text-blue-650 mt-1 leading-relaxed font-semibold">
                      {data.latestRemarks || 'No formal updates have been published by the dispatch officer for this ticket.'}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 shadow-sm h-full flex flex-col justify-center select-none">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <h4 className="text-base font-bold text-slate-700">No incident ticket selected</h4>
              <p className="text-xs max-w-sm mx-auto mt-1 leading-normal">
                Select a ticket from the left panel or navigate from the history list to trace dynamic timeline dispatch reports.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StatusPage;
