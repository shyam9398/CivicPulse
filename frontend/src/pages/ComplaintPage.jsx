import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Image as ImageIcon, MapPin, Trash2, 
  AlertCircle, CheckCircle, ArrowRight, Loader2
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import API from '../services/api';

export const ComplaintPage = () => {
  const { showToast } = useAuth();
  const navigate = useNavigate();

  // Form Fields (User manually fills these out)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  
  // Geolocation & Address
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('');
  
  // Structured Address fields
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  
  // GPS Metadata
  const [gpsAccuracy, setGpsAccuracy] = useState('');
  const [captureTime, setCaptureTime] = useState('');
  const [captureTimeRaw, setCaptureTimeRaw] = useState('');
  
  // Image Upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tempImagePath, setTempImagePath] = useState('');
  
  // Scan states
  const [scanning, setScanning] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [locationError, setLocationError] = useState(null);

  // Submission Loader
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // File Inputs references
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Geolocation Extraction via Backend
  const runImageAnalysis = async (file) => {
    setScanning(true);
    setLocationError(null);
    
    // Animate progress states
    setProgressStatus('Uploading Image...');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setProgressStatus('Extracting GPS Metadata...');
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Perform backend EXIF coordinate parsing
      const response = await API.post('/complaints/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const data = response.data;
      setTempImagePath(data.imagePath);

      // GPS extraction
      if (data.gpsFound && data.latitude && data.longitude) {
        setProgressStatus('Reverse Geocoding Coordinates...');
        setCoords({ lat: data.latitude, lng: data.longitude });
        setGpsAccuracy('EXIF Metadata Accuracy');
        
        const capTimeStr = data.captureTime 
          ? new Date(data.captureTime).toLocaleString() 
          : new Date().toLocaleString();
        setCaptureTime(capTimeStr);
        setCaptureTimeRaw(data.captureTime || new Date().toISOString());

        if (data.address) {
          setAddress(data.address.displayAddress || '');
          setCity(data.address.city || '');
          setState(data.address.state || '');
          setCountry(data.address.country || 'India');
          setPincode(data.address.pincode || '');
          setHouseNumber(data.address.houseNumber || '');
          setStreet(data.address.street || '');
          setArea(data.address.area || '');
          setVillage(data.address.village || '');
          setDistrict(data.address.district || '');
        }
        showToast('success', 'EXIF GPS telemetry resolved & geocoded successfully!');
      } else {
        // Leave the text boxes normal/blank as requested
        setCoords({ lat: null, lng: null });
        setGpsAccuracy('');
        setCaptureTime('');
        setCaptureTimeRaw('');
        setAddress('');
        setCity('');
        setState('');
        setCountry('India');
        setPincode('');
        setHouseNumber('');
        setStreet('');
        setArea('');
        setVillage('');
        setDistrict('');
        showToast('info', 'No GPS metadata found in photo. Please type the address manually.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Image analysis service offline. Please enter address manually.');
      
      // Clear address details so they are empty
      setCoords({ lat: null, lng: null });
      setGpsAccuracy('');
      setCaptureTime('');
      setCaptureTimeRaw('');
      setAddress('');
      setCity('');
      setState('');
      setCountry('India');
      setPincode('');
      setHouseNumber('');
      setStreet('');
      setArea('');
      setVillage('');
      setDistrict('');
    } finally {
      setScanning(false);
      setProgressStatus('');
    }
  };

  // Handle snap photo click (Camera permission and GPS permission required)
  const handleSnapPhotoClick = async () => {
    setLocationError(null);
    try {
      // Request Camera Permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Camera access denied:', err);
      showToast('error', 'Camera access is required to snap a photo.');
      return;
    }

    // Request GPS Location Permission
    navigator.geolocation.getCurrentPosition(
      (position) => {
        cameraInputRef.current?.click();
      },
      (error) => {
        console.error('Location permission denied:', error);
        showToast('info', 'Location permission denied. You can snap photo and write address manually.');
        cameraInputRef.current?.click();
      }
    );
  };

  // Process selected files
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('error', 'Please select a valid image file.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Trigger telemetry extraction
      runImageAnalysis(file);
    }
  };

  const deleteImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setLocationError(null);
    setCoords({ lat: null, lng: null });
    setAddress('');
    setCity('');
    setState('');
    setCountry('India');
    setPincode('');
    setHouseNumber('');
    setStreet('');
    setArea('');
    setVillage('');
    setDistrict('');
    setGpsAccuracy('');
    setCaptureTime('');
    setCaptureTimeRaw('');
    setTempImagePath('');
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  // Submit Complaint Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      showToast('error', 'Please upload or snap an image.');
      return;
    }

    if (!category) {
      showToast('error', 'Please select a complaint category.');
      return;
    }

    if (!address.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      showToast('error', 'Please enter required location details (Address, City, State, Pincode).');
      return;
    }

    setIsSubmitting(true);
    setProgressStatus('Saving Complaint...');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('priority', priority);
      formData.append('latitude', coords.lat || '');
      formData.append('longitude', coords.lng || '');
      formData.append('address', address);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('country', country || 'India');
      formData.append('houseNumber', houseNumber);
      formData.append('street', street);
      formData.append('area', area);
      formData.append('village', village);
      formData.append('district', district);
      formData.append('pincode', pincode);
      if (gpsAccuracy) formData.append('gpsAccuracy', gpsAccuracy.includes('meters') ? parseFloat(gpsAccuracy) : 10.0);
      if (captureTimeRaw) formData.append('captureTime', captureTimeRaw);
      if (tempImagePath) formData.append('tempImagePath', tempImagePath);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await API.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setShowSuccessAnimation(true);
      showToast('success', 'Complaint Registered Successfully!');
      
      setTimeout(() => {
        navigate(`/status?id=${response.data.id}`);
      }, 2000);
    } catch (err) {
      console.error('Complaint registration error:', err);
      const msg = err.response?.data?.message || 'Failed to submit complaint. Please check fields.';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
      setProgressStatus('');
    }
  };

  const categories = [
    "Pothole", "Garbage", "Water Leakage", "Road Damage", 
    "Broken Drain", "Open Manhole", "Fallen Tree", "Street Light Failure", 
    "Electric Pole Damage", "Illegal Dumping", "Traffic Signal Damage", 
    "Construction Waste", "Sewage Overflow", "Damaged Footpath"
  ];

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
      
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 text-white animate-fadeIn">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50 mb-4 animate-scaleUp">
            <CheckCircle className="w-12 h-12 text-white stroke-[3]" />
          </div>
          <h2 className="text-2xl font-black tracking-tight animate-slideDown">Complaint Saved!</h2>
          <p className="text-slate-400 text-sm mt-1 animate-fadeIn">Redirecting you to Live Tracking panel...</p>
        </div>
      )}

      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-display">Smart Incident Submission</h1>
        <p className="text-slate-500 text-sm mt-1">Upload or take a photo of the incident to extract GPS telemetry, choose the category, and submit the report.</p>
      </div>

      {/* Main submission workflow layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Upload Zone & Small Map Preview */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upload Reference Photo</h3>
            
            <div className="flex flex-col gap-3">
              {/* Snap photo */}
              <button
                type="button"
                onClick={handleSnapPhotoClick}
                className="py-3 px-4 rounded-xl border border-dashed border-slate-200 hover:border-primary-400 text-slate-600 hover:text-primary-600 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer font-bold text-sm transition-all focus:outline-none"
              >
                <Camera size={18} />
                <span>Snap Photo (Camera)</span>
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Upload image */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="py-3 px-4 rounded-xl border border-dashed border-slate-200 hover:border-primary-400 text-slate-600 hover:text-primary-600 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer font-bold text-sm transition-all focus:outline-none"
              >
                <ImageIcon size={18} />
                <span>Select from Gallery</span>
              </button>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Scanning Animation */}
            {scanning && (
              <div className="relative mt-2 border border-slate-250 rounded-xl h-48 overflow-hidden bg-slate-950 flex flex-col items-center justify-center text-center p-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500 shadow-md shadow-cyan-400 animate-bounce" style={{ animationDuration: '1.5s' }}></div>
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
                <span className="text-xs font-bold text-slate-200">{progressStatus || 'Extracting GPS Telemetry...'}</span>
              </div>
            )}

            {/* Preview image */}
            {imagePreview && !scanning && (
              <div className="relative mt-2 border border-slate-100 rounded-xl overflow-hidden shadow-inner group">
                <img src={imagePreview} alt="Complaint Preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={deleteImage}
                  className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer shadow-md focus:outline-none"
                  title="Remove Image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            {/* Small Map View directly below the image preview card */}
            {imagePreview && !scanning && coords.lat && coords.lng && (
              <div className="w-full h-40 rounded-xl border border-slate-200 overflow-hidden shadow-inner mt-3 animate-fadeIn">
                <iframe
                  title="Small Incident Map Preview"
                  src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=16&output=embed`}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Geocoded fields & inputs (Col span 2) */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="comp-title" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Complaint Title *
              </label>
              <input
                id="comp-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter complaint title"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-slate-50/50"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="comp-desc" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Description *
              </label>
              <textarea
                id="comp-desc"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the complaint in detail..."
                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-slate-50/50 resize-y"
              />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="comp-category" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Category *
                </label>
                <select
                  id="comp-category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-slate-50/50 cursor-pointer"
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="comp-priority" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Priority
                </label>
                <select
                  id="comp-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-slate-50/50 cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location address metadata */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={18} className="text-primary-500" />
              <span>Incident Location Details</span>
            </h3>

            {/* Geolocation Coordinates Info */}
            {coords.lat && coords.lng && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold">
                <div>
                  <span className="text-slate-400 uppercase text-[9px] tracking-wider font-bold">Latitude</span>
                  <p className="text-slate-700 font-mono">{coords.lat?.toFixed(6)}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[9px] tracking-wider font-bold">Longitude</span>
                  <p className="text-slate-700 font-mono">{coords.lng?.toFixed(6)}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[9px] tracking-wider font-bold">GPS Accuracy</span>
                  <p className="text-slate-700">{gpsAccuracy || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[9px] tracking-wider font-bold">Capture Time</span>
                  <p className="text-slate-700">{captureTime || 'N/A'}</p>
                </div>
              </div>
            )}

            {/* Always display form text input fields */}
            <div className="space-y-4 text-xs font-semibold">
              
              {/* Full Address details */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Full Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full address details"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-slate-50/50"
                />
              </div>

              {/* Street Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Street Name</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street or Road Name"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-slate-50/50"
                />
              </div>

              {/* Grid 2: Area & Village */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Area / Locality</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Area / Neighborhood"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-slate-50/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Village</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Village (if rural area)"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Grid 3: City & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City Name"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-slate-50/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">District *</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="District Name"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Grid 4: State, Country, Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State Name"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-slate-50/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Country</label>
                  <input
                    type="text"
                    value={country || 'India'}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="India"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-slate-50/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="6-digit Pincode"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Error notifications log */}
            {locationError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs font-bold text-red-650 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{locationError}</span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <button
            type="submit"
            disabled={isSubmitting || scanning}
            className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-base cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shadow-lg shadow-primary-500/10 focus:outline-none transition-all hover:scale-[1.01]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{progressStatus || 'Registering Complaint...'}</span>
              </>
            ) : (
              <>
                <span>Register Complaint</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ComplaintPage;
