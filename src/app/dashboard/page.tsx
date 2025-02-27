'use client';

import { useState, useEffect } from 'react';
import { FiMonitor, FiPlay, FiCheck, FiChevronLeft, FiChevronRight, FiRefreshCw, FiCommand } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Device, DevicesResponse } from '../../../types/DeviceTypes';

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

  useEffect(() => {
    fetchDevices(currentPage);
  }, [currentPage]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDevices(currentPage);
    toast.success('Status refreshed successfully!');
  };

  const handleExecuteCommand = () => {
    router.push('/command');
  };

  const getStatusDisplay = (device: Device) => ({
    like: device.hasLike ? 'completed' : 'to be done',
    comment: device.hasComment ? 'completed' : 'to be done',
    share: device.hasShare ? 'completed' : 'to be done',
    stream: device.hasStream ? 'completed' : 'to be done'
  });

  const activeDevices = deviceData.devices.filter(d => d.isActive).length;
  const executionOngoing = deviceData.devices.filter(d => d.status === 'active').length;
  const executionCompleted = deviceData.devices.filter(d => d.status === 'completed').length;

  const allDevicesCompleted = deviceData.devices.every(device => 
    device.status === 'completed' &&
    device.hasLike &&
    device.hasComment &&
    device.hasShare &&
    device.hasStream
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiRefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExecuteCommand}
                disabled={!allDevicesCompleted}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
                  ${allDevicesCompleted 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-400'
                  }`}
              >
                <FiCommand className="h-4 w-4 mr-2" />
                Execute Command
              </button>
            </div>
          </div>
        </div>
      </header>

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
                <p className="text-2xl font-semibold text-gray-900">{activeDevices}</p>
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
                <p className="text-2xl font-semibold text-gray-900">{executionOngoing}</p>
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
                <p className="text-2xl font-semibold text-gray-900">{executionCompleted}</p>
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