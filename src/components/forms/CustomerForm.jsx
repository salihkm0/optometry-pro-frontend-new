import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Save, Plus, X } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

const TAGS = ['vip', 'frequent', 'new', 'referred', 'senior', 'child', 'contact_lens'];

export default function CustomerForm({ customer, onSubmit, isLoading, isAdmin, shops = [] }) {
  const [selectedTags, setSelectedTags] = useState(customer?.tags || []);
  const [newTag, setNewTag] = useState('');

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue, 
    reset,
    watch 
  } = useForm({
    defaultValues: {
      name: customer?.name || '',
      phone: customer?.phone || '',
      email: customer?.email || '',
      age: customer?.age || '',
      sex: customer?.sex || '',
      dateOfBirth: customer?.dateOfBirth ? customer.dateOfBirth.split('T')[0] : '',
      address: customer?.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
      medicalHistory: customer?.medicalHistory || {
        diabetes: false,
        hypertension: false,
        glaucoma: false,
        cataract: false,
      },
      insurance: customer?.insurance || {
        provider: '',
        policyNumber: '',
        validUntil: '',
      },
      shop: customer?.shop || (isAdmin && shops.length > 0 ? shops[0]?._id : ''),
    }
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        age: customer.age || '',
        sex: customer.sex || '',
        dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.split('T')[0] : '',
        address: customer.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
        },
        medicalHistory: customer.medicalHistory || {
          diabetes: false,
          hypertension: false,
          glaucoma: false,
          cataract: false,
        },
        insurance: customer.insurance || {
          provider: '',
          policyNumber: '',
          validUntil: '',
        },
        shop: customer.shop || '',
      });
      setSelectedTags(customer.tags || []);
    }
  }, [customer, reset]);

  const handleTagToggle = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim().toLowerCase())) {
      const newTags = [...selectedTags, newTag.trim().toLowerCase()];
      setSelectedTags(newTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
  };

  const onFormSubmit = (data) => {
    // Combine form data with tags
    const formData = {
      ...data,
      tags: selectedTags,
      // Ensure address is properly structured
      address: data.address || {},
      medicalHistory: data.medicalHistory || {},
      insurance: data.insurance || {}
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop *
              </label>
              <select
                {...register('shop', { required: 'Shop is required' })}
                className="input-field"
              >
                <option value="">Select Shop</option>
                {shops.map(shop => (
                  <option key={shop._id} value={shop._id}>
                    {shop.name}
                  </option>
                ))}
              </select>
              {errors.shop && (
                <p className="mt-1 text-sm text-red-600">{errors.shop?.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="input-field"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name?.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              {...register('phone', { 
                required: 'Phone number is required',
                pattern: {
                  value: /^[\+]?[1-9][\d]{0,15}$/,
                  message: 'Invalid phone number'
                }
              })}
              className="input-field"
              placeholder="+1234567890"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone?.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              {...register('email', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="input-field"
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <input
              type="number"
              {...register('age', { 
                min: { value: 0, message: 'Age must be at least 0' },
                max: { value: 150, message: 'Age cannot exceed 150' }
              })}
              className="input-field"
              placeholder="30"
            />
            {errors.age && (
              <p className="mt-1 text-sm text-red-600">{errors.age?.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              {...register('sex')}
              className="input-field"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              {...register('dateOfBirth')}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Address</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street
            </label>
            <input
              type="text"
              {...register('address.street')}
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
              {...register('address.city')}
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
              {...register('address.state')}
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
              {...register('address.zipCode')}
              className="input-field"
              placeholder="10001"
            />
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Medical History</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="diabetes"
              {...register('medicalHistory.diabetes')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="diabetes" className="ml-2 block text-sm text-gray-700">
              Diabetes
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="hypertension"
              {...register('medicalHistory.hypertension')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="hypertension" className="ml-2 block text-sm text-gray-700">
              Hypertension
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="glaucoma"
              {...register('medicalHistory.glaucoma')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="glaucoma" className="ml-2 block text-sm text-gray-700">
              Glaucoma
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="cataract"
              {...register('medicalHistory.cataract')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="cataract" className="ml-2 block text-sm text-gray-700">
              Cataract
            </label>
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Insurance Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provider
            </label>
            <input
              type="text"
              {...register('insurance.provider')}
              className="input-field"
              placeholder="Insurance Company"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy Number
            </label>
            <input
              type="text"
              {...register('insurance.policyNumber')}
              className="input-field"
              placeholder="POL123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valid Until
            </label>
            <input
              type="date"
              {...register('insurance.validUntil')}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Tags</h2>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {TAGS.map(tag => (
              <button
                type="button"
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add custom tag"
              className="input-field"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="btn-secondary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </button>
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
              {customer ? 'Update Customer' : 'Create Customer'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}