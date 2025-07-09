import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Smile, Frown, Meh, Heart, Brain } from 'lucide-react';
import { checkinsAPI } from '../lib/api';

interface CheckIn {
  _id: string;
  moodRating: number;
  stressLevel: number;
  feelingsNotes: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCheckins: 0,
    averageMood: 0,
    averageStress: 0,
    streak: 0,
  });

  useEffect(() => {
    fetchCheckins();
  }, []);

  const fetchCheckins = async () => {
    try {
      const data = await checkinsAPI.getAll();
      setCheckins(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: CheckIn[]) => {
    if (data.length === 0) {
      setStats({ totalCheckins: 0, averageMood: 0, averageStress: 0, streak: 0 });
      return;
    }

    const totalCheckins = data.length;
    const averageMood = data.reduce((sum, checkin) => sum + checkin.moodRating, 0) / totalCheckins;
    const averageStress = data.reduce((sum, checkin) => sum + checkin.stressLevel, 0) / totalCheckins;

    // Calculate streak (consecutive days with check-ins)
    let streak = 0;
    const today = new Date();
    const sortedData = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    for (let i = 0; i < sortedData.length; i++) {
      const checkinDate = new Date(sortedData[i].createdAt);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (checkinDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    setStats({
      totalCheckins,
      averageMood: Math.round(averageMood * 10) / 10,
      averageStress: Math.round(averageStress * 10) / 10,
      streak,
    });
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return <Smile className="w-6 h-6 text-green-500" />;
    if (mood >= 6) return <Meh className="w-6 h-6 text-yellow-500" />;
    return <Frown className="w-6 h-6 text-red-500" />;
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'bg-green-100 text-green-800';
    if (mood >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStressColor = (stress: number) => {
    if (stress >= 8) return 'bg-red-100 text-red-800';
    if (stress >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <Brain className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to your Mental Health Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your daily mood and mental wellness journey</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Check-ins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCheckins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Average Mood</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageMood}/10</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Average Stress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageStress}/10</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Smile className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">{stats.streak} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Check-ins */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Check-ins</h2>
        </div>
        <div className="p-6">
          {checkins.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No check-ins yet. Start by completing your first check-in!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {checkins.slice(0, 5).map((checkin) => (
                <div key={checkin._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center">
                          {getMoodEmoji(checkin.moodRating)}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(checkin.moodRating)}`}>
                            Mood: {checkin.moodRating}/10
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStressColor(checkin.stressLevel)}`}>
                          Stress: {checkin.stressLevel}/10
                        </span>
                      </div>
                      {checkin.feelingsNotes && (
                        <p className="text-gray-700 text-sm mb-2">{checkin.feelingsNotes}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(checkin.createdAt).toLocaleDateString()} at {new Date(checkin.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mood Trend Visualization */}
      {checkins.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mood Trend (Last 7 Days)</h2>
          <div className="h-64 flex items-end space-x-2">
            {checkins.slice(0, 7).reverse().map((checkin, index) => (
              <div key={checkin._id} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t-md transition-all duration-300 hover:bg-blue-600"
                  style={{ height: `${(checkin.moodRating / 10) * 100}%` }}
                ></div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  {new Date(checkin.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs text-gray-700 font-medium">{checkin.moodRating}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;