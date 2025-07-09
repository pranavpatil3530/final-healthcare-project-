import React, { useState } from 'react';
import { Heart, Save, Smile, Meh, Frown } from 'lucide-react';
import { checkinsAPI } from '../lib/api';

interface CheckinFormProps {
  onComplete: () => void;
}

const CheckinForm: React.FC<CheckinFormProps> = ({ onComplete }) => {
  const [moodRating, setMoodRating] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [feelingsNotes, setFeelingsNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await checkinsAPI.create({
        moodRating,
        stressLevel,
        feelingsNotes,
      });
      onComplete();
    } catch (error: any) {
      setError(error.message || 'Failed to save check-in');
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return <Smile className="w-8 h-8 text-green-500" />;
    if (mood >= 6) return <Meh className="w-8 h-8 text-yellow-500" />;
    return <Frown className="w-8 h-8 text-red-500" />;
  };

  const getMoodDescription = (mood: number) => {
    if (mood >= 9) return 'Excellent';
    if (mood >= 8) return 'Great';
    if (mood >= 7) return 'Good';
    if (mood >= 6) return 'Fair';
    if (mood >= 5) return 'Okay';
    if (mood >= 4) return 'Not great';
    if (mood >= 3) return 'Poor';
    if (mood >= 2) return 'Bad';
    return 'Very bad';
  };

  const getStressDescription = (stress: number) => {
    if (stress >= 9) return 'Extremely high';
    if (stress >= 8) return 'Very high';
    if (stress >= 7) return 'High';
    if (stress >= 6) return 'Moderate-high';
    if (stress >= 5) return 'Moderate';
    if (stress >= 4) return 'Moderate-low';
    if (stress >= 3) return 'Low';
    if (stress >= 2) return 'Very low';
    return 'None';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
        <div className="flex items-center mb-6">
          <Heart className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Check-in</h1>
            <p className="text-gray-600 mt-1">Take a moment to reflect on your mental state</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Mood Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              How would you rate your mood today?
            </label>
            <div className="flex items-center justify-center mb-4">
              {getMoodEmoji(moodRating)}
              <span className="ml-3 text-lg font-semibold text-gray-900">
                {moodRating}/10 - {getMoodDescription(moodRating)}
              </span>
            </div>
            <div className="px-3">
              <input
                type="range"
                min="1"
                max="10"
                value={moodRating}
                onChange={(e) => setMoodRating(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Bad</span>
                <span>Neutral</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>

          {/* Stress Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What's your current stress level?
            </label>
            <div className="flex items-center justify-center mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                stressLevel >= 8 ? 'bg-red-100' : stressLevel >= 6 ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <div className={`w-4 h-4 rounded-full ${
                  stressLevel >= 8 ? 'bg-red-500' : stressLevel >= 6 ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
              </div>
              <span className="ml-3 text-lg font-semibold text-gray-900">
                {stressLevel}/10 - {getStressDescription(stressLevel)}
              </span>
            </div>
            <div className="px-3">
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>No Stress</span>
                <span>Moderate</span>
                <span>Very High</span>
              </div>
            </div>
          </div>

          {/* Feelings Notes */}
          <div>
            <label htmlFor="feelings" className="block text-sm font-medium text-gray-700 mb-2">
              Tell us about your feelings today (optional)
            </label>
            <textarea
              id="feelings"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Describe your thoughts, feelings, or anything that's on your mind..."
              value={feelingsNotes}
              onChange={(e) => setFeelingsNotes(e.target.value)}
              maxLength={500}
            />
            <div className="mt-1 text-sm text-gray-500 text-right">
              {feelingsNotes.length}/500 characters
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Saving...' : 'Save Check-in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckinForm;