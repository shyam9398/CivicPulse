import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Lock, Edit2, Check, Loader2, AlertCircle 
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import API from '../services/api';

export const ProfilePage = () => {
  const { showToast } = useAuth();

  // Loading States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  // Edit Mode Toggle
  const [editMode, setEditMode] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  // Password Fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch Profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get('/profile');
      setProfile(response.data);
      
      // Initialize inputs
      setName(response.data.name || '');
      setPhone(response.data.phoneNumber || '');
      setAddress(response.data.address || '');
      setCity(response.data.city || '');
      setState(response.data.state || '');
      setCountry(response.data.country || '');
      setProfilePicture(response.data.profilePicture || '');
    } catch (err) {
      console.error('Error fetching profile:', err);
      showToast('error', 'Failed to retrieve profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Name is required.');
      return;
    }

    setSaving(true);
    try {
      const response = await API.put('/profile', {
        name,
        phoneNumber: phone,
        address,
        city,
        state,
        country,
        profilePicture
      });
      setProfile(response.data);
      setEditMode(false);
      showToast('success', 'Profile updated successfully.');
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast('error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('error', 'All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      showToast('error', 'Password must be at least 8 characters long.');
      return;
    }

    setSaving(true);
    try {
      await API.put('/profile', {
        currentPassword,
        newPassword
      });
      showToast('success', 'Password changed successfully!');
      
      // Reset inputs
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error changing password:', err);
      showToast('error', err.response?.data?.message || 'Failed to change password. Double check current password.');
    } finally {
      setSaving(false);
    }
  };

  // Mock Avatar Selector options
  const avatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto w-full animate-pulse space-y-6 select-none">
        <div className="h-44 bg-white border border-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-white border border-slate-200 rounded-xl"></div>
          <div className="md:col-span-2 h-64 bg-white border border-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const joinDateFormatted = profile?.joinedDate 
    ? new Date(profile.joinedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Citizen Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your registration details, coordinate settings, and update account passwords.</p>
      </div>

      {/* Top Banner: Profile summary & Counts */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_-20%,#c2dbff_0%,transparent_35%)] opacity-35"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-primary-100 flex items-center justify-center text-primary-600 font-black text-2xl uppercase">
            {profilePicture ? (
              <img src={profilePicture} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile?.name?.substring(0, 2)
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{profile?.name}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400 font-semibold mt-1">
              <Mail size={12} />
              <span>{profile?.email}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400 font-semibold mt-0.5">
              <Calendar size={12} />
              <span>Member since {joinDateFormatted}</span>
            </div>
          </div>
        </div>

        {/* Counts summary widgets */}
        <div className="relative z-10 grid grid-cols-3 gap-6 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center shadow-inner">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total</span>
            <h4 className="text-lg font-extrabold text-slate-800">{profile?.totalComplaints || 0}</h4>
          </div>
          <div className="border-x border-slate-200 px-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pending</span>
            <h4 className="text-lg font-extrabold text-slate-800">{profile?.pendingComplaints || 0}</h4>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Resolved</span>
            <h4 className="text-lg font-extrabold text-slate-800">{profile?.resolvedComplaints || 0}</h4>
          </div>
        </div>
      </div>

      {/* Forms Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Card: Edit details form (Col span 2) */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Account Information</h3>
            <button
              type="button"
              onClick={() => setEditMode(!editMode)}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer focus:outline-none"
            >
              <Edit2 size={13} />
              <span>{editMode ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            
            {/* Mock Profile Picture Select */}
            {editMode && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Profile Avatar</span>
                <div className="flex gap-3">
                  {avatars.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfilePicture(av)}
                      className={`w-11 h-11 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${profilePicture === av ? 'border-primary-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={av} alt="Avatar opt" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setProfilePicture('')}
                    className="px-3.5 py-1 text-xs border border-slate-250 hover:bg-slate-50 text-slate-500 font-bold rounded-full cursor-pointer focus:outline-none"
                  >
                    Clear Avatar
                  </button>
                </div>
              </div>
            )}

            {/* Inputs grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  disabled={!editMode || saving}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phone Number</label>
                <input
                  type="tel"
                  disabled={!editMode || saving}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Not provided"
                  className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Address</label>
              <input
                type="text"
                disabled={!editMode || saving}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Not provided"
                className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">City</label>
                <input
                  type="text"
                  disabled={!editMode || saving}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Not provided"
                  className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">State</label>
                <input
                  type="text"
                  disabled={!editMode || saving}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Not provided"
                  className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Country</label>
                <input
                  type="text"
                  disabled={!editMode || saving}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Not provided"
                  className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                />
              </div>
            </div>

            {editMode && (
              <button
                type="submit"
                disabled={saving}
                className="py-3 px-5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 shadow-md shadow-primary-500/10 focus:outline-none transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin text-cyan-400" /> : <Check size={14} />}
                <span>Save Profile Changes</span>
              </button>
            )}

          </form>
        </div>

        {/* Right Card: Change Password form (Col span 1) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={15} className="text-slate-400" />
              <span>Change Password</span>
            </h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Current Password</label>
              <input
                type="password"
                required
                disabled={saving}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none disabled:bg-slate-50 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">New Password</label>
              <input
                type="password"
                required
                disabled={saving}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none disabled:bg-slate-50 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Confirm New Password</label>
              <input
                type="password"
                required
                disabled={saving}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none disabled:bg-slate-50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 shadow-md shadow-slate-900/10 focus:outline-none transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin text-cyan-400" /> : <Lock size={14} />}
              <span>Update Password</span>
            </button>

          </form>
        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
