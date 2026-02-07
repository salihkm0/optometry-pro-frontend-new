import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Save, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  CreditCard,
  Bell,
  FileText,
  Eye,
  EyeOff,
  Calendar,
  Users,
  Shield,
  Image,
  Key,
  Lock
} from 'lucide-react';
import axios from 'axios';
import endpoints from '../../api/endpoints';
import { useAuthStore } from '../../store/authStore';

export default function ShopSettings() {
  const [activeTab, setActiveTab] = useState('shop-info');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [shopData, setShopData] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user } = useAuthStore();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

  const newPassword = watch("newPassword");

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      const response = await axios.get(`${endpoints.shops}/${user?.shop}`);
      const shop = response.data;
      setShopData(shop);
      
      // Pre-fill form with existing data
      reset({
        name: shop.name,
        email: shop.contact?.email || '',
        phone: shop.contact?.phone || '',
        street: shop.contact?.address?.street || '',
        city: shop.contact?.address?.city || '',
        state: shop.contact?.address?.state || '',
        zipCode: shop.contact?.address?.zipCode || '',
        country: shop.contact?.address?.country || 'USA',
        
        // Working hours
        mondayStart: shop.settings?.workingHours?.monday?.start || '09:00',
        mondayEnd: shop.settings?.workingHours?.monday?.end || '17:00',
        mondayClosed: shop.settings?.workingHours?.monday?.closed || false,
        
        tuesdayStart: shop.settings?.workingHours?.tuesday?.start || '09:00',
        tuesdayEnd: shop.settings?.workingHours?.tuesday?.end || '17:00',
        tuesdayClosed: shop.settings?.workingHours?.tuesday?.closed || false,
        
        wednesdayStart: shop.settings?.workingHours?.wednesday?.start || '09:00',
        wednesdayEnd: shop.settings?.workingHours?.wednesday?.end || '17:00',
        wednesdayClosed: shop.settings?.workingHours?.wednesday?.closed || false,
        
        thursdayStart: shop.settings?.workingHours?.thursday?.start || '09:00',
        thursdayEnd: shop.settings?.workingHours?.thursday?.end || '17:00',
        thursdayClosed: shop.settings?.workingHours?.thursday?.closed || false,
        
        fridayStart: shop.settings?.workingHours?.friday?.start || '09:00',
        fridayEnd: shop.settings?.workingHours?.friday?.end || '17:00',
        fridayClosed: shop.settings?.workingHours?.friday?.closed || false,
        
        saturdayStart: shop.settings?.workingHours?.saturday?.start || '10:00',
        saturdayEnd: shop.settings?.workingHours?.saturday?.end || '14:00',
        saturdayClosed: shop.settings?.workingHours?.saturday?.closed || false,
        
        sundayStart: shop.settings?.workingHours?.sunday?.start || '00:00',
        sundayEnd: shop.settings?.workingHours?.sunday?.end || '00:00',
        sundayClosed: shop.settings?.workingHours?.sunday?.closed || true,
        
        // Preferences
        appointmentDuration: shop.settings?.appointmentDuration || 30,
        taxRate: shop.settings?.taxRate || 0,
        currency: shop.settings?.currency || 'USD',
        timezone: shop.settings?.timezone || 'America/New_York',
      });
    } catch (error) {
      console.error('Error fetching shop data:', error);
      toast.error('Failed to load shop settings');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let payload = {};

      switch (activeTab) {
        case 'shop-info':
          payload = {
            name: data.name,
            contact: {
              email: data.email,
              phone: data.phone,
              address: {
                street: data.street,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                country: data.country
              }
            }
          };
          break;
        case 'working-hours':
          payload = {
            settings: {
              ...shopData.settings,
              workingHours: {
                monday: { start: data.mondayStart, end: data.mondayEnd, closed: data.mondayClosed },
                tuesday: { start: data.tuesdayStart, end: data.tuesdayEnd, closed: data.tuesdayClosed },
                wednesday: { start: data.wednesdayStart, end: data.wednesdayEnd, closed: data.wednesdayClosed },
                thursday: { start: data.thursdayStart, end: data.thursdayEnd, closed: data.thursdayClosed },
                friday: { start: data.fridayStart, end: data.fridayEnd, closed: data.fridayClosed },
                saturday: { start: data.saturdayStart, end: data.saturdayEnd, closed: data.saturdayClosed },
                sunday: { start: data.sundayStart, end: data.sundayEnd, closed: data.sundayClosed }
              }
            }
          };
          break;
        case 'preferences':
          payload = {
            settings: {
              ...shopData.settings,
              appointmentDuration: parseInt(data.appointmentDuration),
              taxRate: parseFloat(data.taxRate),
              currency: data.currency,
              timezone: data.timezone
            }
          };
          break;
        case 'notifications':
          payload = {
            settings: {
              ...shopData.settings,
              notifications: {
                notifyNewAppointments: data.notifyNewAppointments,
                appointmentReminders: data.appointmentReminders,
                notifyNewCustomers: data.notifyNewCustomers,
                dailyReports: data.dailyReports
              }
            }
          };
          break;
        case 'security':
          payload = {
            settings: {
              ...shopData.settings,
              security: {
                sessionTimeout: parseInt(data.sessionTimeout),
                twoFactorAuth: data.twoFactorAuth,
                ipRestriction: data.ipRestriction
              }
            }
          };
          break;
        default:
          break;
      }

      const response = await axios.put(`${endpoints.shops}/${user?.shop}`, payload);
      setShopData(response.data);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data) => {
    setPasswordLoading(true);
    try {
      await axios.put(endpoints.changePassword, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      toast.success('Password changed successfully');
      resetPassword();
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = [
    { id: 'shop-info', label: 'Shop Info', icon: Building },
    { id: 'working-hours', label: 'Working Hours', icon: Clock },
    { id: 'preferences', label: 'Preferences', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'change-password', label: 'Change Password', icon: Lock },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Shop Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your shop information and preferences
          </p>
        </div>
        
        {shopData && (
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="text-sm text-gray-500 mr-4">
              Status: 
              <span className={`ml-2 font-medium ${shopData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {shopData.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {shopData.subscription && (
              <div className="text-sm text-gray-500">
                Plan: 
                <span className="ml-2 font-medium text-primary-600">
                  {shopData.subscription.plan}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="inline-block w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'change-password' ? (
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        {...registerPassword("currentPassword", { 
                          required: 'Current password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        {...registerPassword("newPassword", { 
                          required: 'New password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                            message: 'Password must contain uppercase, lowercase, and numbers'
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Must be at least 6 characters with uppercase, lowercase, and numbers
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        {...registerPassword("confirmPassword", { 
                          required: 'Please confirm your password',
                          validate: value => 
                            value === newPassword || 'Passwords do not match'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Key className="mr-2 h-4 w-4" />
                  {passwordLoading ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {/* Shop Info Tab */}
            {activeTab === 'shop-info' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Shop Information</h3>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shop Name *
                      </label>
                      <input
                        type="text"
                        {...register('name', { required: 'Shop name is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter shop name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        {...register('phone', { required: 'Phone number is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter phone number"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter email address"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Address</h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <input
                            type="text"
                            {...register('street')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Street address"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            {...register('city')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            {...register('state')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            {...register('zipCode')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="ZIP code"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        {...register('country')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Working Hours Tab */}
            {activeTab === 'working-hours' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Working Hours</h3>
                  
                  <div className="space-y-4">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            {...register(`${day}Closed`)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700 capitalize w-24">
                            {day}
                          </span>
                          <div className="flex items-center space-x-2">
                            <input
                              type="time"
                              {...register(`${day}Start`)}
                              className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                              disabled={watch(`${day}Closed`)}
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              {...register(`${day}End`)}
                              className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                              disabled={watch(`${day}Closed`)}
                            />
                          </div>
                        </div>
                        <span className={`text-sm ${watch(`${day}Closed`) ? 'text-red-600' : 'text-green-600'}`}>
                          {watch(`${day}Closed`) ? 'Closed' : 'Open'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Duration (minutes)
                      </label>
                      <input
                        type="number"
                        {...register('appointmentDuration', { 
                          min: { value: 15, message: 'Minimum 15 minutes' },
                          max: { value: 120, message: 'Maximum 120 minutes' }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.appointmentDuration && (
                        <p className="mt-1 text-sm text-red-600">{errors.appointmentDuration.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        {...register('taxRate', { 
                          min: { value: 0, message: 'Cannot be negative' },
                          max: { value: 100, message: 'Cannot exceed 100%' }
                        })}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.taxRate && (
                        <p className="mt-1 text-sm text-red-600">{errors.taxRate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        {...register('currency')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        {...register('timezone')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">GMT (London)</option>
                        <option value="Asia/Kolkata">IST (India)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">New Appointments</p>
                        <p className="text-sm text-gray-500">Get notified when new appointments are booked</p>
                      </div>
                      <input
                        type="checkbox"
                        {...register('notifyNewAppointments')}
                        defaultChecked
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Appointment Reminders</p>
                        <p className="text-sm text-gray-500">Send reminders for upcoming appointments</p>
                      </div>
                      <input
                        type="checkbox"
                        {...register('appointmentReminders')}
                        defaultChecked
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">New Customer Registration</p>
                        <p className="text-sm text-gray-500">Get notified when new customers register</p>
                      </div>
                      <input
                        type="checkbox"
                        {...register('notifyNewCustomers')}
                        defaultChecked
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Daily Reports</p>
                        <p className="text-sm text-gray-500">Receive daily summary reports</p>
                      </div>
                      <input
                        type="checkbox"
                        {...register('dailyReports')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        {...register('sessionTimeout', { 
                          min: { value: 5, message: 'Minimum 5 minutes' },
                          max: { value: 480, message: 'Maximum 480 minutes (8 hours)' }
                        })}
                        defaultValue={30}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Auto-logout after inactivity
                      </p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security</p>
                        </div>
                        <input
                          type="checkbox"
                          {...register('twoFactorAuth')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">IP Restriction</p>
                          <p className="text-sm text-gray-500">Allow access only from specific IPs</p>
                        </div>
                        <input
                          type="checkbox"
                          {...register('ipRestriction')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'change-password' && (
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}