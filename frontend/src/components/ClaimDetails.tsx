import React from 'react';
import { X, FileText, Calendar, User, DollarSign, Hash, Stethoscope, ClipboardList, Activity } from 'lucide-react';

interface ClaimDetailsProps {
  claim: {
    id: string;
    patientName: string;
    invoiceNumber: string;
    amount: number;
    date: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    previewUrl?: string;
    extractedData?: {
      patientName: string;
      providerName: string;
      dateOfService: string;
      amount: number;
      claimType: string;
      diagnosisCodes: string[];
      procedureCodes: string[];
    };
  };
  onClose: () => void;
}

const ClaimDetails: React.FC<ClaimDetailsProps> = ({ claim, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Claim Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Preview Section */}
          {claim.previewUrl && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Document Preview</h3>
              <div className="border rounded-lg p-4 bg-gray-50">
                <iframe
                  src={claim.previewUrl}
                  className="w-full h-64"
                  title="Document Preview"
                />
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                claim.status === 'Approved'
                  ? 'bg-green-100 text-green-800'
                  : claim.status === 'Rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {claim.status}
            </span>
          </div>

          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Patient Name</p>
                  <p className="text-base text-gray-900">{claim.patientName}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Hash className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Invoice Number</p>
                  <p className="text-base text-gray-900">{claim.invoiceNumber}</p>
                </div>
              </div>

              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-base text-gray-900">${claim.amount ? claim.amount.toFixed(2) : '0.00'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-base text-gray-900">{claim.date}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Extracted Data */}
          {claim.extractedData && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Extracted Data</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Patient Information
                  </h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Name:</span> {claim.extractedData.patientName}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Provider:</span> {claim.extractedData.providerName}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Date of Service:</span> {claim.extractedData.dateOfService}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Amount:</span> ${claim.extractedData.amount}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Type:</span> {claim.extractedData.claimType}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-500 flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Diagnosis Codes
                  </h4>
                  <ul className="mt-2 text-sm text-gray-900">
                    {claim.extractedData.diagnosisCodes.map((code, index) => (
                      <li key={index} className="mb-1">{code}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-500 flex items-center">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Procedure Codes
                  </h4>
                  <ul className="mt-2 text-sm text-gray-900">
                    {claim.extractedData.procedureCodes.map((code, index) => (
                      <li key={index} className="mb-1">{code}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimDetails; 