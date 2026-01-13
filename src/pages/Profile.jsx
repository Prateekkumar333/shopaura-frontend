// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiCamera,
  FiEdit2,
  FiSave,
  FiX,
  FiShield,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split('T')[0]
          : '',
        gender: user.gender || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await profileService.updateProfile(formData);
      if (response.success) {
        updateUser(response.user);
        toast.success('Profile updated successfully!');
        setEditing(false);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const response = await profileService.uploadProfilePicture(file);
      if (response.success) {
        updateUser(response.user);
        toast.success('Profile picture updated!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePicture = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?'))
      return;

    setUploading(true);

    try {
      const response = await profileService.deleteProfilePicture();
      if (response.success) {
        updateUser(response.user);
        toast.success('Profile picture removed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove picture');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600 text-lg">
            Manage your personal information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Profile Picture Section */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-12 text-center relative">
            <div className="relative inline-block">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture.url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-5xl font-black">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>

              {/* Camera Button */}
              <label
                htmlFor="profile-upload"
                className={`absolute bottom-0 right-0 bg-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-all transform hover:scale-110 ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiCamera className="text-indigo-600" size={20} />
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <h2 className="text-3xl font-black text-white mt-6">{user.name}</h2>
            <p className="text-indigo-100 mt-2">{user.email}</p>

            {/* Upload Instructions */}
            <p className="text-white text-sm mt-4 opacity-90">
              JPG, PNG or GIF (max. 5MB)
            </p>

            {/* Delete Picture Button */}
            {user.profilePicture && (
              <button
                onClick={handleDeletePicture}
                disabled={uploading}
                className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-bold disabled:opacity-50"
              >
                Remove Picture
              </button>
            )}
          </div>

          {/* Profile Form */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">
                Personal Information
              </h3>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FiEdit2 size={18} />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      dateOfBirth: user.dateOfBirth
                        ? new Date(user.dateOfBirth).toISOString().split('T')[0]
                        : '',
                      gender: user.gender || '',
                    });
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold"
                >
                  <FiX size={18} />
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg font-medium transition-all ${
                      editing
                        ? 'border-gray-300 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 bg-white'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg font-medium transition-all ${
                      editing
                        ? 'border-gray-300 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 bg-white'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg font-medium transition-all ${
                      editing
                        ? 'border-gray-300 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 bg-white'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Date of Birth
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg font-medium transition-all ${
                      editing
                        ? 'border-gray-300 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 bg-white'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full px-4 py-4 border-2 rounded-xl text-lg font-medium transition-all ${
                    editing
                      ? 'border-gray-300 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 bg-white'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              {/* Account Type Badge */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl">
                    <FiShield className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                      Account Type
                    </p>
                    <p className="text-2xl font-black text-gray-900 capitalize">
                      {user.role || 'Buyer'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {editing && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-black text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  <FiSave size={24} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
