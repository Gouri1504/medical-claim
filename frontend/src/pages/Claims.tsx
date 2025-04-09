import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Eye, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { claims } from '../services/api';
import toast from 'react-hot-toast';
import ClaimDetails from '../components/ClaimDetails';

interface Claim {
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
}

const Claims: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [claimsList, setClaimsList] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const fetchClaims = useCallback(async () => {
    try {
      const response = await claims.getAll();
      setClaimsList(response.data);
    } catch (error) {
      toast.error('Failed to fetch claims');
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const file = acceptedFiles[0];
      
      // First, process the PDF to extract data
      setIsProcessing(true);
      const processResult = await claims.processPdf(file);
      
      if (processResult.success) {
        setExtractedData(processResult.data);
        toast.success('PDF processed successfully');
        
        // Then upload the file to the server
        const uploadResult = await claims.upload(file);
        
        // If the upload was successful, update the claims list
        if (uploadResult.success) {
          toast.success('Claim uploaded successfully');
          fetchClaims(); // Refresh the claims list
        }
      } else {
        toast.error(`Processing failed: ${processResult.error}`);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'Failed to process or upload claim'}`);
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  }, [fetchClaims]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Upload Medical Claim
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Upload your medical invoice or claim document in PDF format.</p>
          </div>
          <div
            {...getRootProps()}
            className={`mt-4 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
              isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
            }`}
          >
            <div className="space-y-1 text-center">
              <input {...getInputProps()} />
              <div className="flex justify-center">
                {isProcessing ? (
                  <Loader className="h-12 w-12 text-indigo-500 animate-spin" />
                ) : (
                  <Upload
                    className={`h-12 w-12 ${
                      isDragActive ? 'text-indigo-500' : 'text-gray-400'
                    }`}
                  />
                )}
              </div>
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <span>Upload a file</span>
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF up to 10MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Display extracted data if available */}
      {extractedData && (
        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Extracted Data
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-500">Patient Information</h4>
                <p className="mt-1 text-sm text-gray-900">{extractedData.patientName}</p>
                <p className="mt-1 text-sm text-gray-900">{extractedData.providerName}</p>
                <p className="mt-1 text-sm text-gray-900">{extractedData.dateOfService}</p>
                <p className="mt-1 text-sm text-gray-900">${extractedData.amount}</p>
                <p className="mt-1 text-sm text-gray-900">Type: {extractedData.claimType}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-500">Diagnosis Codes</h4>
                <ul className="mt-1 text-sm text-gray-900">
                  {extractedData.diagnosisCodes.map((code: string, index: number) => (
                    <li key={index}>{code}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-500">Procedure Codes</h4>
                <ul className="mt-1 text-sm text-gray-900">
                  {extractedData.procedureCodes.map((code: string, index: number) => (
                    <li key={index}>{code}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Claims
          </h3>
          <div className="mt-4">
            {claimsList.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No claims</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Upload your first medical claim to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {claimsList.map((claim) => (
                      <tr key={claim.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {claim.patientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {claim.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${claim.amount ? claim.amount.toFixed(2) : '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {claim.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(claim.status)}
                            <span className="ml-2 text-sm text-gray-500">{claim.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => setSelectedClaim(claim)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedClaim && (
        <ClaimDetails
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
        />
      )}
    </div>
  );
};

export default Claims;