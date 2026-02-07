import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, Eye, Edit } from "lucide-react";
import axiosClient from "../../../api/axiosClient";
import endpoints from "../../../api/endpoints";
import Pagination from "../../../components/common/Pagination";
import { usePaginatedApi } from "../../../hooks/useApi";

export default function AdminCustomers() {
  const [selectedShop, setSelectedShop] = useState("");
  const [shops, setShops] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("true");

  const {
    loading,
    items: customers,
    page,
    setPage,
    limit,
    total,
    pages,
    fetch,
  } = usePaginatedApi();

  useEffect(() => {
    fetchShops();
  }, []);

  // This useEffect should call fetch, not fetchCustomers
  useEffect(() => {
    console.log("Parameters changed, fetching customers...");
    loadCustomers();
  }, [page, selectedShop, statusFilter]);

  const fetchShops = async () => {
    try {
      const response = await axiosClient.get(endpoints.shops + "?limit=100");
      console.log("Shops API response:", response);

      if (response.success) {
        setShops(response.data || []);
        if (response.data?.length > 0 && !selectedShop) {
          setSelectedShop(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
  };

  const loadCustomers = async () => {
    try {
      const params = {
        shop: selectedShop || undefined,
        isActive: statusFilter === "all" ? undefined : statusFilter === "true",
        search: searchQuery || undefined,
      };

      console.log("Loading customers with params:", params);
      await fetch(endpoints.customers, params);
    } catch (error) {
      console.error("Error in loadCustomers:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadCustomers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage customers across all shops</p>
        </div>
        <Link
          to="/admin/customers/new"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
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
                placeholder="Search customers by name, phone, or email..."
                className="input-field pl-10"
              />
              <button type="submit" className="hidden">
                Search
              </button>
            </div>
          </form>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedShop}
                onChange={(e) => {
                  setSelectedShop(e.target.value);
                  setPage(1);
                }}
                className="input-field"
              >
                <option value="">All Shops</option>
                {shops.map((shop) => (
                  <option key={shop._id} value={shop._id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="input-field"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
              <option value="all">All Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Debug Info - Temporary */}
      {/* <div className="card bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4">Debug Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-yellow-700">State:</p>
            <p>Loading: {loading ? "Yes" : "No"}</p>
            <p>Customers Length: {customers ? customers.length : 0}</p>
            <p>Selected Shop: {selectedShop}</p>
          </div>
          <div>
            <p className="font-medium text-yellow-700">Pagination:</p>
            <p>Page: {page}</p>
            <p>Total: {total}</p>
            <p>Pages: {pages}</p>
          </div>
        </div>
        {customers && customers.length > 0 && (
          <div className="mt-4">
            <p className="font-medium text-yellow-700">First Customer:</p>
            <pre className="text-xs bg-yellow-100 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(customers[0], null, 2)}
            </pre>
          </div>
        )}
      </div> */}

      {/* Customers Table */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : customers && customers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No customers found</div>
            <p className="text-gray-600">
              Try adjusting your search or add a new customer
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="table-header">Customer ID</th>
                    <th className="table-header">Name</th>
                    <th className="table-header">Shop</th>
                    <th className="table-header">Contact</th>
                    <th className="table-header">Age/Gender</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers &&
                    customers.map((customer) => (
                      <tr key={customer._id}>
                        <td className="table-cell font-mono text-sm">
                          {customer.customerId || "N/A"}
                        </td>
                        <td className="table-cell">
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            {customer.tags && customer.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {customer.tags.slice(0, 2).map((tag, index) => (
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
                          {customer.shop?.name || "N/A"}
                        </td>
                        <td className="table-cell">
                          <div>
                            <p>{customer.phone}</p>
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
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              customer.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {customer.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/admin/customers/${customer._id}`}
                              className="text-primary-600 hover:text-primary-700 p-1"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/admin/customers/edit/${customer._id}`}
                              className="text-gray-600 hover:text-gray-700 p-1"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
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
                currentPage={page}
                totalPages={pages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}