'use client';

interface TimeSlot {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  availability: string[];
  createdAt: string;
}

interface TimeCardProps {
  slot: TimeSlot;
}

export default function TimeCard({ slot }: TimeCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">{slot.title}</h3>
            <p className="text-gray-400 text-sm">{slot.description}</p>
          </div>
          <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium ml-4">
            {slot.duration}h
          </span>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Price per hour</span>
            <span className="text-white font-bold">${slot.price}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Available slots</span>
            <span className="text-white font-bold">{slot.availability.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Listed on</span>
            <span className="text-white text-sm">{formatDate(slot.createdAt)}</span>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-3 mb-6">
          <p className="text-gray-300 text-xs font-medium mb-2">Available Times:</p>
          <div className="flex flex-wrap gap-2">
            {slot.availability.slice(0, 3).map((time, idx) => (
              <span key={idx} className="bg-gray-600 text-gray-200 text-xs px-2 py-1 rounded">
                {time}
              </span>
            ))}
            {slot.availability.length > 3 && (
              <span className="bg-gray-600 text-gray-200 text-xs px-2 py-1 rounded">
                +{slot.availability.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition">
            Edit
          </button>
          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
