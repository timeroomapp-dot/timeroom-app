'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import TimeCard from '@/app/components/TimeCard';

interface TimeSlot {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  availability: string[];
  createdAt: string;
  seller: { name: string; email: string };
}

export default function MarketplacePage() {
  const { data: session } = useSession();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'tutoring', label: 'Tutoring' },
    { value: 'design', label: 'Design' },
    { value: 'dev', label: 'Development' },
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-25', label: 'Under $25' },
    { value: '25-50', label: '$25 - $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100+', label: '$100+' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'duration', label: 'Longest Duration' },
  ];

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/marketplace/listings');
      if (response.ok) {
        const data = await response.json();
        setTimeSlots(data);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = timeSlots.filter(slot => {
    const matchesSearch = slot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         slot.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || slot.category === selectedCategory;
    const matchesPrice = priceRange === 'all' || filterByPrice(slot.price, priceRange);
    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'duration') return b.duration - a.duration;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filterByPrice = (price: number, range: string): boolean => {
    if (range === '0-25') return price < 25;
    if (range === '25-50') return price >= 25 && price < 50;
    if (range === '50-100') return price >= 50 && price < 100;
    if (range === '100+') return price >= 100;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Time Marketplace</h1>
          <p className="text-gray-400">Browse and purchase time from talented professionals</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-2">
            <label className="block text-white font-medium mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search listings..."
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-indigo-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-indigo-500 outline-none transition"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Price Range</label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-indigo-500 outline-none transition"
            >
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-gray-400">Showing {filteredListings.length} results</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-400">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-indigo-500 outline-none transition"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">No listings found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(slot => (
              <TimeCard key={slot.id} slot={slot} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
