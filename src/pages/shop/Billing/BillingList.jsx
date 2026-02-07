import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosClient from '../../../api/axiosClient';
import endpoints from '../../../api/endpoints';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  DollarSign,
  User,
  Printer,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  FileDown,
  FileArchive,
  MoreVertical,
  CheckSquare,
  Square,
  FileCheck,
  FileX,
  Mail,
  Share2,
  QrCode
} from 'lucide-react';
import dayjs from 'dayjs';

export default function BillingList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [bills, setBills] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBills: 0,
    totalPaid: 0,
    totalPending: 0,
    totalPartial: 0
  });
  const [filters, setFilters] = useState({
    search: undefined,
    status: undefined,
    paymentStatus: undefined,
    startDate: undefined,
    endDate: undefined
  });
  const [selectedBills, setSelectedBills] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [pdfBulkLoading, setPdfBulkLoading] = useState(false);

  useEffect(() => {
    fetchBills();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      // Prepare query parameters
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const response = await axiosClient.get(endpoints.billing, { params });
      
      // Handle different response structures
      if (response.data && response.data.bills) {
        setBills(response.data.bills);
        setPagination(response.data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 1
        });
      } else if (Array.isArray(response)) {
        setBills(response);
        setPagination({
          page: 1,
          limit: 20,
          total: response.length,
          pages: 1
        });
      } else {
        setBills([]);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to load bills');
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await axiosClient.get(endpoints.billingStats);
      
      // Handle different response structures
      if (response.data && response.data.summary) {
        setStats(response.data.summary);
      } else if (response.summary) {
        setStats(response.summary);
      } else if (response.success) {
        setStats(response.data?.summary || {
          totalRevenue: 0,
          totalBills: 0,
          totalPaid: 0,
          totalPending: 0,
          totalPartial: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats({
        totalRevenue: 0,
        totalBills: 0,
        totalPaid: 0,
        totalPending: 0,
        totalPartial: 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    // Convert empty strings to undefined
    const processedValue = value === '' ? undefined : value;
    
    setFilters(prev => ({
      ...prev,
      [key]: processedValue
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: undefined,
      status: undefined,
      paymentStatus: undefined,
      startDate: undefined,
      endDate: undefined
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    setSelectedBills([]);
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill? This action cannot be undone.')) return;

    try {
      await axiosClient.delete(endpoints.billingById(id));
      toast.success('Bill deleted successfully');
      fetchBills();
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting bill:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete bill';
      toast.error(errorMessage);
    }
  };

  const handleCancelBill = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this bill?')) return;

    try {
      await axiosClient.put(endpoints.billingById(id), {
        status: 'cancelled',
        payment: { status: 'cancelled' }
      });
      toast.success('Bill cancelled successfully');
      fetchBills();
      fetchStats();
    } catch (error) {
      console.error('Error cancelling bill:', error);
      toast.error('Failed to cancel bill');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      generated: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Generated' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      void: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Void' },
      archived: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Archived' }
    };
    
    const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      partial: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Partial' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      refunded: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Refunded' }
    };
    
    const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const exportBills = async () => {
    try {
      // Prepare query parameters
      const params = { ...filters };
      
      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const response = await axiosClient.get(endpoints.exportBilling, {
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bills_export_${dayjs().format('YYYY-MM-DD')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Bills exported successfully');
    } catch (error) {
      console.error('Error exporting bills:', error);
      toast.error('Failed to export bills');
    }
  };

  const toggleSelectBill = (id) => {
    setSelectedBills(prev =>
      prev.includes(id)
        ? prev.filter(billId => billId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedBills.length === bills.length) {
      setSelectedBills([]);
    } else {
      setSelectedBills(bills.map(bill => bill._id));
    }
  };

  const handlePrintSelected = async () => {
    if (selectedBills.length === 0) {
      toast.error('Please select bills to print');
      return;
    }
    
    try {
      setPdfBulkLoading(true);
      
      // Generate PDFs for each selected bill
      for (const billId of selectedBills) {
        try {
          const response = await axiosClient.get(endpoints.printBill(billId), {
            responseType: 'blob',
            params: { download: false }
          });
          
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          
          // Open each PDF in a new tab
          window.open(url, '_blank');
        } catch (error) {
          console.error(`Error printing bill ${billId}:`, error);
        }
      }
      
      toast.success(`Opening ${selectedBills.length} bill${selectedBills.length !== 1 ? 's' : ''} for printing`);
    } catch (error) {
      console.error('Error printing bills:', error);
      toast.error('Failed to print bills');
    } finally {
      setPdfBulkLoading(false);
    }
  };

  const handleBulkDownloadPDF = async () => {
    if (selectedBills.length === 0) {
      toast.error('Please select bills to download');
      return;
    }
    
    if (selectedBills.length > 5) {
      toast.error('Please select maximum 5 bills for bulk download');
      return;
    }
    
    try {
      setPdfBulkLoading(true);
      toast.loading('Generating PDFs...', { id: 'bulk-pdf' });
      
      // Generate and download each PDF
      for (const billId of selectedBills) {
        try {
          const bill = bills.find(b => b._id === billId);
          const response = await axiosClient.get(endpoints.printBill(billId), {
            responseType: 'blob',
            params: { download: true }
          });
          
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `invoice_${bill?.invoiceNumber || billId}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error downloading bill ${billId}:`, error);
        }
      }
      
      toast.success(`${selectedBills.length} PDF${selectedBills.length !== 1 ? 's' : ''} downloaded`, { id: 'bulk-pdf' });
    } catch (error) {
      console.error('Error downloading bulk PDFs:', error);
      toast.error('Failed to download PDFs', { id: 'bulk-pdf' });
    } finally {
      setPdfBulkLoading(false);
    }
  };

  const handleGenerateBulkPDF = async () => {
    if (selectedBills.length === 0) {
      toast.error('Please select bills to generate PDFs');
      return;
    }
    
    try {
      setPdfBulkLoading(true);
      toast.loading('Generating bulk PDFs...', { id: 'bulk-generate' });
      
      const response = await axiosClient.post(endpoints.bulkGeneratePDF, {
        billIds: selectedBills
      });
      
      if (response.data.success) {
        const results = response.data.data.results;
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        toast.success(`Generated ${successful} PDF${successful !== 1 ? 's' : ''} ${failed > 0 ? `, ${failed} failed` : ''}`, { 
          id: 'bulk-generate' 
        });
        
        // Update bills with PDF URLs
        setBills(prevBills => 
          prevBills.map(bill => {
            const result = results.find(r => r.billId === bill._id);
            if (result?.success && result.url) {
              return { ...bill, pdfUrl: result.url };
            }
            return bill;
          })
        );
      }
    } catch (error) {
      console.error('Error generating bulk PDFs:', error);
      toast.error('Failed to generate bulk PDFs', { id: 'bulk-generate' });
    } finally {
      setPdfBulkLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchBills();
    fetchStats();
    setSelectedBills([]);
    toast.success('Refreshing data...');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Billing Management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track all invoices and payments
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading || statsLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading || statsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/shop/billing/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Bill
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? (
                  <span className="text-gray-400">...</span>
                ) : (
                  stats.totalBills.toLocaleString()
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? (
                  <span className="text-gray-400">...</span>
                ) : (
                  formatCurrency(stats.totalRevenue)
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid Amount</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? (
                  <span className="text-gray-400">...</span>
                ) : (
                  formatCurrency(stats.totalPaid)
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Amount</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? (
                  <span className="text-gray-400">...</span>
                ) : (
                  formatCurrency(stats.totalPending)
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Partial Amount</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? (
                  <span className="text-gray-400">...</span>
                ) : (
                  formatCurrency(stats.totalPartial)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        {/* Search and Filters Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search by invoice number or customer..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </button>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Advanced Filters (Collapsible) */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="generated">Generated</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="void">Void</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={filters.paymentStatus || ''}
                    onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">All Payment Status</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedBills.length > 0 && (
          <div className="px-6 py-3 bg-primary-50 border-b border-primary-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-primary-800">
                  {selectedBills.length} bill{selectedBills.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={toggleSelectAll}
                  className="text-xs text-primary-600 hover:text-primary-800"
                >
                  {selectedBills.length === bills.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary-700 bg-white border border-primary-300 rounded-md hover:bg-primary-50"
                >
                  <MoreVertical className="mr-2 h-4 w-4" />
                  Bulk Actions
                </button>
                <button
                  onClick={() => setSelectedBills([])}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50"
                >
                  Clear Selection
                </button>
              </div>
            </div>
            
            {/* Bulk Actions Dropdown */}
            {showBulkActions && (
              <div className="mt-3 pt-3 border-t border-primary-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={handlePrintSelected}
                    disabled={pdfBulkLoading}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Selected
                  </button>
                  <button
                    onClick={handleBulkDownloadPDF}
                    disabled={pdfBulkLoading || selectedBills.length > 5}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Download PDFs
                  </button>
                  <button
                    onClick={handleGenerateBulkPDF}
                    disabled={pdfBulkLoading}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-primary-600 border border-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Generate PDFs
                  </button>
                  <button
                    onClick={() => {
                      setShowBulkActions(false);
                      toast.success('Coming soon: Email selected bills');
                    }}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email Selected
                  </button>
                </div>
                {selectedBills.length > 5 && (
                  <p className="mt-2 text-xs text-orange-600">
                    Note: Maximum 5 bills allowed for PDF download at once
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Export Button */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={exportBills}
              disabled={bills.length === 0}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </button>
            {selectedBills.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedBills.length} selected
              </span>
            )}
          </div>
          
          {/* PDF Bulk Info */}
          {pdfBulkLoading && (
            <div className="flex items-center text-sm text-primary-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
              Processing PDFs...
            </div>
          )}
        </div>

        {/* Bills Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={bills.length > 0 && selectedBills.length === bills.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-4"></div>
                      <p className="text-sm text-gray-500">Loading bills...</p>
                    </div>
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-sm font-medium text-gray-900 mb-1">No bills found</p>
                      <p className="text-sm text-gray-500">
                        {Object.values(filters).some(v => v !== undefined) 
                          ? 'Try changing your filters' 
                          : 'Get started by creating your first bill'}
                      </p>
                      {!Object.values(filters).some(v => v !== undefined) && (
                        <button
                          onClick={() => navigate('/shop/billing/new')}
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create New Bill
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedBills.includes(bill._id)}
                        onChange={() => toggleSelectBill(bill._id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {bill.invoiceNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {bill.billingType ? bill.billingType.charAt(0).toUpperCase() + bill.billingType.slice(1) : 'Sale'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {bill.customer?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {bill.customer?.phone || ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900">
                          {dayjs(bill.invoiceDate).format('DD MMM YYYY')}
                        </div>
                        <div className="text-xs text-gray-500">
                          Due: {dayjs(bill.dueDate).format('DD MMM')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(bill.finalAmount || 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Paid: {formatCurrency(bill.payment?.amount || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(bill.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(bill.payment?.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/shop/billing/${bill._id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.open(endpoints.printBill(bill._id), '_blank')}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50 transition-colors"
                          title="Print/PDF"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        {bill.pdfUrl && (
                          <a
                            href={bill.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Download PDF"
                          >
                            <FileDown className="h-4 w-4" />
                          </a>
                        )}
                        {bill.status === 'draft' && (
                          <button
                            onClick={() => navigate(`/shop/billing/edit/${bill._id}`)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {bill.status === 'draft' && (
                          <button
                            onClick={() => handleDelete(bill._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        {(bill.status === 'generated' || bill.status === 'paid') && bill.payment?.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelBill(bill._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Cancel Bill"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {(() => {
                  const pages = [];
                  const totalPages = pagination.pages;
                  const currentPage = pagination.page;
                  
                  // Always show first page
                  pages.push(
                    <button
                      key={1}
                      onClick={() => handlePageChange(1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                        currentPage === 1
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      1
                    </button>
                  );
                  
                  // Show ellipsis if needed
                  if (currentPage > 3) {
                    pages.push(
                      <span key="ellipsis1" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    );
                  }
                  
                  // Show pages around current page
                  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                    if (i > 1 && i < totalPages) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                            currentPage === i
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                  }
                  
                  // Show ellipsis if needed
                  if (currentPage < totalPages - 2) {
                    pages.push(
                      <span key="ellipsis2" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    );
                  }
                  
                  // Always show last page if there is more than one page
                  if (totalPages > 1) {
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                          currentPage === totalPages
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  
                  return pages;
                })()}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}