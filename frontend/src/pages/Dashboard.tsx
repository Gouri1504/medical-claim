import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { claims } from '../services/api';
import toast from 'react-hot-toast';

interface Claim {
  id: string;
  patientName: string;
  invoiceNumber: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [claimStats, setClaimStats] = useState({
    total: 0,
    pending: 0,
    processed: 0,
  });
  const [recentClaims, setRecentClaims] = useState<Claim[]>([]);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await claims.getAll();
        const claimsList = response.data;
        
        // Calculate statistics
        setClaimStats({
          total: claimsList.length,
          pending: claimsList.filter((claim: Claim) => claim.status === 'Pending').length,
          processed: claimsList.filter((claim: Claim) => claim.status !== 'Pending').length,
        });

        // Get recent claims (last 5)
        setRecentClaims(claimsList.slice(0, 5));
      } catch (error) {
        toast.error('Failed to fetch claims data');
      }
    };

    fetchClaims();
  }, []);

  const stats = [
    { name: 'Total Claims', value: claimStats.total.toString(), icon: FileText },
    { name: 'Pending Claims', value: claimStats.pending.toString(), icon: Clock },
    { name: 'Processed Claims', value: claimStats.processed.toString(), icon: CheckCircle },
  ];

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
    <div>
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Welcome back, {user?.name || 'User'}
              </h2>
            </div>
            <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
              <button
                onClick={() => navigate('/claims')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload New Claim
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Overview</h3>
          <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.name}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <item.icon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {item.name}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">{item.value}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Activity
              </h3>
            </div>
            <div className="border-t border-gray-200">
              {recentClaims.length === 0 ? (
                <div className="px-4 py-12 text-center text-gray-500">
                  No recent activity to display
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {recentClaims.map((claim) => (
                    <li key={claim.id} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(claim.status)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {claim.patientName}
                            </p>
                            <p className="text-sm text-gray-500">
                              Invoice #{claim.invoiceNumber}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${claim.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(claim.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;