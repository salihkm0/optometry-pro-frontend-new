import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Phone, Mail, Calendar, User, Edit } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import endpoints from '../../../api/endpoints';
import { formatDate, formatPhoneNumber } from '../../../utils/helpers';
import { toast } from 'react-hot-toast';

export default function ShopCustomerFamily() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFamilyData();
  }, [id]);

  const fetchFamilyData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(endpoints.customerFamily(id));
      
      if (response.success) {
        setCustomer(response.data.primaryCustomer);
        setFamilyMembers(response.data.familyMembers || []);
      }
    } catch (error) {
      console.error('Error fetching family data:', error);
      toast.error('Failed to load family data');
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
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/shop/customers/${id}`)}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Family Members</h1>
          <p className="text-gray-600">Manage family relationships</p>
        </div>
      </div>

      {/* Main Customer Card */}
      <div className="card bg-primary-50 border-primary-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="bg-primary-100 rounded-full p-3">
              <User className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-gray-900">{customer.name}</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Primary
                </span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {formatPhoneNumber(customer.phone)}
                </div>
                {customer.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {customer.email}
                  </div>
                )}
                {customer.relationship && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {customer.relationship}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Link
            to={`/shop/customers/edit/${customer._id}`}
            className="text-primary-600 hover:text-primary-700"
          >
            <Edit className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Family Members Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Family Members ({familyMembers.length})
          </h3>
          <div className="text-sm text-gray-500">
            Sharing phone number: {formatPhoneNumber(customer.phone)}
          </div>
        </div>

        {familyMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No family members found</p>
            <p className="text-sm text-gray-400 mt-2">
              Family members are automatically linked when they share the same phone number
            </p>
            <Link
              to="/shop/customers/new"
              className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              Add a family member
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyMembers.map((member) => (
              <div
                key={member._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      to={`/shop/customers/${member._id}`}
                      className="font-semibold text-gray-900 hover:text-primary-600"
                    >
                      {member.name}
                    </Link>
                    {member.relationship && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {member.relationship}
                        </span>
                      </div>
                    )}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-3 w-3 mr-1" />
                        {formatPhoneNumber(member.phone)}
                      </div>
                      {member.email && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          {member.email}
                        </div>
                      )}
                      {member.age && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          Age: {member.age}
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/shop/customers/${member._id}`}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">About Family Linking</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Family members are automatically linked when they share the same phone number. 
                This allows you to easily track family relationships and manage appointments 
                for the entire family.
              </p>
              <p className="mt-2">
                To add a family member, simply create a new customer with the same phone number 
                and optionally set their relationship (Father, Mother, Son, etc.).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}