import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import axiosClient from "../../../api/axiosClient";
import endpoints from "../../../api/endpoints";
import Pagination from "../../../components/common/Pagination";
import { useAuthStore } from "../../../store/authStore";
import { toast } from "react-hot-toast";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [filters, setFilters] = useState({
    isActive: "true",
    sex: "",
    tags: "",
  });
  const [deletingId, setDeletingId] = useState(null); // Track which customer is being deleted

  const { user } = useAuthStore();

  // Fetch customers when page or filters change
  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, filters]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchCustomers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      
      if (searchQuery && searchQuery.trim() !== '') {
        params.search = searchQuery;
      }
      
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axiosClient.get(endpoints.customers, { params });
      
      if (response.success) {
        setCustomers(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 1,
          page: response.pagination?.pages && pagination.page > response.pagination.pages 
            ? 1 
            : prev.page
        }));
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  // Delete customer function
  const handleDeleteCustomer = async (customerId, customerName) => {
    if (!window.confirm(`Are you sure you want to delete customer "${customerName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(customerId);
      
      const response = await axiosClient.delete(endpoints.customer(customerId));
      
      if (response.success) {
        toast.success(`Customer "${customerName}" deleted successfully`);
        
        // Remove the deleted customer from the state
        setCustomers(prev => prev.filter(customer => customer._id !== customerId));
        
        // Update pagination total
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1,
        }));
        
        // If current page becomes empty, go to previous page
        if (customers.length === 1 && pagination.page > 1) {
          setPagination(prev => ({ ...prev, page: prev.page - 1 }));
        }
      } else {
        toast.error(response.message || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete customer';
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCustomers();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilters({
      isActive: "true",
      sex: "",
      tags: "",
    });
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
      pages: 1,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {(searchQuery || filters.sex || filters.isActive !== "true") && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md border border-gray-300"
            >
              Reset Filters
            </button>
          )}
          <Link
            to="/shop/customers/new"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Link>
        </div>
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
                placeholder="Search customers by name, phone, or email..."
                className="input-field pl-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </form>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filters.sex}
                onChange={(e) => handleFilterChange("sex", e.target.value)}
                className="input-field"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange("isActive", e.target.value)}
              className="input-field"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
              <option value="">All Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No customers found</div>
            <p className="text-gray-600">
              Try adjusting your search or add a new customer
            </p>
            {(searchQuery || filters.sex || filters.isActive !== "true") && (
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md border border-primary-200"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {customers.length} of {pagination.total} customers
                {searchQuery && (
                  <span className="ml-2">
                    for "<span className="font-medium">{searchQuery}</span>"
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="table-header">Customer ID</th>
                    <th className="table-header">Name</th>
                    <th className="table-header">Contact</th>
                    <th className="table-header">Age/Gender</th>
                    <th className="table-header">Last Visit</th>
                    <th className="table-header">Total Visits</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer._id}>
                      <td className="table-cell font-mono text-sm">
                        {customer.customerId || "N/A"}
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          {customer.tags && customer.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {customer.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <p>{customer.phone || "N/A"}</p>
                          <p className="text-sm text-gray-500">
                            {customer.email || "No email"}
                          </p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <p>{customer.age || "N/A"}</p>
                          <p className="text-sm text-gray-500">
                            {customer.sex || ""}
                          </p>
                        </div>
                      </td>
                      <td className="table-cell">
                        {customer.lastVisit
                          ? new Date(customer.lastVisit).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {customer.totalVisits || 0}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/shop/customers/${customer._id}`}
                            className="text-primary-600 hover:text-primary-700 p-1"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/shop/customers/edit/${customer._id}`}
                            className="text-gray-600 hover:text-gray-700 p-1"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/shop/records/new?customer=${customer._id}`}
                            className="text-green-600 hover:text-green-700 p-1 text-sm font-medium"
                            title="Add Record"
                          >
                            + Record
                          </Link>
                          <button
                            onClick={() => handleDeleteCustomer(customer._id, customer.name)}
                            disabled={deletingId === customer._id}
                            className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Customer"
                          >
                            {deletingId === customer._id ? (
                              <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}