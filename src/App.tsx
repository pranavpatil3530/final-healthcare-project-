import React, { useState, useEffect } from 'react';
import { Heart, Brain, Calendar, TrendingUp, LogOut, Menu, X } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CheckinForm from './components/CheckinForm';

interface User {
  id: string;
  email: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'checkin'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('dashboard');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Heart className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">MindfulCheck</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <TrendingUp className="inline-block w-4 h-4 mr-1" />
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('checkin')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'checkin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Calendar className="inline-block w-4 h-4 mr-1" />
                  Check-in
                </button>
              </div>
            </div>

            {/* User menu */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <div className="relative">
                  <span className="text-sm text-gray-600 mr-4">Welcome, {user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-blue-100">
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <TrendingUp className="inline-block w-4 h-4 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  setCurrentView('checkin');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  currentView === 'checkin'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Calendar className="inline-block w-4 h-4 mr-2" />
                Check-in
              </button>
              <div className="px-3 py-2 text-sm text-gray-600">
                Welcome, {user.email}
              </div>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="inline-block w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentView === 'dashboard' ? (
            <Dashboard />
          ) : (
            <CheckinForm onComplete={() => setCurrentView('dashboard')} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;