import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosClient from '../../../api/axiosClient';
import endpoints from '../../../api/endpoints';
import {
  ArrowLeft,
  Printer,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  FileText,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Package,
  Percent,
  Receipt,
  Eye,
  File,
  FileCheck,
  FileX,
  Check,
  Share2,
  Copy,
  QrCode,
  MoreVertical,
  RefreshCw,
  ExternalLink,
  FileTextIcon,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  FileJson,
  FileAudio,
  FileVideo,
  FileType,
  FileUp,
  FileDown,
  FileSearch,
  FileWarning,
  FileMinus,
  FilePlus,
  FileDiff,
  FileSymlink,
  FileSliders,
  FileBarChart,
  FileSignature,
  FileHeart,
  FileMinus2,
  FileX2,
  FilePen,
  FileKey,
  FileClock,
  FileCog,
  FileDigit,
  FileScan,
  FileAxis3d,
  FileQuestion,
  FileOutput
} from 'lucide-react';
import dayjs from 'dayjs';

export default function BillingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    paperSize: 'A4',
    printType: 'invoice',
    showQRCode: true,
    includeTerms: true
  });
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBillDetails();
    }
  }, [id]);

  const fetchBillDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(endpoints.billingById(id));
      setBill(response.data?.bill || null);
      setPayments(response.data?.payments || []);
    } catch (error) {
      console.error('Error fetching bill:', error);
      toast.error('Failed to load bill details');
      navigate('/shop/billing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
      return;
    }

    try {
      await axiosClient.delete(endpoints.billingById(id));
      toast.success('Bill deleted successfully');
      navigate('/shop/billing');
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast.error('Failed to delete bill');
    }
  };

  const handlePrint = async () => {
    try {
      setPdfLoading(true);
      
      // Generate and print PDF
      const response = await axiosClient.get(endpoints.printBill(id), {
        responseType: 'blob',
        params: {
          type: printSettings.printType,
          download: false
        }
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Open PDF in new tab for printing
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          toast.success('Opening PDF for printing...');
        };
      } else {
        // If popup blocked, create download link
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice_${bill?.invoiceNumber || id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        toast.success('PDF downloaded. Please print manually.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setPdfLoading(true);
      toast.loading('Generating PDF...', { id: 'pdf-gen' });
      
      // First save PDF to server
      await axiosClient.post(endpoints.generateBillPDF(id));
      
      // Then download it
      const response = await axiosClient.get(endpoints.downloadBillPDF(id), {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${bill?.invoiceNumber || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('PDF generated and downloaded', { id: 'pdf-gen' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF', { id: 'pdf-gen' });
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePreviewPDF = async () => {
    try {
      setPdfLoading(true);
      
      // Preview PDF in new tab
      const response = await axiosClient.get(endpoints.printBill(id), {
        responseType: 'blob',
        params: {
          type: 'invoice',
          download: false
        }
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      toast.success('Opening PDF preview...');
    } catch (error) {
      console.error('Error previewing PDF:', error);
      toast.error('Failed to preview PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axiosClient.get(endpoints.exportBilling, {
        params: { id },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${bill?.invoiceNumber || 'bill'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Bill exported successfully');
    } catch (error) {
      console.error('Error downloading bill:', error);
      toast.error('Failed to export bill');
    }
  };

  const handleUpdatePayment = async () => {
    try {
      const amount = prompt('Enter payment amount:', bill?.payment?.amount || bill?.finalAmount);
      if (!amount) return;

      await axiosClient.put(endpoints.updatePayment(id), {
        amount: parseFloat(amount),
        method: bill?.payment?.method || 'cash',
        paymentDate: new Date().toISOString()
      });

      toast.success('Payment updated successfully');
      fetchBillDetails();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment');
    }
  };

  const handleShareBill = () => {
    const billData = {
      invoiceNumber: bill?.invoiceNumber,
      customer: bill?.customer?.name,
      amount: bill?.finalAmount,
      date: bill?.invoiceDate,
      status: bill?.status
    };
    
    const shareText = `Invoice ${billData.invoiceNumber} - ${billData.customer} - ₹${billData.amount} - ${dayjs(billData.date).format('DD MMM YYYY')}`;
    
    // Try Web Share API first
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${billData.invoiceNumber}`,
        text: shareText,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`).then(() => {
        toast.success('Bill details copied to clipboard');
      }).catch(() => {
        toast.error('Failed to copy to clipboard');
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'partial':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Bill not found</h2>
          <p className="mt-2 text-gray-600">The bill you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/shop/billing')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/shop/billing')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bills
        </button>
        
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              {bill.invoiceNumber}
              <button
                onClick={handleShareBill}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Share Bill"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </h1>
            <div className="mt-1 flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {getStatusIcon(bill.status)}
                <span className="ml-1 capitalize">{bill.status}</span>
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {getStatusIcon(bill.payment?.status)}
                <span className="ml-1 capitalize">{bill.payment?.status}</span>
              </span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowPrintOptions(!showPrintOptions)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FileTextIcon className="mr-2 h-4 w-4" />
                PDF Options
                <MoreVertical className="ml-2 h-4 w-4" />
              </button>
              
              {showPrintOptions && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={handlePreviewPDF}
                      disabled={pdfLoading}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center disabled:opacity-50"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview PDF
                    </button>
                    <button
                      onClick={handleGeneratePDF}
                      disabled={pdfLoading}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center disabled:opacity-50"
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Download PDF
                    </button>
                    <button
                      onClick={handlePrint}
                      disabled={pdfLoading}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center disabled:opacity-50"
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print Invoice
                    </button>
                    <button
                      onClick={() => {
                        setShowPrintOptions(false);
                        toast.success('Coming soon: Email invoice');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Email Invoice
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </button>
            
            {bill.status === 'draft' && (
              <button
                onClick={() => navigate(`/shop/billing/edit/${id}`)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </button>
            )}
            
            {bill.status === 'draft' && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PDF Loading Overlay */}
      {pdfLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-gray-700">Generating PDF...</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Bill Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="mr-2 h-5 w-5" />
                Customer Information
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{bill.customer?.name}</h4>
                  <div className="mt-2 space-y-1">
                    {bill.customer?.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="mr-2 h-4 w-4" />
                        {bill.customer.phone}
                      </div>
                    )}
                    {bill.customer?.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="mr-2 h-4 w-4" />
                        {bill.customer.email}
                      </div>
                    )}
                    {bill.customer?.address?.street && (
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="mr-2 h-4 w-4 mt-0.5" />
                        <div>
                          {bill.customer.address.street}
                          {bill.customer.address.city && (
                            <div>{bill.customer.address.city}, {bill.customer.address.state} {bill.customer.address.zipCode}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Customer ID:</span>
                      <span className="text-sm font-medium">{bill.customer?.customerId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Visits:</span>
                      <span className="text-sm font-medium">{bill.customer?.totalVisits || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Visit:</span>
                      <span className="text-sm font-medium">
                        {bill.customer?.lastVisit ? dayjs(bill.customer.lastVisit).format('DD MMM YYYY') : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products/Services */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Products & Services
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MRP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bill.products?.map((product, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.description && (
                          <div className="text-xs text-gray-500">{product.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        {product.code || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(product.mrp)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(product.discount || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(product.taxAmount || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(product.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {bill.notes && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Notes
                </h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 whitespace-pre-line">{bill.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Summary & Payment */}
        <div className="space-y-6">
          {/* Invoice Details */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Receipt className="mr-2 h-5 w-5" />
                Invoice Details
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Invoice Date:</span>
                  <span className="text-sm font-medium">
                    {dayjs(bill.invoiceDate).format('DD MMM YYYY')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Due Date:</span>
                  <span className="text-sm font-medium">
                    {dayjs(bill.dueDate).format('DD MMM YYYY')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bill Type:</span>
                  <span className="text-sm font-medium capitalize">{bill.billingType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created By:</span>
                  <span className="text-sm font-medium">{bill.createdBy?.name || 'System'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created On:</span>
                  <span className="text-sm font-medium">
                    {dayjs(bill.createdAt).format('DD MMM YYYY, hh:mm A')}
                  </span>
                </div>
                {bill.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <span className="text-sm font-medium">
                      {dayjs(bill.updatedAt).format('DD MMM YYYY, hh:mm A')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Summary
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium">{formatCurrency(bill.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Discount:</span>
                  <span className="text-sm font-medium text-green-600">
                    - {formatCurrency(bill.totalDiscount || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax:</span>
                  <span className="text-sm font-medium">{formatCurrency(bill.totalTax || 0)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-base font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatCurrency(bill.finalAmount)}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Payment Status</span>
                  <button
                    onClick={handleUpdatePayment}
                    className="text-xs text-primary-600 hover:text-primary-900"
                  >
                    Update Payment
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Method:</span>
                    <span className="text-sm font-medium capitalize">{bill.payment?.method || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount Paid:</span>
                    <span className="text-sm font-medium">{formatCurrency(bill.payment?.amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Balance:</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(Math.max(0, (bill.finalAmount || 0) - (bill.payment?.amount || 0)))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Actions */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-primary-200">
              <h3 className="text-lg font-medium text-primary-900 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                PDF Actions
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handlePreviewPDF}
                  disabled={pdfLoading}
                  className="inline-flex items-center justify-center px-3 py-2 border border-primary-300 text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 disabled:opacity-50"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </button>
                <button
                  onClick={handleGeneratePDF}
                  disabled={pdfLoading}
                  className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={handlePrint}
                  disabled={pdfLoading}
                  className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 col-span-2"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {payments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {dayjs(payment.date).format('DD MMM, hh:mm A')}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">{payment.method}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </div>
                        {payment.transactionId && (
                          <div className="text-xs text-gray-500 truncate max-w-[120px]">
                            ID: {payment.transactionId}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          {bill.terms && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Terms & Conditions</h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 whitespace-pre-line">{bill.terms}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}