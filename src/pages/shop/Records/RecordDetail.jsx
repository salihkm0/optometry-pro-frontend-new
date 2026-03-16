import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Edit, Calendar, User, Eye as EyeIcon, DollarSign, Printer, Download, FileText, Receipt } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import endpoints from '../../../api/endpoints';
import { formatDate, formatPhoneNumber, getStatusColor, formatCurrency } from '../../../utils/helpers';
import { toast } from 'react-hot-toast';

export default function ShopRecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [calculatedBilling, setCalculatedBilling] = useState({
    subtotal: 0,
    discountAmount: 0,
    discountedAmount: 0,
    due: 0
  });

  useEffect(() => {
    fetchRecord();
  }, [id]);

  useEffect(() => {
    if (record?.billing) {
      calculateBilling(record.billing);
    }
  }, [record]);

  const calculateBilling = (billing) => {
    const amount = parseFloat(billing.amount) || 0;
    const discount = parseFloat(billing.discount) || 0;
    const paid = parseFloat(billing.paid) || 0;
    const discountType = billing.discountType || 'percentage';

    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = (amount * discount) / 100;
    } else {
      discountAmount = discount;
    }

    const discountedAmount = amount - discountAmount;
    const due = discountedAmount - paid;

    setCalculatedBilling({
      subtotal: amount,
      discountAmount: discountAmount,
      discountedAmount: discountedAmount,
      due: due
    });
  };

  const fetchRecord = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(endpoints.record(id));
      
      if (response.success) {
        setRecord(response.data.record);
      } else {
        throw new Error('Record not found');
      }
    } catch (error) {
      console.error('Error fetching record:', error);
      toast.error('Failed to load record');
      navigate('/shop/records');
    } finally {
      setLoading(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  const handlePrintRecord = () => {
    if (!record) return;
    
    setPrinting(true);
    
    // Use absolute URL for print
    const printUrl = endpoints.getPrintRecordUrl(record._id, true, true);
    
    const printWindow = window.open(
      printUrl,
      '_blank',
      'width=900,height=600,scrollbars=yes,resizable=yes,toolbar=no,location=no,status=no'
    );
    
    if (!printWindow) {
      toast.error('Please allow pop-ups for this site to print');
      setPrinting(false);
      return;
    }
    
    // Check if window closed
    const checkWindow = setInterval(() => {
      try {
        if (printWindow.closed) {
          clearInterval(checkWindow);
          setPrinting(false);
          toast.success('Print completed');
        }
      } catch (e) {
        clearInterval(checkWindow);
        setPrinting(false);
      }
    }, 500);
    
    setTimeout(() => {
      if (!printWindow.closed) {
        clearInterval(checkWindow);
        setPrinting(false);
      }
    }, 5000);
  };

  const handlePrintPrescription = () => {
    if (!record) return;
    
    setPrinting(true);
    
    const printUrl = endpoints.getPrintPrescriptionUrl(record._id, true);
    const printWindow = window.open(
      printUrl,
      '_blank',
      'width=600,height=400,scrollbars=yes,resizable=yes,toolbar=no,location=no,status=no'
    );
    
    if (!printWindow) {
      toast.error('Please allow pop-ups for this site to print');
      setPrinting(false);
      return;
    }
    
    const checkWindow = setInterval(() => {
      if (printWindow.closed) {
        clearInterval(checkWindow);
        setPrinting(false);
        toast.success('Prescription printed successfully');
      }
    }, 500);
    
    setTimeout(() => {
      if (!printWindow.closed) {
        clearInterval(checkWindow);
        setPrinting(false);
      }
    }, 5000);
  };

  const handlePrintInvoice = () => {
    if (!record) return;
    
    setPrinting(true);
    
    const printUrl = endpoints.getPrintInvoiceUrl(record._id, true);
    const printWindow = window.open(
      printUrl,
      '_blank',
      'width=900,height=600,scrollbars=yes,resizable=yes,toolbar=no,location=no,status=no'
    );
    
    if (!printWindow) {
      toast.error('Please allow pop-ups for this site to print');
      setPrinting(false);
      return;
    }
    
    const checkWindow = setInterval(() => {
      if (printWindow.closed) {
        clearInterval(checkWindow);
        setPrinting(false);
        toast.success('Invoice printed successfully');
      }
    }, 500);
    
    setTimeout(() => {
      if (!printWindow.closed) {
        clearInterval(checkWindow);
        setPrinting(false);
      }
    }, 5000);
  };

  const handleExportPDF = async () => {
    if (!record) return;
    
    try {
      setPrinting(true);
      
      // Open print page with PDF option
      const printUrl = endpoints.getPrintRecordUrl(record._id, false, false) + '&pdf=true';
      const printWindow = window.open(
        printUrl,
        '_blank',
        'width=900,height=600'
      );
      
      if (!printWindow) {
        toast.error('Please allow pop-ups to generate PDF');
      } else {
        toast.success('PDF view opened. Use browser\'s "Print" > "Save as PDF".');
      }
      
      setPrinting(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
      setPrinting(false);
    }
  };

  const handleQuickPrint = () => {
    handlePrintRecord();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Record not found</p>
        <button
          onClick={() => navigate('/shop/records')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Go back to records
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between print:hidden">
        <div className="flex items-start space-x-4">
          <button
            onClick={() => navigate('/shop/records')}
            className="text-gray-600 hover:text-gray-900 mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">Record #{record.recordId}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                {record.status}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(record.date)}
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {record.customer?.name}
              </div>
            </div>
          </div>
        </div>
        
        {/* Print/Action Buttons */}
        {/* <div className="mt-4 sm:mt-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleQuickPrint}
              disabled={printing}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="h-4 w-4 mr-2" />
              {printing ? 'Printing...' : 'Quick Print'}
            </button>
            
            <div className="relative group">
              <button
                disabled={printing}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-4 w-4 mr-2" />
                Print Options
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <button
                    onClick={handlePrintRecord}
                    disabled={printing}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Full Record
                  </button>
                  <button
                    onClick={handlePrintPrescription}
                    disabled={printing}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Prescription Card
                  </button>
                  <button
                    onClick={handlePrintInvoice}
                    disabled={printing}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Invoice
                  </button>
                  <button
                    onClick={handleBrowserPrint}
                    disabled={printing}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Browser Print
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleExportPDF}
              disabled={printing}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4 mr-2" />
              {printing ? 'Exporting...' : 'Export PDF'}
            </button>
            
            <Link
              to={`/shop/records/edit/${record._id}`}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </div>
        </div> */}
      </div>

      {/* Print Info Banner */}
      {/* <div className="print:hidden">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Printer className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Print Instructions</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Select a print option or use browser print (Ctrl+P). If popups are blocked:</p>
                <ul className="mt-1 list-disc list-inside">
                  <li>Click browser's popup blocker icon and allow popups</li>
                  <li>Or use "Browser Print" to print this page directly</li>
                  <li>For PDF, choose "Save as PDF" in print dialog</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1">
        {/* Left Column - Customer & Exam Info */}
        <div className="lg:col-span-2 space-y-6 print:space-y-4">
          {/* Customer Information Card */}
          <div className="bg-white shadow rounded-lg print:shadow-none">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
                <span className="text-xs text-gray-500 print:hidden">ID: {record.customer?.customerId}</span>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{record.customer?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatPhoneNumber(record.customer?.phone)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Age / Gender</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {record.customer?.age || 'N/A'} / {record.customer?.sex || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {record.customer?.email || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Examination Details Card */}
          <div className="bg-white shadow rounded-lg print:shadow-none">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Examination Details</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Examination Type</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {record.examinationType?.replace('_', ' ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Prescription Type</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {record.prescriptionType?.replace('_', ' ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Optometrist</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {record.optometrist?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Assistant</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {record.assistant?.name || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Eye Measurements Table */}
          <div className="bg-white shadow rounded-lg print:shadow-none print:break-inside-avoid">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Eye Measurements</h3>
                <span className="text-xs text-gray-500 print:hidden">Exam Date: {formatDate(record.date)}</span>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Lens</th>
                      <th colSpan="4" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Right Eye (OD)</th>
                      <th colSpan="4" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Left Eye (OS)</th>
                    </tr>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r"></th>
                      
                      {/* Right Eye Headers */}
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SPH</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">CYL</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">AXIS</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">V/A</th>
                      
                      {/* Left Eye Headers */}
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SPH</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">CYL</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">AXIS</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">V/A</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* DV Row */}
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r">DV</td>
                      
                      {/* Right Eye DV */}
                      <td className="px-3 py-2 text-center text-sm text-gray-900">
                        {record.right_eye?.dv?.sph || '-'}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-900">
                        {record.right_eye?.dv?.cyl || '-'}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-900">
                        {record.right_eye?.dv?.axis || '-'}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-900 border-r">
                        {record.right_eye?.dv?.va || '-'}
                      </td>
                      
                      {/* Left Eye DV */}
                      <td className="px-3 py-2 text-center text-sm text-gray-900">
                        {record.left_eye?.dv?.sph || '-'}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-900">
                        {record.left_eye?.dv?.cyl || '-'}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-900">
                        {record.left_eye?.dv?.axis || '-'}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-900">
                        {record.left_eye?.dv?.va || '-'}
                      </td>
                    </tr>
                    
                    {/* ADD Row */}
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r">ADD</td>
                      
                      {/* Right Eye ADD */}
                      <td className="px-3 py-2 text-center text-sm text-gray-900">
                        {record.right_eye?.add?.sph || '-'}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-900">
                        {record.right_eye?.add?.cyl || '-'}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-900">
                        {record.right_eye?.add?.axis || '-'}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-900 border-r">
                        {record.right_eye?.add?.va || '-'}
                      </td>
                      
                      {/* Left Eye ADD */}
                      <td className="px-3 py-2 text-center text-sm text-gray-900">
                        {record.left_eye?.add?.sph || '-'}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-900">
                        {record.left_eye?.add?.cyl || '-'}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-900">
                        {record.left_eye?.add?.axis || '-'}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-900">
                        {record.left_eye?.add?.va || '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Additional Measurements */}
              {(record.pd || record.ph || record.prism || record.base) && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Measurements</h4>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4 text-sm">
                    {record.pd && (
                      <div>
                        <p className="text-gray-500">PD (Pupillary Distance)</p>
                        <p className="text-gray-900 font-medium">{record.pd} mm</p>
                      </div>
                    )}
                    {record.ph && (
                      <div>
                        <p className="text-gray-500">PH (Pupillary Height)</p>
                        <p className="text-gray-900 font-medium">{record.ph} mm</p>
                      </div>
                    )}
                    {record.prism && (
                      <div>
                        <p className="text-gray-500">Prism</p>
                        <p className="text-gray-900 font-medium">{record.prism}Δ</p>
                      </div>
                    )}
                    {record.base && (
                      <div>
                        <p className="text-gray-500">Base</p>
                        <p className="text-gray-900 font-medium">{record.base}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {record.notes && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{record.notes}</p>
                </div>
              )}

              {/* Recommendations */}
              {record.recommendations && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Recommendations</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{record.recommendations}</p>
                </div>
              )}

              {/* Diagnosis */}
              {record.diagnosis && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Diagnosis</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{record.diagnosis}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Billing & Notes */}
        <div className="space-y-6 print:space-y-4">
          {/* Billing Information Card */}
          <div className="bg-white shadow rounded-lg print:shadow-none">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Billing Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(calculatedBilling.subtotal)}
                </p>
              </div>
              
              {record.billing?.discount > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Discount ({record.billing.discountType === 'percentage' ? '%' : 'Rs'})
                  </p>
                  <div className="flex items-baseline">
                    <p className="text-lg font-semibold text-red-600 mr-2">
                      - {formatCurrency(calculatedBilling.discountAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ({record.billing.discountType === 'percentage' 
                        ? `${record.billing.discount}%` 
                        : `${record.billing.discount}%`})
                    </p>
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Discounted Amount</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(calculatedBilling.discountedAmount)}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Paid Amount</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(record.billing?.paid || 0)}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Payment Method</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {record.billing?.paymentMethod || 'N/A'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-500">Balance Due</p>
                <p className={`text-xl font-bold ${
                  calculatedBilling.due > 0
                    ? 'text-red-600'
                    : calculatedBilling.due < 0
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}>
                  {formatCurrency(Math.abs(calculatedBilling.due))}
                  {calculatedBilling.due < 0 && ' (Overpaid)'}
                </p>
              </div>
            </div>
          </div>

          {/* Next Appointment */}
          {record.nextAppointment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900">Next Appointment</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-lg font-semibold text-blue-900">
                      {formatDate(record.nextAppointment, 'EEEE, MMMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-blue-700">
                      {formatDate(record.nextAppointment, 'hh:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medical History Summary */}
          {record.customer?.medicalHistory && (
            <div className="bg-white shadow rounded-lg print:shadow-none">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Medical History</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {record.customer.medicalHistory.diabetes && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Diabetes
                    </span>
                  )}
                  {record.customer.medicalHistory.hypertension && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Hypertension
                    </span>
                  )}
                  {record.customer.medicalHistory.glaucoma && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Glaucoma
                    </span>
                  )}
                  {record.customer.medicalHistory.cataract && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Cataract
                    </span>
                  )}
                </div>
                {record.customer.medicalHistory.allergies?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Allergies</p>
                    <p className="text-sm text-gray-900">
                      {record.customer.medicalHistory.allergies.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Record Information */}
          <div className="bg-white shadow rounded-lg print:shadow-none">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Record Information</h3>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Created By</p>
                <p className="text-sm text-gray-900">{record.createdBy?.name || 'System'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created On</p>
                <p className="text-sm text-gray-900">{formatDate(record.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-sm text-gray-900">{formatDate(record.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center print:hidden">
        <div className="text-sm text-gray-500">
          Need to print multiple records? Use the batch print feature in the records list.
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/shop/records')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back to Records
          </button>
          <Link
            to={`/shop/customers/${record.customer?._id}`}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            View Customer Profile
          </Link>
        </div>
      </div>
    </div>
  );
}