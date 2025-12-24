'use client';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navigationItems = [
  { id: 'my-listings', label: 'My Listings', icon: '📋' },
  { id: 'buy-time', label: 'Buy Time', icon: '🛒' },
  { id: 'bookings', label: 'My Bookings', icon: '📅' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 p-6 h-screen sticky top-0">
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeTab === item.id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-300 text-sm font-medium mb-2">Time Balance</p>
          <p className="text-2xl font-bold text-indigo-400">24.5 hrs</p>
          <p className="text-gray-400 text-xs mt-1">Available for trading</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="bg-indigo-900 rounded-lg p-4">
          <p className="text-indigo-200 text-sm font-medium mb-2">💡 Tip</p>
          <p className="text-indigo-100 text-xs">
            List your available time to start earning credits
          </p>
        </div>
      </div>
    </aside>
  );
}
