'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface DashboardHeaderProps {
  user?: User;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="text-xl font-bold text-white">Timeroom</span>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {user?.image && (
              <Image
                src={user.image}
                alt={user.name || 'User'}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div className="flex flex-col">
              <p className="text-white font-medium text-sm">{user?.name || 'User'}</p>
              <p className="text-gray-400 text-xs">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
