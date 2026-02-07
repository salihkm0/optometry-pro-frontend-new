import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Edit, FileText, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import endpoints from '../../../api/endpoints';
import { formatDate, formatPhoneNumber } from '../../../utils/helpers';
import { toast } from 'react-hot-toast';

export default function ShopCustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [customerRes, recordsRes] = await Promise.all([
        axiosClient.get(endpoints.customer(id)),
        axiosClient.get(endpoints.customerRecords(id)),
      ]);

      console.log("customerRes :", customerRes);
      console.log("recordsRes :", recordsRes);

      if (customerRes.success) {
        setCustomer(customerRes.data.customer);
      }

      if (recordsRes.success) {
        setRecords(recordsRes.data.records || []);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to load customer data');
      navigate('/shop/customers');
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

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
        <button
          onClick={() => navigate('/shop/customers')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Go back to customers
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
            onClick={() => navigate('/shop/customers')}
            className="text-gray-600 hover:text-gray-900 mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                customer.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {customer.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                {formatPhoneNumber(customer.phone)}
              </div>
              {customer.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {customer.email}
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {customer.totalVisits || 0} visits
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">ID: {customer.customerId}</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to={`/shop/customers/edit/${customer._id}`}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <Link
            to={`/shop/records/new?customer=${customer._id}`}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Add Record
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'records'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Records ({records.length})
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'medical'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Medical History
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="card">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{customer.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Age</dt>
                    <dd className="mt-1 text-sm text-gray-900">{customer.age || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Gender</dt>
                    <dd className="mt-1 text-sm text-gray-900">{customer.sex || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.dateOfBirth ? formatDate(customer.dateOfBirth, 'MMMM dd, yyyy') : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatPhoneNumber(customer.phone)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{customer.email || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.address?.street ? (
                        <>
                          {customer.address.street}<br />
                          {customer.address.city && `${customer.address.city}, `}
                          {customer.address.state} {customer.address.zipCode}
                        </>
                      ) : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {customer.tags && customer.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Visit History</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Total Visits</p>
                  <p className="text-2xl font-semibold text-gray-900">{customer.totalVisits || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">First Visit</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {customer.firstVisit ? formatDate(customer.firstVisit) : 'Never'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Last Visit</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {customer.lastVisit ? formatDate(customer.lastVisit) : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Records History</h3>
            {records.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No records found</p>
                <Link
                  to={`/shop/records/new?customer=${customer._id}`}
                  className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Add first record
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="table-header">Date</th>
                      <th className="table-header">Record ID</th>
                      <th className="table-header">Examination Type</th>
                      <th className="table-header">Prescription Type</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Amount</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {records.map((record) => (
                      <tr key={record._id}>
                        <td className="table-cell">
                          {formatDate(record.date)}
                        </td>
                        <td className="table-cell font-mono text-sm">
                          {record.recordId}
                        </td>
                        <td className="table-cell capitalize">
                          {record.examinationType?.replace('_', ' ')}
                        </td>
                        <td className="table-cell capitalize">
                          {record.prescriptionType?.replace('_', ' ')}
                        </td>
                        <td className="table-cell">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : record.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="table-cell font-medium">
                          ${record.billing?.amount || '0.00'}
                        </td>
                        <td className="table-cell">
                          <Link
                            to={`/shop/records/${record._id}`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Conditions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg border ${customer.medicalHistory?.diabetes ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                  <p className="text-sm font-medium text-gray-900">Diabetes</p>
                  <p className={`text-lg font-semibold ${customer.medicalHistory?.diabetes ? 'text-red-600' : 'text-gray-600'}`}>
                    {customer.medicalHistory?.diabetes ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${customer.medicalHistory?.hypertension ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                  <p className="text-sm font-medium text-gray-900">Hypertension</p>
                  <p className={`text-lg font-semibold ${customer.medicalHistory?.hypertension ? 'text-red-600' : 'text-gray-600'}`}>
                    {customer.medicalHistory?.hypertension ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${customer.medicalHistory?.glaucoma ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                  <p className="text-sm font-medium text-gray-900">Glaucoma</p>
                  <p className={`text-lg font-semibold ${customer.medicalHistory?.glaucoma ? 'text-red-600' : 'text-gray-600'}`}>
                    {customer.medicalHistory?.glaucoma ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${customer.medicalHistory?.cataract ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                  <p className="text-sm font-medium text-gray-900">Cataract</p>
                  <p className={`text-lg font-semibold ${customer.medicalHistory?.cataract ? 'text-red-600' : 'text-gray-600'}`}>
                    {customer.medicalHistory?.cataract ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {customer.medicalHistory?.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{customer.medicalHistory.notes}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h3>
              {customer.insurance?.provider ? (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Provider</p>
                      <p className="text-lg font-semibold text-gray-900">{customer.insurance.provider}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Policy Number</p>
                      <p className="text-lg font-semibold text-gray-900">{customer.insurance.policyNumber}</p>
                    </div>
                    {customer.insurance.validUntil && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Valid Until</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(customer.insurance.validUntil)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No insurance information provided</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}