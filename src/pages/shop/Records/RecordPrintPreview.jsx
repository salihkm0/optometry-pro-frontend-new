// components/records/RecordPrintPreview.js
import { formatDate, formatPhoneNumber, formatCurrency } from '../../../utils/helpers';

export default function RecordPrintPreview({ record, isPreview = false }) {
  if (!record) return null;

  return (
    <div className="space-y-6 print:p-0 print:space-y-4">
      {/* Header */}
      <div className="text-center mb-8 print:mb-6">
        <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">
          Optometry Record #{record.recordId}
        </h1>
        <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="font-medium mr-2">Date:</span>
            {formatDate(record.date)}
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Customer:</span>
            {record.customer?.name}
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 print:p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Customer Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Examination Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 print:p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Examination Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Type</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {record.examinationType?.replace('_', ' ') || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Prescription</p>
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

      {/* Eye Measurements Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 print:p-4 print:break-inside-avoid">
        <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Eye Measurements</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">Lens</th>
                <th colSpan="4" className="px-4 py-2 text-center text-sm font-medium text-gray-700 border">Right Eye (OD)</th>
                <th colSpan="4" className="px-4 py-2 text-center text-sm font-medium text-gray-700 border">Left Eye (OS)</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 border"></th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 border">SPH</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 border">CYL</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 border">AXIS</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 border">V/A</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 border">SPH</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 border">CYL</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 border">AXIS</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 border">V/A</th>
              </tr>
            </thead>
            <tbody>
              {/* DV Row */}
              <tr>
                <td className="px-4 py-2 text-sm font-medium border">Dv</td>
                <td className="px-4 py-2 text-center border">{record.right_eye?.dv?.sph || '-'}</td>
                <td className="px-4 py-2 text-center border">{record.right_eye?.dv?.cyl || '-'}</td>
                <td className="px-4 py-2 text-center border">{record.right_eye?.dv?.axis || '-'}</td>
                <td className="px-4 py-2 text-center border">{record.right_eye?.dv?.va || '-'}</td>
                <td className="px-4 py-2 text-center border">{record.left_eye?.dv?.sph || '-'}</td>
                <td className="px-4 py-2 text-center border">{record.left_eye?.dv?.cyl || '-'}</td>
                <td className="px-4 py-2 text-center border">{record.left_eye?.dv?.axis || '-'}</td>
                <td className="px-4 py-2 text-center border">{record.left_eye?.dv?.va || '-'}</td>
              </tr>
              {/* Add Row */}
              <tr>
                <td className="px-4 py-2 text-sm font-medium border">Add</td>
                <td className="px-4 py-2 text-center border">{record.right_eye?.add?.sph || '-'}</td>
                <td className="px-4 py-2 text-center border">{record.right_eye?.add?.cyl || '-'}</td>
                <td className="px-4 py-2 text-center border">{record.right_eye?.add?.axis || '-'}</td>
                <td className="px-4 py-2 text-center border">{record.right_eye?.add?.va || '-'}</td>
                <td className="px-4 py-2 text-center border">{record.left_eye?.add?.sph || '-'}</td>
                <td className="px-4 py-2 text-center border">{record.left_eye?.add?.cyl || '-'}</td>
                <td className="px-4 py-2 text-center border">{record.left_eye?.add?.axis || '-'}</td>
                <td className="px-4 py-2 text-center border">{record.left_eye?.add?.va || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
        {/* Billing */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 print:p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Billing Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">{formatCurrency(record.billing?.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Paid:</span>
              <span className="font-semibold">{formatCurrency(record.billing?.paid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Balance:</span>
              <span className={`font-bold ${
                (record.billing?.amount || 0) - (record.billing?.paid || 0) > 0 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }`}>
                {formatCurrency((record.billing?.amount || 0) - (record.billing?.paid || 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Notes & Recommendations */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 print:p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg">Additional Information</h2>
          <div className="space-y-4">
            {record.notes && (
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Notes</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.notes}</p>
              </div>
            )}
            {record.recommendations && (
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Recommendations</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.recommendations}</p>
              </div>
            )}
            {record.diagnosis && (
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Diagnosis</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.diagnosis}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-300 text-center text-sm text-gray-500 print:mt-6 print:pt-4">
        <p>Record generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
        {isPreview && <p className="mt-1 text-xs italic">This is a preview. Changes are not saved.</p>}
      </div>
    </div>
  );
}