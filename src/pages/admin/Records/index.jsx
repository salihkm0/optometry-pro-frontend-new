import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Calendar, Download } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import endpoints from '../../../api/endpoints';
import Pagination from '../../../components/common/Pagination';
import { usePaginatedApi } from '../../../hooks/useApi';
import { formatDate, getStatusColor } from '../../../utils/helpers';

export default function AdminRecords() {
  const [selectedShop, setSelectedShop] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [examinationType, setExaminationType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [shops, setShops] = useState([]);

  const {
    loading,
    items: records,
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

  useEffect(() => {
    fetchRecords();
  }, [page, selectedShop, statusFilter, examinationType, startDate, endDate]);

  const fetchShops = async () => {
    try {
      const response = await axiosClient.get(endpoints.shops + '?limit=100');
      console.log("response : ",response)
      if (response.success) {
        setShops(response.data || []);
        if (response.data?.length > 0 && !selectedShop) {
          setSelectedShop(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  console.log("shops :" ,shops)

  const fetchRecords = async () => {
    const params = {
      shop: selectedShop || undefined,
      status: statusFilter || undefined,
      examinationType: examinationType || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      search: searchQuery || undefined,
    };
    await fetch(endpoints.records, params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  const handleExport = async () => {
    try {
      const params = {
        shop: selectedShop || undefined,
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
          <p className="text-gray-600">Manage optometry records across all shops</p>
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
            to="/admin/records/new"
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
              Shop
            </label>
            <select
              value={selectedShop}
              onChange={(e) => {
                setSelectedShop(e.target.value);
                setPage(1);
              }}
              className="input-field"
            >
              <option value="">All Shops</option>
              {shops.map(shop => (
                <option key={shop._id} value={shop._id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
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
              onChange={(e) => {
                setExaminationType(e.target.value);
                setPage(1);
              }}
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
              Date Range
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
                placeholder="Start"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
                placeholder="End"
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch}>
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
          </div>
        </form>
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
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="table-header">Date</th>
                    <th className="table-header">Record ID</th>
                    <th className="table-header">Customer</th>
                    <th className="table-header">Shop</th>
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
                        {record.recordId}
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="font-medium">{record.customer?.name}</p>
                          <p className="text-sm text-gray-500">{record.customer?.phone}</p>
                        </div>
                      </td>
                      <td className="table-cell">
                        {record.shop?.name || 'N/A'}
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
                            to={`/admin/records/${record._id}`}
                            className="text-primary-600 hover:text-primary-700"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/admin/records/edit/${record._id}`}
                            className="text-gray-600 hover:text-gray-700"
                            title="Edit"
                          >
                            Edit
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