import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import endpoints from '../../api/endpoints';
import CustomerForm from '../../components/forms/CustomerForm';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

export default function CustomerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [customer, setCustomer] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const isEdit = id && id !== 'new';

  useEffect(() => {
    console.log("CustomerFormPage - id:", id, "isEdit:", isEdit);
    
    if (isEdit) {
      fetchCustomer();
    }
    if (isAdmin) {
      fetchShops();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      console.log("Fetching customer with ID:", id);
      
      const response = await axiosClient.get(endpoints.customer(id));
      console.log("Customer API response:", response);
      
      if (response.success) {
        setCustomer(response.data?.customer || response.data);
      } else {
        throw new Error(response.message || 'Customer not found');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load customer';
      toast.error(errorMessage);
      navigate(isAdmin ? '/admin/customers' : '/shop/customers');
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
      toast.error('Failed to load shops list');
    }
  };

  const handleSubmit = async (formData) => {
  try {
    console.log("Submitting customer form data:", formData);
    setSaving(true);
    
    // Prepare clean data - convert empty strings to undefined/null
    const cleanData = {
      ...formData,
      // Ensure shop is included for admin users
      shop: isAdmin ? formData.shop : user.shop,
      
      // Handle optional fields - convert empty strings to undefined
      email: formData.email?.trim() || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      age: formData.age || undefined,
      
      // Clean up empty nested objects
      address: formData.address?.street ? formData.address : undefined,
      medicalHistory: Object.values(formData.medicalHistory || {}).some(val => val === true) 
        ? formData.medicalHistory 
        : undefined,
      insurance: formData.insurance?.provider ? formData.insurance : undefined,
      tags: formData.tags || []
    };

    // Remove empty address object if all fields are empty
    if (cleanData.address && !cleanData.address.street && !cleanData.address.city && 
        !cleanData.address.state && !cleanData.address.zipCode) {
      delete cleanData.address;
    }

    // Remove empty insurance object if all fields are empty
    if (cleanData.insurance && !cleanData.insurance.provider && 
        !cleanData.insurance.policyNumber && !cleanData.insurance.validUntil) {
      delete cleanData.insurance;
    }

    console.log("Clean data to submit:", cleanData);

    let response;
    
    if (isEdit) {
      // Update existing customer
      response = await axiosClient.put(endpoints.customer(id), cleanData);
      if (response.success) {
        toast.success('Customer updated successfully');
      } else {
        toast.error(response.message || 'Failed to update customer');
        return;
      }
    } else {
      // Create new customer
      response = await axiosClient.post(endpoints.customers, cleanData);
      if (response.success) {
        toast.success('Customer created successfully');
      } else {
        toast.error(response.message || 'Failed to create customer');
        return;
      }
    }
    
    // Navigate back to customers list
    navigate(isAdmin ? '/admin/customers' : '/shop/customers');
    
  } catch (error) {
    console.error('Error saving customer:', error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.errors?.[0]?.message || 
                        error.message || 
                        'Something went wrong';
    toast.error(errorMessage);
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const backPath = isAdmin ? '/admin/customers' : '/shop/customers';

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(backPath)}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Customer' : 'Create New Customer'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update customer information' : 'Add a new customer to the system'}
          </p>
        </div>
      </div>

      <CustomerForm
        customer={customer}
        onSubmit={handleSubmit}
        isLoading={saving}
        isAdmin={isAdmin}
        shops={shops}
      />
    </div>
  );
}