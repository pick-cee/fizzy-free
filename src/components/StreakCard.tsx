import React from 'react';
import { Flame, Trophy } from 'lucide-react';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({ currentStreak, longestStreak }) => {
  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Ready to start your journey?";
    if (streak === 1) return "Great start!";
    if (streak < 7) return "Building momentum!";
    if (streak < 30) return "Amazing progress!";
    if (streak < 90) return "You're on fire!";
    return "Incredible dedication!";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Current Streak */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center mb-4">
          <div className="bg-orange-100 p-3 rounded-full mr-4">
            <Flame className="text-orange-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Current Streak</h3>
            <p className="text-sm text-gray-600">Days without fizzy drinks</p>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-600 mb-2">
            {currentStreak}
          </div>
          <p className="text-sm font-medium text-gray-700">
            {currentStreak === 1 ? 'day' : 'days'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {getStreakMessage(currentStreak)}
          </p>
        </div>
      </div>

      {/* Longest Streak */}
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-lg p-6 border border-yellow-100">
        <div className="flex items-center mb-4">
          <div className="bg-yellow-100 p-3 rounded-full mr-4">
            <Trophy className="text-yellow-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Personal Best</h3>
            <p className="text-sm text-gray-600">Longest streak achieved</p>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-yellow-600 mb-2">
            {longestStreak}
          </div>
          <p className="text-sm font-medium text-gray-700">
            {longestStreak === 1 ? 'day' : 'days'}
          </p>
          {currentStreak === longestStreak && longestStreak > 0 && (
            <p className="text-xs text-green-600 font-medium mt-2">
              🎉 New personal record!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};