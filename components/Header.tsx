import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header() {
  const router = useRouter();

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-lg" />
              <span className="text-xl font-bold text-gray-900">tokenboard</span>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/" 
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive('/') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Assets
              </Link>
              <Link 
                href="/crowdsource" 
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive('/crowdsource') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Crowdsource
              </Link>
              <Link 
                href="/pyusd-demo" 
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive('/pyusd-demo') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                PYUSD Demo
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}