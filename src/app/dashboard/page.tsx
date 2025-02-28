'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiMonitor, FiPlay, FiCheck, FiChevronLeft, FiChevronRight, FiRefreshCw, FiCommand } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Device, DevicesResponse, DeviceStats } from '../../../types/DeviceTypes';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'idle': return 'bg-gray-200 text-gray-800';
    case 'active': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'to be done': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-200 text-gray-800';
  }
};


export default function DashboardPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceData, setDeviceData] = useState<DevicesResponse>({
    devices: [],
    currentPage: 0,
    totalPages: 0,
    totalItems: 0
  });
  const [stats, setStats] = useState<DeviceStats>({
    totalActiveDevices: 0,
    executionOngoing: 0,
    executionCompleted: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    totalStream: 0
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Add ref to store interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDevices = async (page: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/devices?page=${page}`);
      if (!response.ok) throw new Error('Failed to fetch devices');
      const data: DevicesResponse = await response.json();
      console.log(data);
      setDeviceData(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to fetch devices');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/devices/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data: DeviceStats = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch device stats');
    }
  };

  // Wrap with useCallback
  const fetchAllData = useCallback(async () => {
    try {
      await Promise.all([
        fetchDevices(currentPage),
        fetchStats()
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [currentPage]); // Add dependencies here

  // Now this effect won't run unnecessarily
  useEffect(() => {
    fetchAllData();
    
    intervalRef.current = setInterval(() => {
      fetchAllData();
    }, 5000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchAllData]); // fetchAllData is now stable between renders

  // Update manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Fetch data
    await fetchAllData();

    // Restart interval
    intervalRef.current = setInterval(() => {
      fetchAllData();
    }, 5000);

    setIsRefreshing(false);
    toast.success('Status refreshed successfully!');
  };

  // Clean up interval when component unmounts
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Optional: Pause auto-refresh when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Clear interval when tab is not visible
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      } else {
        // Restart interval and fetch fresh data when tab becomes visible
        fetchAllData();
        intervalRef.current = setInterval(() => {
          fetchAllData();
        }, 5000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleExecuteCommand = () => {
    router.push('/command');
  };

  const getStatusDisplay = (device: Device) => ({
    like: device.hasLike ? 'completed' : 'to be done',
    comment: device.hasComment ? 'completed' : 'to be done',
    share: device.hasShare ? 'completed' : 'to be done',
    stream: device.hasStream ? 'completed' : 'to be done'
  });

  const allDevicesCompleted = stats.totalActiveDevices > 0 && stats.totalActiveDevices === stats.executionCompleted;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Make header sticky */}
      <header className="bg-white shadow-md sticky top-0 z-50 transition-shadow duration-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <FiRefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExecuteCommand}
                disabled={!allDevicesCompleted}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                  ${allDevicesCompleted 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-400'
                  }`}
              >
                <FiCommand className="h-4 w-4 mr-2" />
                Execute Command
                {!allDevicesCompleted && stats.totalActiveDevices > 0 && (
                  <span className="ml-2 text-xs">
                    ({stats.executionCompleted}/{stats.totalActiveDevices} completed)
                  </span>
                )}
              </button>
            </div>
            <div className="text-sm text-gray-500 ml-4">
              Last updated: {lastUpdated.toLocaleTimeString()}
              <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" 
                    title="Auto-refreshing every 5 seconds" 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Add padding to main content to prevent it from jumping when header becomes sticky */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Active Devices */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FiMonitor className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Active Devices</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalActiveDevices}</p>
              </div>
            </div>
          </div>

          {/* Execution Ongoing */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FiPlay className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Execution Ongoing</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.executionOngoing}</p>
              </div>
            </div>
          </div>

          {/* Execution Completed */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FiCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Execution Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.executionCompleted}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Likes */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Total Likes</p>
                <p className="text-2xl font-bold text-purple-900">{stats.totalLikes}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-200 bg-opacity-50">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Comments */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Comments</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalComments}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-200 bg-opacity-50">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Shares */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Total Shares</p>
                <p className="text-2xl font-bold text-green-900">{stats.totalShares}</p>
              </div>
              <div className="p-3 rounded-full bg-green-200 bg-opacity-50">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Streams */}
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl shadow-sm border border-pink-200 p-6 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-600 mb-1">Total Streams</p>
                <p className="text-2xl font-bold text-pink-900">{stats.totalStream}</p>
              </div>
              <div className="p-3 rounded-full bg-pink-200 bg-opacity-50">
                <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Status</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device ID
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Like
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comment
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Share
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stream
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deviceData.devices.map((device) => {
                    const status = getStatusDisplay(device);
                    return (
                      <tr key={device.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {device.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(device.status)}`}>
                            {device.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status.like)}`}>
                            {status.like}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status.comment)}`}>
                            {status.comment}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status.share)}`}>
                            {status.share}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status.stream)}`}>
                            {status.stream}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(deviceData.currentPage * 10) + 1} to {Math.min((deviceData.currentPage + 1) * 10, deviceData.totalItems)} of {deviceData.totalItems} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={deviceData.currentPage === 0}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(deviceData.totalPages - 1, p + 1))}
                  disabled={deviceData.currentPage === deviceData.totalPages - 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}