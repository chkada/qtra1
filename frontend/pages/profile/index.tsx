import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';
import Navbar from '../../components/UI/Navbar';
import { Button } from '../../src/components/UI/Button';
import { Input } from '../../src/components/UI/Input';
import { Select } from '../../src/components/UI/Select';
import { Card } from '../../src/components/UI/Card';
import supabase, { isValidConfig } from '../../src/utils/supabaseClient';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Globe, 
  Bell, 
  Shield, 
  CreditCard, 
  BookOpen, 
  Settings, 
  Camera, 
  Save, 
  Eye, 
  EyeOff, 
  Trash2,
  Download,
  Upload,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  location?: string;
  timezone: string;
  language: string;
  bio?: string;
  interests: string[];
  learningGoals: string[];
  preferredSubjects: string[];
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  bookingReminders: boolean;
  messageNotifications: boolean;
  promotionalEmails: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'teachers-only';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  allowDirectMessages: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    email: '',
    fullName: '',
    phone: '',
    avatar: '',
    dateOfBirth: '',
    location: '',
    timezone: 'UTC',
    language: 'en',
    bio: '',
    interests: [],
    learningGoals: [],
    preferredSubjects: []
  });
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingReminders: true,
    messageNotifications: true,
    promotionalEmails: false
  });
  
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'teachers-only',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowDirectMessages: true
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    async function fetchProfile() {
      try {
        setLoading(true);
        
        if (!isValidConfig) {
          // Use mock data when Supabase is not configured
          const mockProfile: UserProfile = {
            id: user.id,
            email: user.email || 'user@example.com',
            fullName: user.user_metadata?.full_name || 'John Doe',
            phone: '+1234567890',
            avatar: user.user_metadata?.avatar_url || '',
            dateOfBirth: '1990-01-01',
            location: 'New York, NY',
            timezone: 'America/New_York',
            language: 'en',
            bio: 'Passionate learner interested in mathematics and science.',
            interests: ['Mathematics', 'Science', 'Technology'],
            learningGoals: ['Master calculus', 'Improve problem-solving skills'],
            preferredSubjects: ['Mathematics', 'Physics', 'Computer Science']
          };
          setProfile(mockProfile);
          return;
        }

        // Fetch profile from Supabase
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfile({
            ...data,
            interests: data.interests || [],
            learningGoals: data.learningGoals || [],
            preferredSubjects: data.preferredSubjects || []
          });
        } else {
          // Create initial profile
          setProfile(prev => ({
            ...prev,
            id: user.id,
            email: user.email || '',
            fullName: user.user_metadata?.full_name || ''
          }));
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setMessage({ type: 'error', text: 'Failed to load profile data' });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (!isValidConfig) {
        // Mock save success
        setTimeout(() => {
          setMessage({ type: 'success', text: 'Profile updated successfully!' });
          setSaving(false);
        }, 1000);
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user?.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      if (!isValidConfig) {
        // Mock password change success
        setTimeout(() => {
          setMessage({ type: 'success', text: 'Password updated successfully!' });
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setSaving(false);
        }, 1000);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      console.error('Error updating password:', err);
      setMessage({ type: 'error', text: 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mock avatar upload
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfile(prev => ({
        ...prev,
        avatar: event.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      if (!isValidConfig) {
        alert('Account deletion is not available in demo mode');
        return;
      }

      // In a real app, this would call an API endpoint to handle account deletion
      alert('Account deletion functionality would be implemented here');
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setMessage({ type: 'error', text: 'Failed to delete account' });
    }
  };

  const handleExportData = () => {
    const exportData = {
      profile,
      notifications,
      privacy,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qindil-profile-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const addToArray = (field: keyof Pick<UserProfile, 'interests' | 'learningGoals' | 'preferredSubjects'>, value: string) => {
    if (!value.trim()) return;
    setProfile(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
  };

  const removeFromArray = (field: keyof Pick<UserProfile, 'interests' | 'learningGoals' | 'preferredSubjects'>, index: number) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Settings },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
            <p className="text-gray-600">Manage your profile, preferences, and account security</p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <nav className="space-y-2">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </Card>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <img
                          src={profile.avatar || 'https://via.placeholder.com/100'}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{profile.fullName}</h3>
                        <p className="text-gray-600">{profile.email}</p>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="w-4 h-4 inline mr-2" />
                          Full Name
                        </label>
                        <Input
                          value={profile.fullName}
                          onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email
                        </label>
                        <Input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your email"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone
                        </label>
                        <Input
                          type="tel"
                          value={profile.phone || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Date of Birth
                        </label>
                        <Input
                          type="date"
                          value={profile.dateOfBirth || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Location
                        </label>
                        <Input
                          value={profile.location || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="City, Country"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Globe className="w-4 h-4 inline mr-2" />
                          Language
                        </label>
                        <Select
                          value={profile.language}
                          onChange={(e) => setProfile(prev => ({ ...prev, language: e.target.value }))}
                        >
                          <option value="en">English</option>
                          <option value="ar">Arabic</option>
                          <option value="fr">French</option>
                          <option value="es">Spanish</option>
                        </Select>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profile.bio || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Interests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interests
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {profile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center"
                          >
                            {interest}
                            <button
                              type="button"
                              onClick={() => removeFromArray('interests', index)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex">
                        <Input
                          placeholder="Add an interest"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addToArray('interests', e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={saving} className="w-full">
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </form>
                </Card>
              )}

              {activeTab === 'security' && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <Input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                      />
                    </div>

                    <Button type="submit" disabled={saving}>
                      {saving ? 'Updating...' : 'Update Password'}
                    </Button>
                  </form>

                  <div className="mt-8 pt-8 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
                    <div className="space-y-4">
                      <Button
                        onClick={handleExportData}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export My Data
                      </Button>
                      
                      <Button
                        onClick={handleDeleteAccount}
                        variant="outline"
                        className="w-full text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Other tabs would be implemented similarly */}
              {activeTab === 'notifications' && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                  <p className="text-gray-600">Notification settings will be implemented here.</p>
                </Card>
              )}

              {activeTab === 'privacy' && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Privacy Settings</h2>
                  <p className="text-gray-600">Privacy controls will be implemented here.</p>
                </Card>
              )}

              {activeTab === 'billing' && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Billing & Payments</h2>
                  <p className="text-gray-600">Billing management will be implemented here.</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}