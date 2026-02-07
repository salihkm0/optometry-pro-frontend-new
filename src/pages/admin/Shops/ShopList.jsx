import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import endpoints from '../../../api/endpoints';
import Pagination from '../../../components/common/Pagination';
import ConfirmModal from '../../../components/modals/ConfirmModal';
import { toast } from 'react-hot-toast';

export default function ShopList() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    shopId: null,
    shopName: '',
  });

  useEffect(() => {
    fetchShops();
  }, [pagination.page, statusFilter]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        search: searchQuery || undefined,
      };

      const response = await axiosClient.get(endpoints.shops, { params });
      console.log("Fetched shops response:", response);
      if (response.success) {
        setShops(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.pages || 1,
        }));
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchShops();
  };

  const handleStatusChange = (shopId, activate) => {
    const endpoint = activate 
      ? endpoints.shopActivate(shopId)
      : endpoints.shopDeactivate(shopId);
    
    axiosClient.put(endpoint)
      .then(response => {
        if (response.success) {
          toast.success(`Shop ${activate ? 'activated' : 'deactivated'} successfully`);
          fetchShops();
        }
      })
      .catch(error => {
        console.error('Error updating shop status:', error);
      });
  };

  const handleDelete = async () => {
    try {
      const response = await axiosClient.delete(endpoints.shops + '/' + deleteModal.shopId);
      if (response.success) {
        toast.success('Shop deleted successfully');
        fetchShops();
        setDeleteModal({ isOpen: false, shopId: null, shopName: '' });
      }
    } catch (error) {
      console.error('Error deleting shop:', error);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shops</h1>
            <p className="text-gray-600">Manage all optometry shops</p>
          </div>
          <Link
            to="/admin/shops/new"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Shop
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <form onSubmit={handleSearch} className="flex-1 md:max-w-sm">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shops..."
                  className="input-field pl-10"
                />
              </div>
            </form>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Shops Table */}
        <div className="card">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No shops found</div>
              <p className="text-gray-600">Try adjusting your search or add a new shop</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="table-header">Shop Name</th>
                      <th className="table-header">Owner</th>
                      <th className="table-header">Contact</th>
                      <th className="table-header">Location</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Created</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {shops.map((shop) => (
                      <tr key={shop._id}>
                        <td className="table-cell">
                          <div>
                            <p className="font-medium">{shop.name}</p>
                            <p className="text-sm text-gray-500">{shop.contact?.email}</p>
                          </div>
                        </td>
                        <td className="table-cell">
                          {shop.owner?.name || 'N/A'}
                        </td>
                        <td className="table-cell">
                          <p>{shop.contact?.phone}</p>
                          <p className="text-sm text-gray-500">{shop.contact?.email}</p>
                        </td>
                        <td className="table-cell">
                          {shop.contact?.address?.city || 'N/A'}
                        </td>
                        <td className="table-cell">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            shop.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {shop.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="table-cell">
                          {new Date(shop.createdAt).toLocaleDateString()}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/admin/shops/edit/${shop._id}`}
                              className="text-primary-600 hover:text-primary-700 p-1"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleStatusChange(shop._id, !shop.isActive)}
                              className={`p-1 ${
                                shop.isActive 
                                  ? 'text-red-600 hover:text-red-700' 
                                  : 'text-green-600 hover:text-green-700'
                              }`}
                            >
                              {shop.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => setDeleteModal({
                                isOpen: true,
                                shopId: shop._id,
                                shopName: shop.name,
                              })}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, shopId: null, shopName: '' })}
        onConfirm={handleDelete}
        title="Delete Shop"
        message={`Are you sure you want to delete "${deleteModal.shopName}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
      />
    </>
  );
}