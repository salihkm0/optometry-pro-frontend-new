import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Save, Search, Eye, Plus, Minus } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import endpoints from '../../api/endpoints';

export default function RecordForm({ record, onSubmit, isLoading, isAdmin, shops = [], shopId, isEdit = false, customerId }) {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showAddFields, setShowAddFields] = useState(false);
  const [showNVFields, setShowNVFields] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    defaultValues: {
      customer: record?.customer?._id || customerId || '',
      date: record?.date ? record.date.split('T')[0] : new Date().toISOString().split('T')[0],
      examinationType: record?.examinationType || 'routine',
      prescriptionType: record?.prescriptionType || 'distance',
      // Right Eye DV
      right_eye: record?.right_eye || {
        dv: {
          sph: '',
          cyl: '',
          axis: '',
          va: '',
        },
        add: {
          sph: '',
          cyl: '',
          axis: '',
          va: '',
        },
        nv: {
          sph: '',
          cyl: '',
          axis: '',
          va: '',
        }
      },
      // Left Eye DV
      left_eye: record?.left_eye || {
        dv: {
          sph: '',
          cyl: '',
          axis: '',
          va: '',
        },
        add: {
          sph: '',
          cyl: '',
          axis: '',
          va: '',
        },
        nv: {
          sph: '',
          cyl: '',
          axis: '',
          va: '',
        }
      },
      // Additional measurements
      pd: record?.pd || '',
      ph: record?.ph || '',
      prism: record?.prism || '',
      base: record?.base || '',
      // Billing
      billing: {
        amount: record?.billing?.amount || '',
        paid: record?.billing?.paid || '',
        discount: record?.billing?.discount || 0,
        paymentMethod: record?.billing?.paymentMethod || 'cash',
      },
      status: record?.status || 'draft',
      nextAppointment: record?.nextAppointment ? record.nextAppointment.split('T')[0] : '',
      shop: record?.shop || (isAdmin && shops.length > 0 ? shops[0]._id : shopId),
      notes: record?.notes || '',
      recommendations: record?.recommendations || '',
      diagnosis: record?.diagnosis || '',
    }
  });

  useEffect(() => {
    if (record) {
      // If we have record data, reset form with all values
      reset({
        customer: record.customer?._id || '',
        date: record.date ? record.date.split('T')[0] : new Date().toISOString().split('T')[0],
        examinationType: record.examinationType || 'routine',
        prescriptionType: record.prescriptionType || 'distance',
        right_eye: record.right_eye || {
          dv: { sph: '', cyl: '', axis: '', va: '' },
          add: { sph: '', cyl: '', axis: '', va: '' },
          nv: { sph: '', cyl: '', axis: '', va: '' }
        },
        left_eye: record.left_eye || {
          dv: { sph: '', cyl: '', axis: '', va: '' },
          add: { sph: '', cyl: '', axis: '', va: '' },
          nv: { sph: '', cyl: '', axis: '', va: '' }
        },
        pd: record.pd || '',
        ph: record.ph || '',
        prism: record.prism || '',
        base: record.base || '',
        billing: record.billing || {
          amount: '', paid: '', discount: 0, paymentMethod: 'cash'
        },
        status: record.status || 'draft',
        nextAppointment: record.nextAppointment ? record.nextAppointment.split('T')[0] : '',
        shop: record.shop || (isAdmin && shops.length > 0 ? shops[0]._id : shopId),
        notes: record.notes || '',
        recommendations: record.recommendations || '',
        diagnosis: record.diagnosis || '',
      });
      setSelectedCustomer(record.customer || null);
      
      // Show ADD fields if they have data
      if (record.right_eye?.add?.sph || record.left_eye?.add?.sph) {
        setShowAddFields(true);
      }
      // Show NV fields if they have data
      if (record.right_eye?.nv?.sph || record.left_eye?.nv?.sph) {
        setShowNVFields(true);
      }
    } else if (customerId) {
      // If we have customerId from query params, try to fetch customer
      fetchCustomerById(customerId);
    }
  }, [record, customerId, reset, isAdmin, shops, shopId]);

  useEffect(() => {
    if (customerId && !record) {
      setValue('customer', customerId);
    }
  }, [customerId, record, setValue]);

  const fetchCustomerById = async (id) => {
    try {
      const response = await axiosClient.get(endpoints.customer(id));
      if (response.success) {
        setSelectedCustomer(response.data?.customer || response.data);
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  };

  const searchCustomers = async () => {
    try {
      const params = {
        q: searchTerm,
        shopId: watch('shop'),
        limit: 10,
      };
      
      const response = await axiosClient.get(endpoints.searchCustomers, { params });
      if (response.success) {
        setCustomers(response.data.customers || []);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  useEffect(() => {
    if (searchTerm.length > 2) {
      const delayDebounce = setTimeout(() => {
        searchCustomers();
      }, 500);

      return () => clearTimeout(delayDebounce);
    }
  }, [searchTerm]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setValue('customer', customer._id);
    setShowCustomerSearch(false);
    setSearchTerm('');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Customer Selection - Only show for new records */}
      {!isEdit && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Customer Information</h2>
          
          {isAdmin && selectedCustomer === null && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop *
              </label>
              <select
                {...register('shop', { required: 'Shop is required' })}
                className="input-field"
                onChange={() => setSelectedCustomer(null)}
              >
                <option value="">Select Shop</option>
                {shops.map(shop => (
                  <option key={shop._id} value={shop._id}>
                    {shop.name}
                  </option>
                ))}
              </select>
              {errors.shop && (
                <p className="mt-1 text-sm text-red-600">{errors.shop.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer *
            </label>
            
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-gray-50">
                <div>
                  <p className="font-medium">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-500">
                    {selectedCustomer.phone} • {selectedCustomer.age || 'N/A'} • {selectedCustomer.sex || 'N/A'}
                  </p>
                  {selectedCustomer.customerId && (
                    <p className="text-xs text-gray-400 mt-1">ID: {selectedCustomer.customerId}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setValue('customer', '');
                  }}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setShowCustomerSearch(true)}
                      className="input-field pl-10"
                      placeholder="Search customer by name, phone, or ID..."
                    />
                  </div>
                </div>

                {showCustomerSearch && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                    {customers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {searchTerm.length < 3 ? 'Type at least 3 characters' : 'No customers found'}
                      </div>
                    ) : (
                      customers.map(customer => (
                        <div
                          key={customer._id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center">
                            <div className="flex-1">
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-gray-500">
                                {customer.phone} • {customer.age || 'N/A'} • {customer.sex || 'N/A'}
                              </p>
                            </div>
                            <Eye className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            <input type="hidden" {...register('customer', { required: !isEdit && 'Customer is required' })} />
            {errors.customer && (
              <p className="mt-1 text-sm text-red-600">{errors.customer.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Show customer info for edit mode */}
      {isEdit && selectedCustomer && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Customer Information</h2>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-gray-50">
            <div>
              <p className="font-medium">{selectedCustomer.name}</p>
              <p className="text-sm text-gray-500">
                {selectedCustomer.phone} • {selectedCustomer.age || 'N/A'} • {selectedCustomer.sex || 'N/A'}
              </p>
              {selectedCustomer.customerId && (
                <p className="text-xs text-gray-400 mt-1">ID: {selectedCustomer.customerId}</p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Customer cannot be changed
            </div>
          </div>
        </div>
      )}

      {/* Examination Details */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Examination Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="input-field"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Examination Type
            </label>
            <select
              {...register('examinationType')}
              className="input-field"
            >
              <option value="routine">Routine</option>
              <option value="comprehensive">Comprehensive</option>
              <option value="contact_lens">Contact Lens</option>
              <option value="follow_up">Follow-up</option>
              <option value="emergency">Emergency</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prescription Type
            </label>
            <select
              {...register('prescriptionType')}
              className="input-field"
            >
              <option value="distance">Distance</option>
              <option value="reading">Reading</option>
              <option value="bifocal">Bifocal</option>
              <option value="progressive">Progressive</option>
              <option value="computer">Computer</option>
              <option value="sunglasses">Sunglasses</option>
              <option value="contact_lens">Contact Lens</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              {...register('status')}
              className="input-field"
            >
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Eye Measurements - TABLE LAYOUT */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Eye Measurements</h2>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowAddFields(!showAddFields)}
              className="inline-flex items-center px-3 py-1 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              {showAddFields ? <Minus className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
              {showAddFields ? 'Hide ADD' : 'Show ADD'}
            </button>
            <button
              type="button"
              onClick={() => setShowNVFields(!showNVFields)}
              className="inline-flex items-center px-3 py-1 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              {showNVFields ? <Minus className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
              {showNVFields ? 'Hide NV' : 'Show NV'}
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Lens</th>
                <th colSpan="4" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Right Eye (OD)</th>
                <th colSpan="4" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Left Eye (OS)</th>
              </tr>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r"></th>
                
                {/* Right Eye Headers */}
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SPH</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">CYL</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">AXIS</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">V/A</th>
                
                {/* Left Eye Headers */}
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SPH</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">CYL</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">AXIS</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">V/A</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* DV Row */}
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r">Dv</td>
                
                {/* Right Eye DV */}
                <td className="px-3 py-2">
                  <input
                    type="text"
                    {...register('right_eye.dv.sph')}
                    className="input-field text-center w-full px-1 py-1"
                    placeholder="-2.50"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    {...register('right_eye.dv.cyl')}
                    className="input-field text-center w-full px-1 py-1"
                    placeholder="-1.25"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    {...register('right_eye.dv.axis')}
                    className="input-field text-center w-full px-1 py-1"
                    placeholder="180"
                  />
                </td>
                <td className="px-3 py-2 border-r">
                  <input
                    type="text"
                    {...register('right_eye.dv.va')}
                    className="input-field text-center w-full px-1 py-1"
                    placeholder="20/20"
                  />
                </td>
                
                {/* Left Eye DV */}
                <td className="px-3 py-2">
                  <input
                    type="text"
                    {...register('left_eye.dv.sph')}
                    className="input-field text-center w-full px-1 py-1"
                    placeholder="-2.50"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    {...register('left_eye.dv.cyl')}
                    className="input-field text-center w-full px-1 py-1"
                    placeholder="-1.25"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    {...register('left_eye.dv.axis')}
                    className="input-field text-center w-full px-1 py-1"
                    placeholder="180"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    {...register('left_eye.dv.va')}
                    className="input-field text-center w-full px-1 py-1"
                    placeholder="20/20"
                  />
                </td>
              </tr>
              
              {/* ADD Row - Conditionally Shown */}
              {showAddFields && (
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r">Add</td>
                  
                  {/* Right Eye Add */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      {...register('right_eye.add.sph')}
                      className="input-field text-center w-full px-1 py-1"
                      placeholder="+1.50"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      {...register('right_eye.add.cyl')}
                      className="input-field text-center w-full px-1 py-1"
                      placeholder=""
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      {...register('right_eye.add.axis')}
                      className="input-field text-center w-full px-1 py-1"
                      placeholder=""
                    />
                  </td>
                  <td className="px-3 py-2 border-r">
                    <input
                      type="text"
                      {...register('right_eye.add.va')}
                      className="input-field text-center w-full px-1 py-1"
                      placeholder="N6"
                    />
                  </td>
                  
                  {/* Left Eye Add */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      {...register('left_eye.add.sph')}
                      className="input-field text-center w-full px-1 py-1"
                      placeholder="+1.50"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      {...register('left_eye.add.cyl')}
                      className="input-field text-center w-full px-1 py-1"
                      placeholder=""
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      {...register('left_eye.add.axis')}
                      className="input-field text-center w-full px-1 py-1"
                      placeholder=""
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      {...register('left_eye.add.va')}
                      className="input-field text-center w-full px-1 py-1"
                      placeholder="N6"
                    />
                  </td>
                </tr>
              )}

              {/* NV Row - Conditionally Shown */}
              {showNVFields && (
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r">Nv</td>
                  
                  {/* Right Eye NV */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      {...register('right_eye.nv.sph')}
                      className="input-field text-center w-full px-1 py-1"
                      placeholder=""
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      {...register('right_eye.nv.cyl')}
                      className="input-field text-center w-full px-1 py-1"
                      placeholder=""
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      {...register('right_eye.nv.axis')}
                      className="input-field text-center w-full px-1 py-1"
                      placeholder=""
                    />
                  </td>
                  <td className="px-3 py-2 border-r">
                    <input
                      type="text"
                      {...register('right_eye.nv.va')}
                      className="input-field text-center w-full px-1 py-1"
                      placeholder=""
                    />
                  </td>
                  
                  {/* Left Eye NV */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      {...register('left_eye.nv.sph')}
                      className="input-field text-center w-full px-1 py-1"
                      placeholder=""
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      {...register('left_eye.nv.cyl')}
                      className="input-field text-center w-full px-1 py-1"
                      placeholder=""
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      {...register('left_eye.nv.axis')}
                      className="input-field text-center w-full px-1 py-1"
                      placeholder=""
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      {...register('left_eye.nv.va')}
                      className="input-field text-center w-full px-1 py-1"
                      placeholder=""
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Additional Measurements */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Measurements</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PD (mm)
              </label>
              <input
                type="text"
                {...register('pd')}
                className="input-field"
                placeholder="62.0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PH (mm)
              </label>
              <input
                type="text"
                {...register('ph')}
                className="input-field"
                placeholder="32.0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prism (Δ)
              </label>
              <input
                type="text"
                {...register('prism')}
                className="input-field"
                placeholder="2.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base
              </label>
              <select
                {...register('base')}
                className="input-field"
              >
                <option value="">Select Base</option>
                <option value="BU">BU (Base Up)</option>
                <option value="BD">BD (Base Down)</option>
                <option value="BI">BI (Base In)</option>
                <option value="BO">BO (Base Out)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Notes & Recommendations */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Clinical Information</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows="3"
              className="input-field"
              placeholder="Additional examination notes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendations
            </label>
            <textarea
              {...register('recommendations')}
              rows="3"
              className="input-field"
              placeholder="Recommendations for treatment or follow-up..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnosis
            </label>
            <textarea
              {...register('diagnosis')}
              rows="3"
              className="input-field"
              placeholder="Clinical diagnosis..."
            />
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Billing Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('billing.amount')}
              className="input-field"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paid ($)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('billing.paid')}
              className="input-field"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount (%)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('billing.discount')}
              className="input-field"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              {...register('billing.paymentMethod')}
              className="input-field"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="insurance">Insurance</option>
              <option value="online">Online</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Next Appointment */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Follow-up Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Appointment
            </label>
            <input
              type="date"
              {...register('nextAppointment')}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Follow-up Notes
            </label>
            <textarea
              {...register('followUpNotes')}
              rows="3"
              className="input-field"
              placeholder="Notes for follow-up appointment..."
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
              {record ? 'Update Record' : 'Create Record'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}