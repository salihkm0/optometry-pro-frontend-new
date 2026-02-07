import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import endpoints from '../../api/endpoints';
import RecordForm from '../../components/forms/RecordForm';
import RecordPrintPreview from '../shop/Records/RecordPrintPreview.jsx';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

export default function RecordFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  
  const [record, setRecord] = useState(null);
  const [recordForPreview, setRecordForPreview] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const isEdit = id && id !== 'new';
  
  // Get customer ID from query params if provided
  const searchParams = new URLSearchParams(location.search);
  const customerId = searchParams.get('customer');

  useEffect(() => {
    console.log("RecordFormPage - isEdit:", isEdit, "id:", id);
    
    if (isEdit) {
      fetchRecord();
    }
    if (isAdmin) {
      fetchShops();
    }
  }, [id]);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      console.log("Fetching record with ID:", id);
      
      const response = await axiosClient.get(endpoints.record(id));
      console.log("Record API response:", response);
      
      if (response.success) {
        setRecord(response.data?.record || response.data);
      } else {
        throw new Error(response.message || 'Record not found');
      }
    } catch (error) {
      console.error('Error fetching record:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load record';
      toast.error(errorMessage);
      navigate(isAdmin ? '/admin/records' : '/shop/records');
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const response = await axiosClient.get(endpoints.shops + '?limit=100');
      console.log("Shops API response:", response);
      
      if (response.success) {
        setShops(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const handlePreview = async (formData) => {
    try {
      // Create a preview object with form data
      const previewData = {
        ...formData,
        customer: record?.customer || formData.customer,
        recordId: record?.recordId || `TEMP-${Date.now()}`,
        status: record?.status || 'draft',
        createdAt: record?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user,
        // Add mock data for preview if needed
        billing: {
          ...formData.billing,
          amount: formData.billing?.amount || 0,
          paid: formData.billing?.paid || 0,
          discount: formData.billing?.discount || 0,
          paymentMethod: formData.billing?.paymentMethod || 'cash',
        },
        optometrist: record?.optometrist || formData.optometrist,
        assistant: record?.assistant || formData.assistant,
      };
      
      setRecordForPreview(previewData);
      setShowPreview(true);
    } catch (error) {
      console.error('Error creating preview:', error);
      toast.error('Failed to generate preview');
    }
  };

  const handlePrint = () => {
    if (!recordForPreview && !record) {
      toast.error('No record data available for printing');
      return;
    }
    
    setShowPreview(true);
    setTimeout(() => {
      window.print();
      setShowPreview(false);
    }, 100);
  };

  const handleExport = async () => {
    try {
      if (!record) {
        toast.error('Save the record first before exporting');
        return;
      }
      
      const response = await axiosClient.get(endpoints.exportRecord(id), {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `record_${record.recordId}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting record:', error);
      toast.error('Failed to export record');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      console.log("Submitting record form data:", formData);
      setSaving(true);
      
      // Prepare clean data - for edit mode, exclude customer and shop
      const cleanData = { ...formData };
      
      // Format date fields
      if (cleanData.date) {
        cleanData.date = new Date(cleanData.date).toISOString();
      }
      
      if (cleanData.nextAppointment) {
        cleanData.nextAppointment = new Date(cleanData.nextAppointment).toISOString();
      }
      
      // Format eye measurement data properly
      if (cleanData.right_eye) {
        cleanData.right_eye = formatEyeData(cleanData.right_eye);
      }
      
      if (cleanData.left_eye) {
        cleanData.left_eye = formatEyeData(cleanData.left_eye);
      }
      
      // Format billing data
      if (cleanData.billing) {
        cleanData.billing = {
          amount: parseFloat(cleanData.billing.amount) || 0,
          paid: parseFloat(cleanData.billing.paid) || 0,
          discount: parseInt(cleanData.billing.discount) || 0,
          paymentMethod: cleanData.billing.paymentMethod || 'cash',
        };
      }
      
      if (isEdit) {
        // Remove customer and shop fields for edit mode
        delete cleanData.customer;
        delete cleanData.shop;
        
        console.log("Edit mode - cleaned data (removed customer/shop):", cleanData);
      } else {
        // For new records, ensure shop is included
        cleanData.shop = isAdmin ? formData.shop : user.shop;
        
        // Validate customer is selected
        if (!formData.customer) {
          toast.error('Please select a customer');
          setSaving(false);
          return;
        }
        
        // Generate record ID if not provided
        if (!cleanData.recordId) {
          cleanData.recordId = generateRecordId();
        }
      }

      let response;
      
      if (isEdit) {
        // Update existing record
        response = await axiosClient.put(endpoints.record(id), cleanData);
        if (response.success) {
          toast.success('Record updated successfully');
          setRecord(response.data?.record || response.data);
        } else {
          toast.error(response.message || 'Failed to update record');
          return;
        }
      } else {
        // Create new record
        response = await axiosClient.post(endpoints.records, cleanData);
        if (response.success) {
          toast.success('Record created successfully');
        } else {
          toast.error(response.message || 'Failed to create record');
          return;
        }
      }
      
      // Navigate back to records list
      navigate(isAdmin ? '/admin/records' : '/shop/records');
      
    } catch (error) {
      console.error('Error saving record:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.message || 
                          error.message || 
                          'Something went wrong';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Helper function to format eye data
  const formatEyeData = (eyeData) => {
    const formatted = {};
    
    ['dv', 'add', 'nv'].forEach(type => {
      if (eyeData[type]) {
        formatted[type] = {
          sph: eyeData[type].sph || '',
          cyl: eyeData[type].cyl || '',
          axis: eyeData[type].axis || '',
          va: eyeData[type].va || '',
        };
      }
    });
    
    return formatted;
  };

  // Helper function to generate record ID
  const generateRecordId = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `REC-${year}${month}${day}-${random}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const backPath = isAdmin ? '/admin/records' : '/shop/records';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <button
            onClick={() => navigate(backPath)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Record' : 'Create New Record'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Update record information' : 'Add a new optometry record'}
            </p>
          </div>
        </div>
        
        {isEdit && record && (
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecordForm
            record={record}
            onSubmit={handleSubmit}
            onPreview={handlePreview}
            isLoading={saving}
            isAdmin={isAdmin}
            shops={shops}
            shopId={user.shop}
            isEdit={isEdit}
            customerId={customerId}
          />
        </div>
        
        {isEdit && record && (
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Record Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Record ID</p>
                  <p className="font-mono text-lg font-semibold text-gray-900">{record.recordId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    record.status === 'completed' ? 'bg-green-100 text-green-800' :
                    record.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    record.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {record.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">
                    {new Date(record.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                
                {record.customer && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Customer</h4>
                    <p className="text-sm text-gray-900 font-medium">{record.customer.name}</p>
                    <p className="text-sm text-gray-600">{record.customer.phone}</p>
                    <button
                      onClick={() => navigate(`/shop/customers/${record.customer._id}`)}
                      className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                    >
                      View Profile →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Print Preview</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6">
              <RecordPrintPreview 
                record={recordForPreview || record} 
                isPreview={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}