import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Calendar, Download, Trash2 } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import endpoints from '../../../api/endpoints';
import Pagination from '../../../components/common/Pagination';
import { useAuthStore } from '../../../store/authStore';
import { formatDate, getStatusColor } from '../../../utils/helpers';
import { toast } from 'react-hot-toast';

export default function RecordList() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [examinationType, setExaminationType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  
  // Use ref to track initial mount and prevent unnecessary calls
  const isInitialMount = useRef(true);
  // Use ref to track if we're currently fetching to prevent duplicate calls
  const isFetching = useRef(false);
  // Use ref to store the current filter state for comparison
  const filterState = useRef({
    page: 1,
    status: '',
    examinationType: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  // Fetch records function
  const fetchRecords = useCallback(async (isRetry = false) => {
    // Prevent duplicate simultaneous calls
    if (isFetching.current && !isRetry) {
      console.log('Already fetching, skipping...');
      return;
    }

    try {
      isFetching.current = true;
      setLoading(true);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        shop: user.shop,
        status: statusFilter || undefined,
        examinationType: examinationType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: searchQuery || undefined,
      };

      // Clean up params
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      console.log('Fetching records with params:', params);
      
      const response = await axiosClient.get(endpoints.records, { params });
      console.log('Records API response:', response);
      
      if (response.success) {
        setRecords(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 1,
        }));
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [pagination.page, pagination.limit, statusFilter, examinationType, startDate, endDate, searchQuery, user.shop]);

  // Single effect to handle all data fetching
  useEffect(() => {
    // Check if filters actually changed to prevent unnecessary calls
    const currentFilterState = {
      page: pagination.page,
      status: statusFilter,
      examinationType: examinationType,
      startDate: startDate,
      endDate: endDate,
      search: searchQuery
    };

    // Skip if this is the initial mount and we want to load data
    if (isInitialMount.current) {
      isInitialMount.current = false;
      filterState.current = currentFilterState;
      fetchRecords();
      return;
    }

    // Check if filters actually changed
    const filtersChanged = JSON.stringify(filterState.current) !== JSON.stringify(currentFilterState);
    
    if (filtersChanged) {
      filterState.current = currentFilterState;
      fetchRecords();
    }
  }, [pagination.page, statusFilter, examinationType, startDate, endDate, searchQuery, fetchRecords]);

  // Debounced search
  useEffect(() => {
    // Don't run on initial mount
    if (isInitialMount.current) return;

    const timer = setTimeout(() => {
      if (searchQuery !== filterState.current.search) {
        setPagination(prev => ({ ...prev, page: 1 }));
        // The page change will trigger the main effect
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    // The state change will trigger the main effect
  };

  const handlePageChange = (page) => {
    // Prevent unnecessary updates if it's the same page
    if (page === pagination.page) return;
    
    setPagination(prev => ({ ...prev, page }));
    // The state change will trigger the main effect
  };

  const handleFilterChange = (filterType, value) => {
    // Reset specific filter and page
    if (filterType === 'status') {
      if (value === statusFilter) return; // No change
      setStatusFilter(value);
    }
    if (filterType === 'examinationType') {
      if (value === examinationType) return; // No change
      setExaminationType(value);
    }
    if (filterType === 'startDate') {
      if (value === startDate) return; // No change
      setStartDate(value);
    }
    if (filterType === 'endDate') {
      if (value === endDate) return; // No change
      setEndDate(value);
    }
    
    setPagination(prev => ({ ...prev, page: 1 }));
    // The state changes will trigger the main effect
  };

  const handleResetFilters = () => {
    // Only reset if any filter is actually set
    if (!statusFilter && !examinationType && !startDate && !endDate && !searchQuery) return;

    setStatusFilter('');
    setExaminationType('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
      pages: 1,
    });
  };

  // Delete record function
  const handleDeleteRecord = async (recordId, recordInfo) => {
    if (!window.confirm(`Are you sure you want to delete record "${recordInfo}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(recordId);
      
      const response = await axiosClient.delete(endpoints.record(recordId));
      
      if (response.success) {
        toast.success('Record deleted successfully');
        
        // Remove the deleted record from the state
        setRecords(prev => prev.filter(record => record._id !== recordId));
        
        // Update pagination total
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1,
        }));
        
        // If current page becomes empty, go to previous page
        if (records.length === 1 && pagination.page > 1) {
          setPagination(prev => ({ ...prev, page: prev.page - 1 }));
        } else {
          // Refresh the current page to get updated data
          fetchRecords(true);
        }
      } else {
        toast.error(response.message || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete record';
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    try {
      const params = {
        shop: user.shop,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        format: 'csv',
      };
      
      const response = await axiosClient.get(endpoints.exportRecords, {
        params,
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `records_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting records:', error);
      toast.error('Failed to export records');
    }
  };

  const examinationTypes = [
    'routine', 'comprehensive', 'contact_lens', 'follow_up', 'emergency', 'other'
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'archived', label: 'Archived' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Records</h1>
          <p className="text-gray-600">Manage optometry records for your shop</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <Link
            to="/shop/records/new"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input-field"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Examination Type
            </label>
            <select
              value={examinationType}
              onChange={(e) => handleFilterChange('examinationType', e.target.value)}
              className="input-field"
            >
              <option value="">All Types</option>
              {examinationTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, phone, or record ID..."
                className="input-field pl-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </form>
          
          {(statusFilter || examinationType || startDate || endDate || searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md border border-gray-300"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Records Table */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No records found</div>
            <p className="text-gray-600">Try adjusting your filters or add a new record</p>
            {(statusFilter || examinationType || startDate || endDate || searchQuery) && (
              <button
                onClick={handleResetFilters}
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
                Showing {records.length} of {pagination.total} records
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
                    <th className="table-header">Date</th>
                    <th className="table-header">Record ID</th>
                    <th className="table-header">Customer</th>
                    <th className="table-header">Examination Type</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record._id}>
                      <td className="table-cell">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(record.date)}
                        </div>
                      </td>
                      <td className="table-cell font-mono text-sm">
                        {record.recordId || 'N/A'}
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="font-medium">{record.customer?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{record.customer?.phone || ''}</p>
                        </div>
                      </td>
                      <td className="table-cell capitalize">
                        {record.examinationType?.replace('_', ' ') || 'N/A'}
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="table-cell font-medium">
                        ${record.billing?.amount || '0.00'}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/shop/records/${record._id}`}
                            className="text-primary-600 hover:text-primary-700 p-1"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/shop/records/edit/${record._id}`}
                            className="text-gray-600 hover:text-gray-700 p-1"
                            title="Edit"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteRecord(
                              record._id, 
                              `${record.recordId || 'Record'} - ${record.customer?.name || 'Unknown Customer'}`
                            )}
                            disabled={deletingId === record._id}
                            className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Record"
                          >
                            {deletingId === record._id ? (
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