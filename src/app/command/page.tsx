'use client';

import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { FiClock, FiPlay } from 'react-icons/fi';
import { IoLink } from "react-icons/io5";
import { FiSmartphone } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function CommandPage() {
  const router = useRouter();
  const [link, setLink] = useState('');
  const [len, setLen] = useState('');
  const [devices, setDevices] = useState('');
  const [subscribe, setSubscribe] = useState(false);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/commands/yt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          link,
          len: parseInt(len),
          numOfDevices: parseInt(devices),
          subscribe,
          description
        }),
      });

      const result = await response.json();

      if (result === true) {
        toast.success('Command processing started successfully!');
        router.push('/dashboard');
      } else {
        toast.error('Something went wrong. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error processing command:', error);
      toast.error('Failed to process command. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900">
      <header className="bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Command Center</h1>
            <div className="flex items-center space-x-4">
              <span className="text-green-400">●</span>
              <span className="text-white">Admin</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Automatic Interaction Processing</h2>
            <p className="text-gray-400">Enter the youtube video details below to process</p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="relative w-20 h-20">
                <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute top-0 w-20 h-20 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <p className="text-gray-300 text-lg font-medium">
                Generating AI Responses for Devices
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="link" className="block text-sm font-medium text-gray-300 mb-2">
                    Youtube Video Link
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IoLink className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="link"
                      name="link"
                      type="url"
                      required
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/video"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="len" className="block text-sm font-medium text-gray-300 mb-2">
                    Video Length (seconds)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="len"
                      name="len"
                      type="number"
                      required
                      value={len}
                      onChange={(e) => setLen(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter duration in seconds"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="devices" className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Devices
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSmartphone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="devices"
                      name="devices"
                      type="number"
                      required
                      min="1"
                      value={devices}
                      onChange={(e) => setDevices(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter number of devices"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center">
                    <input
                      id="subscribe"
                      name="subscribe"
                      type="checkbox"
                      checked={subscribe}
                      onChange={(e) => setSubscribe(e.target.checked)}
                      className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label htmlFor="subscribe" className="ml-2 block text-sm font-medium text-gray-300">
                      Subscribe to channel
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="block w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter video description"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  <FiPlay className="w-5 h-5 mr-2" />
                  Execute Command
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 bg-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Processing Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-gray-300">Ready to process</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}