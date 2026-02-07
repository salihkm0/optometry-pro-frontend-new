import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import endpoints from '../../api/endpoints';
import LoadingSpinner from '../common/LoadingSpinner';

export default function CustomerModal({ isOpen, onClose, onSelect, shopId }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen, shopId]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
        page: 1,
        search: searchQuery || undefined,
      };

      const response = await axiosClient.get(endpoints.customers, { params });
      
      if (response.success) {
        // Filter by shop if shopId is provided
        const filteredCustomers = shopId 
          ? (response.data.data || []).filter(c => c.shop === shopId)
          : (response.data.data || []);
        setCustomers(filteredCustomers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 w-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Select Customer
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search customers by name, phone, or email..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      Search
                    </button>
                  </div>
                </form>

                {/* Customers List */}
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <LoadingSpinner />
                    </div>
                  ) : customers.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No customers found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customers.map((customer) => (
                        <div
                          key={customer._id}
                          onClick={() => onSelect(customer)}
                          className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{customer.name}</p>
                              <p className="text-sm text-gray-500 mt-1">{customer.phone}</p>
                              {customer.email && (
                                <p className="text-sm text-gray-500">{customer.email}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                {customer.customerId}
                              </span>
                              <p className="text-sm text-gray-500 mt-1">
                                {customer.age || 'N/A'} • {customer.sex || 'N/A'}
                              </p>
                            </div>
                          </div>
                          {customer.tags && customer.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {customer.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Create New Customer Button */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      onClose();
                      // Navigate to create customer page
                      window.location.href = '/shop/customers/new';
                    }}
                    className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                  >
                    + Create New Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}