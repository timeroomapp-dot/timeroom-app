'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/app/components/DashboardHeader';
import Sidebar from '@/app/components/Sidebar';
import TimeCard from '@/app/components/TimeCard';
import { useState, useEffect } from 'react';

interface TimeSlot {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  availability: string[];
  createdAt: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-listings');

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login');
    }
  }, [status]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchTimeSlots();
    }
  }, [session]);

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch('/api/time-slots');
      if (response.ok) {
        const data = await response.json();
        setTimeSlots(data);
      }
    } catch (error) {
      console.error('Failed to fetch time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <DashboardHeader user={session?.user} />
      
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 p-8">
          {activeTab === 'my-listings' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">My Time Listings</h2>
                <p className="text-gray-400">Manage your available time slots for trading</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <p className="text-gray-400 mb-4">You haven't created any time listings yet</p>
                  <button className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg font-medium transition">
                    Create First Listing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {timeSlots.map((slot) => (
                    <TimeCard key={slot.id} slot={slot} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'buy-time' && (
            <div>
              <h2 className="text-3xl font-bold mb-4">Buy Time</h2>
              <div className="bg-gray-800 rounded-lg p-8">
                <p className="text-gray-400">Browse and purchase time from other users</p>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-3xl font-bold mb-4">My Bookings</h2>
              <div className="bg-gray-800 rounded-lg p-8">
                <p className="text-gray-400">View your upcoming bookings and transactions</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-3xl font-bold mb-4">Settings</h2>
              <div className="bg-gray-800 rounded-lg p-8">
                <p className="text-gray-400">Manage your account settings and preferences</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
