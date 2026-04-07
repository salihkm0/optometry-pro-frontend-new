import { useState } from 'react';
import { X, UserPlus, Users, Edit, Phone, Mail } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import endpoints from '../../../api/endpoints';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function FamilyMembersModal({ customer, familyMembers, onClose, onRefresh }) {
  const [selectedRelationship, setSelectedRelationship] = useState(customer.relationship || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const relationships = [
    'Father', 'Mother', 'Son', 'Daughter', 
    'Husband', 'Wife', 'Brother', 'Sister', 'Other'
  ];

  const handleUpdateRelationship = async () => {
    if (!selectedRelationship) {
      toast.error('Please select a relationship');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await axiosClient.put(endpoints.updateCustomerFamily(customer._id), {
        relationship: selectedRelationship
      });
      
      if (response.success) {
        toast.success('Relationship updated successfully');
        onRefresh();
        onClose();
      }
    } catch (error) {
      console.error('Error updating relationship:', error);
      toast.error(error.response?.data?.message || 'Failed to update relationship');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    return phone;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Family Members</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Customer */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Customer</h3>
            <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-4 border border-primary-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{customer.name}</p>
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
                  </div>
                </div>
                <Link
                  to={`/shop/customers/edit/${customer._id}`}
                  className="text-primary-600 hover:text-primary-700"
                  onClick={onClose}
                >
                  <Edit className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Relationship Selection */}
          {/* <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship to Family Head
            </label>
            <select
              value={selectedRelationship}
              onChange={(e) => setSelectedRelationship(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Select relationship</option>
              {relationships.map(rel => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              This helps identify how family members are related to each other
            </p>
            {selectedRelationship !== customer.relationship && selectedRelationship && (
              <button
                onClick={handleUpdateRelationship}
                disabled={isUpdating}
                className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm"
              >
                {isUpdating ? 'Updating...' : 'Save Relationship'}
              </button>
            )}
          </div> */}

          {/* Family Members List */}
          {familyMembers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Other Family Members ({familyMembers.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {familyMembers.map((member) => (
                  <div key={member._id} className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link
                          to={`/shop/customers/${member._id}`}
                          onClick={onClose}
                          className="font-medium text-gray-900 hover:text-primary-600"
                        >
                          {member.name}
                        </Link>
                        {member.relationship && (
                          <p className="text-xs text-purple-600 mt-1">
                            {member.relationship}
                          </p>
                        )}
                        <div className="mt-2 text-sm text-gray-500">
                          {member.phone}
                        </div>
                      </div>
                      <Link
                        to={`/shop/customers/${member._id}`}
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Family Member Button */}
          {/* <div className="border-t border-gray-200 pt-4">
            <Link
              to={`/shop/customers/new?phone=${customer.phone}&family=${customer._id}`}
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Family Member
            </Link>
          </div> */}

          {/* Info Box */}
          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>How family linking works:</strong><br />
              Family members are automatically linked when they share the same phone number.
              You can manually set relationships to better organize family groups.
            </p>
          </div> */}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}