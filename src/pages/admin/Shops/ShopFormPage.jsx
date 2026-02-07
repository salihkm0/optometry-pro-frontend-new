import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import endpoints from '../../../api/endpoints';
import ShopForm from '../../../components/forms/ShopForm';
import { toast } from 'react-hot-toast';

export default function ShopFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchShop();
    }
  }, [id]);

  const fetchShop = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(endpoints.shops + '/' + id);
      if (response.success) {
        setShop(response.data.shop);
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
      toast.error('Failed to load shop');
      navigate('/admin/shops');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setSaving(true);
      let response;

      if (id && id !== 'new') {
        // Update shop
        response = await axiosClient.put(endpoints.shops + '/' + id, data);
        if (response.success) {
          toast.success('Shop updated successfully');
          navigate('/admin/shops');
        }
      } else {
        // Create shop
        response = await axiosClient.post(endpoints.shops, data);
        if (response.success) {
          toast.success('Shop created successfully');
          navigate('/admin/shops');
        }
      }
    } catch (error) {
      console.error('Error saving shop:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/shops')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {id && id !== 'new' ? 'Edit Shop' : 'Create New Shop'}
          </h1>
          <p className="text-gray-600">
            {id && id !== 'new' ? 'Update shop information' : 'Add a new shop to the system'}
          </p>
        </div>
      </div>

      <ShopForm
        shop={shop}
        onSubmit={handleSubmit}
        isLoading={saving}
      />
    </div>
  );
}