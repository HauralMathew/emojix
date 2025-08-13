import { useState, useEffect } from 'react';
import { IconArrowLeft, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function EditProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, getProfile, updateFullProfile } = useWalletAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    website: '',
    twitter: ''
  });

  // Load user profile when authenticated
  useEffect(() => {
    const loadProfile = async () => {
      if (isAuthenticated && !isFormInitialized) {
        try {
          const result = await getProfile();
          console.log('Profile result:', result);
          if (result.success && result.user) {
            setUserProfile(result.user);
            const initialFormData = {
              display_name: result.user.display_name || '',
              bio: result.user.bio || '',
              website: result.user.website || '',
              twitter: result.user.twitter || ''
            };
            console.log('Setting initial form data:', initialFormData);
            setFormData(initialFormData);
            setIsFormInitialized(true);
          }
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
      }
      setIsLoading(false);
    };

    loadProfile();
  }, [isAuthenticated, getProfile, isFormInitialized]);

  // Monitor form data changes
  useEffect(() => {
    console.log('Form data changed:', formData);
  }, [formData]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    console.log('Input change:', field, value);
    console.log('Current form data before update:', formData);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('New form data after update:', newData);
      return newData;
    });
  };

  // Individual handlers for each field
  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Display name change event:', e.target.value);
    handleInputChange('display_name', e.target.value);
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('Bio change event:', e.target.value);
    handleInputChange('bio', e.target.value);
  };

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Website change event:', e.target.value);
    handleInputChange('website', e.target.value);
  };

  const handleTwitterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Twitter change event:', e.target.value);
    handleInputChange('twitter', e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    setIsSaving(true);
    try {
      const result = await updateFullProfile({
        ans_name: userProfile?.ans_name || '', // Keep existing domain name
        display_name: formData.display_name.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        website: formData.website.trim() || undefined,
        twitter: formData.twitter.trim() || undefined
      });
      
      if (result.success) {
        toast('Profile updated successfully!');
        // Navigate back to portfolio
        navigate('/portfolio');
      } else {
        toast(`Failed to update profile: ${result.error}`, { variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast('Failed to update profile.', { variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/portfolio');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text">Loading profile...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-text text-xl mb-4">Please authenticate to edit your profile</div>
          <div className="text-text/60">Connect your wallet and authenticate to edit your profile</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background ml-[52px] mt-16">
      {/* Header */}
      <div>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex">
              <button
                onClick={() => navigate('/portfolio')}
                className="flex items-center space-x-2 text-text/60 hover:text-text transition-colors"
                aria-label="Back to portfolio"
              >
                <IconArrowLeft className="w-5 h-5" />
                <span>Back to Portfolio</span>
              </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="bg-surface/50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Profile Picture</h2>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-primary/20 rounded-lg border-2 border-white/20 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/80 transition-colors font-medium"
                >
                  Upload Image
                </button>
                <p className="text-text/60 text-sm mt-2">
                  Upload a profile picture (PNG, JPG up to 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-surface/50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Basic Information</h2>
            
            {/* Display Name */}
            <div className="mb-4">
              <label htmlFor="display_name" className="block text-text font-medium mb-2">
                Display Name
              </label>
              <input
                type="text"
                id="display_name"
                value={formData.display_name}
                onChange={handleDisplayNameChange}
                placeholder="Enter your display name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text placeholder-text/50 focus:outline-none focus:border-primary"
              />
              <p className="text-text/60 text-sm mt-1">
                How you want to be displayed to other users
              </p>
            </div>

            {/* Bio */}
            <div className="mb-4">
              <label htmlFor="bio" className="block text-text font-medium mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={handleBioChange}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text placeholder-text/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              />
              <p className="text-text/60 text-sm mt-1">
                A short description about yourself (max 200 characters)
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-surface/50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Social Links</h2>
            
            {/* Website */}
            <div className="mb-4">
              <label htmlFor="website" className="block text-text font-medium mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={handleWebsiteChange}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text placeholder-text/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Twitter */}
            <div className="mb-4">
              <label htmlFor="twitter" className="block text-text font-medium mb-2">
                Twitter/X
              </label>
              <input
                type="text"
                id="twitter"
                value={formData.twitter}
                onChange={handleTwitterChange}
                placeholder="@username"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text placeholder-text/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center space-x-2 px-6 py-3 bg-white/10 text-text rounded-lg hover:bg-white/20 transition-colors"
            >
              <IconX className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-3 bg-primary text-black rounded-lg hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <IconDeviceFloppy className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 