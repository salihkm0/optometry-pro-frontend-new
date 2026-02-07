import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Save, X, UserPlus } from 'lucide-react';

export default function ShopForm({ shop, onSubmit, isLoading }) {
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      name: '',
      contact: {
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
        }
      },
      owner: {
        name: '',
        email: '',
        phone: '',
      },
      settings: {
        appointmentDuration: 30,
        taxRate: 0,
      },
      subscription: {
        plan: 'free',
      },
    }
  });

  useEffect(() => {
    if (shop) {
      reset({
        name: shop.name,
        contact: {
          email: shop.contact?.email || '',
          phone: shop.contact?.phone || '',
          address: {
            street: shop.contact?.address?.street || '',
            city: shop.contact?.address?.city || '',
            state: shop.contact?.address?.state || '',
            zipCode: shop.contact?.address?.zipCode || '',
          }
        },
        // For edit mode, we don't prefill owner details
        ...(shop.isNew && {
          owner: {
            name: shop.owner?.name || '',
            email: shop.owner?.email || '',
            phone: shop.owner?.phone || '',
          }
        })
      });
    }
  }, [shop, reset]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setOwnerPassword(password);
    setValue('owner.password', password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Shop Details */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Shop Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop Name *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Shop name is required' })}
              className="input-field"
              placeholder="Enter shop name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop Email *
            </label>
            <input
              type="email"
              {...register('contact.email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="input-field"
              placeholder="shop@example.com"
            />
            {errors.contact?.email && (
              <p className="mt-1 text-sm text-red-600">{errors.contact.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop Phone *
            </label>
            <input
              type="tel"
              {...register('contact.phone', { 
                required: 'Phone is required',
                pattern: {
                  value: /^[\+]?[1-9][\d]{0,15}$/,
                  message: 'Invalid phone number'
                }
              })}
              className="input-field"
              placeholder="+1234567890"
            />
            {errors.contact?.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.contact.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Duration (minutes)
            </label>
            <input
              type="number"
              {...register('settings.appointmentDuration', { 
                min: 15,
                max: 120 
              })}
              className="input-field"
              placeholder="30"
            />
          </div>
        </div>

        {/* Address */}
        <div className="mt-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street
              </label>
              <input
                type="text"
                {...register('contact.address.street')}
                className="input-field"
                placeholder="123 Main St"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                {...register('contact.address.city')}
                className="input-field"
                placeholder="New York"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                {...register('contact.address.state')}
                className="input-field"
                placeholder="NY"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code
              </label>
              <input
                type="text"
                {...register('contact.address.zipCode')}
                className="input-field"
                placeholder="10001"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Owner Details (only for new shops) */}
      {!shop?.isNew && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Shop Owner</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Name *
              </label>
              <input
                type="text"
                {...register('owner.name', { required: 'Owner name is required' })}
                className="input-field"
                placeholder="John Doe"
              />
              {errors.owner?.name && (
                <p className="mt-1 text-sm text-red-600">{errors.owner.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Email *
              </label>
              <input
                type="email"
                {...register('owner.email', { 
                  required: 'Owner email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="input-field"
                placeholder="owner@example.com"
              />
              {errors.owner?.email && (
                <p className="mt-1 text-sm text-red-600">{errors.owner.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Phone *
              </label>
              <input
                type="tel"
                {...register('owner.phone', { 
                  required: 'Owner phone is required',
                  pattern: {
                    value: /^[\+]?[1-9][\d]{0,15}$/,
                    message: 'Invalid phone number'
                  }
                })}
                className="input-field"
                placeholder="+1234567890"
              />
              {errors.owner?.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.owner.phone.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner Password *
            </label>
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type={showOwnerPassword ? 'text' : 'password'}
                  {...register('owner.password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="input-field pr-10"
                  placeholder="Enter password"
                  value={ownerPassword}
                  onChange={(e) => {
                    setOwnerPassword(e.target.value);
                    setValue('owner.password', e.target.value);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showOwnerPassword ? (
                    <X className="h-5 w-5 text-gray-400" />
                  ) : (
                    <UserPlus className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={generatePassword}
                className="btn-secondary"
              >
                Generate
              </button>
            </div>
            {errors.owner?.password && (
              <p className="mt-1 text-sm text-red-600">{errors.owner.password.message}</p>
            )}
            {ownerPassword && (
              <p className="mt-2 text-sm text-gray-600">
                Generated password: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{ownerPassword}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Subscription */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Subscription</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan
            </label>
            <select
              {...register('subscription.plan')}
              className="input-field"
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('settings.taxRate', { 
                min: 0,
                max: 100 
              })}
              className="input-field"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn-secondary"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary inline-flex items-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {shop ? 'Update Shop' : 'Create Shop'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}