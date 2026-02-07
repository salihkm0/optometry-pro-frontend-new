import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Edit, Calendar, User, Eye as EyeIcon, DollarSign, FileText } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import endpoints from '../../../api/endpoints';
import { formatDate, formatPhoneNumber, getStatusColor, formatCurrency } from '../../../utils/helpers';
import { toast } from 'react-hot-toast';

export default function RecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecord();
  }, [id]);

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
      navigate('/admin/records');
    } finally {
      setLoading(false);
    }
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
          onClick={() => navigate('/admin/records')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Go back to records
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start space-x-4">
          <button
            onClick={() => navigate('/admin/records')}
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
              {record.shop?.name && (
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {record.shop.name}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to={`/admin/records/edit/${record._id}`}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Exam Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
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
                <p className="text-sm font-medium text-gray-500">Age/Gender</p>
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

          {/* Examination Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Examination Details</h2>
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

          {/* Eye Examination Results */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Eye Examination Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Right Eye */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <EyeIcon className="h-5 w-5 mr-2" />
                  Right Eye (OD)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">SPH</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {record.right_eye?.dv?.sph || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">CYL</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {record.right_eye?.dv?.cyl || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Axis</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {record.right_eye?.dv?.axis || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">VA</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {record.right_eye?.dv?.va || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Left Eye */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <EyeIcon className="h-5 w-5 mr-2" />
                  Left Eye (OS)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">SPH</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {record.left_eye?.dv?.sph || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">CYL</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {record.left_eye?.dv?.cyl || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Axis</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {record.left_eye?.dv?.axis || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">VA</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {record.left_eye?.dv?.va || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Billing & Notes */}
        <div className="space-y-6">
          {/* Billing Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Billing Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(record.billing?.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Paid</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(record.billing?.paid)}
                </p>
              </div>
              {record.billing?.discount > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Discount</p>
                  <p className="text-lg font-semibold text-red-600">
                    {record.billing?.discount}%
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Method</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {record.billing?.paymentMethod || 'N/A'}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-500">Balance</p>
                <p className={`text-xl font-bold ${
                  (record.billing?.amount || 0) - (record.billing?.paid || 0) > 0
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {formatCurrency((record.billing?.amount || 0) - (record.billing?.paid || 0))}
                </p>
              </div>
            </div>
          </div>

          {/* Next Appointment */}
          {record.nextAppointment && (
            <div className="card bg-blue-50 border-blue-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Appointment</h2>
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
          )}

          {/* Notes */}
          {record.notes && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">{record.notes}</p>
              </div>
            </div>
          )}

          {/* Created Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h2>
            <div className="space-y-3">
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
    </div>
  );
}