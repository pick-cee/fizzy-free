import React from 'react';
import { Check, X, Clock, Sun, Moon } from 'lucide-react';
import { DayEntry } from '../types';

interface CheckInCardProps {
  todayEntry: DayEntry | null;
  onCheckIn: (period: 'afternoon' | 'evening', hadFizzyDrink: boolean) => void;
}

export const CheckInCard: React.FC<CheckInCardProps> = ({ todayEntry, onCheckIn }) => {
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isReminderTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // 3:00 PM (15:00) or 8:45 PM (20:45)
    return (hours === 15 && minutes === 0) || (hours === 20 && minutes === 45);
  };

  const getCurrentPeriod = () => {
    const hours = new Date().getHours();
    return hours < 18 ? 'afternoon' : 'evening';
  };

  const needsAfternoonCheckin = !todayEntry?.afternoon_checkin;
  const needsEveningCheckin = !todayEntry?.evening_checkin;
  const currentPeriod = getCurrentPeriod();

  // If both check-ins are complete
  if (todayEntry?.afternoon_checkin && todayEntry?.evening_checkin) {
    const totalHadDrinks = (todayEntry.afternoon_had_drink ? 1 : 0) + (todayEntry.evening_had_drink ? 1 : 0);
    
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Today's Check-ins Complete</h2>
          <div className="flex items-center text-sm text-gray-500">
            <Clock size={16} className="mr-1" />
            {getCurrentTime()}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Afternoon Result */}
          <div className={`p-4 rounded-lg border-2 ${
            todayEntry.afternoon_had_drink 
              ? 'bg-red-50 border-red-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Sun size={16} className="text-yellow-600 mr-2" />
                <span className="font-medium text-sm">3:00 PM</span>
              </div>
              {todayEntry.afternoon_had_drink ? (
                <X size={16} className="text-red-600" />
              ) : (
                <Check size={16} className="text-green-600" />
              )}
            </div>
            <p className="text-xs text-gray-600">
              {todayEntry.afternoon_had_drink ? 'Had drink' : 'Stayed clean'}
            </p>
          </div>

          {/* Evening Result */}
          <div className={`p-4 rounded-lg border-2 ${
            todayEntry.evening_had_drink 
              ? 'bg-red-50 border-red-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Moon size={16} className="text-indigo-600 mr-2" />
                <span className="font-medium text-sm">8:45 PM</span>
              </div>
              {todayEntry.evening_had_drink ? (
                <X size={16} className="text-red-600" />
              ) : (
                <Check size={16} className="text-green-600" />
              )}
            </div>
            <p className="text-xs text-gray-600">
              {todayEntry.evening_had_drink ? 'Had drink' : 'Stayed clean'}
            </p>
          </div>
        </div>
        
        <div className="text-center py-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
            totalHadDrinks === 0 
              ? 'bg-green-100 text-green-600' 
              : totalHadDrinks === 1
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-red-100 text-red-600'
          }`}>
            {totalHadDrinks === 0 ? (
              <Check size={24} />
            ) : (
              <X size={24} />
            )}
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            {totalHadDrinks === 0 
              ? 'Perfect day! Both check-ins clean!' 
              : totalHadDrinks === 1
                ? 'One slip, but you checked in honestly'
                : 'Tough day, but tomorrow is a fresh start'
            }
          </h3>
          
          <p className="text-gray-600 text-sm">
            {totalHadDrinks === 0 
              ? 'You\'re building incredible momentum!' 
              : 'Every honest check-in is progress. Keep going!'
            }
          </p>
        </div>
      </div>
    );
  }

  // Determine which check-in to show
  const showAfternoon = needsAfternoonCheckin && (currentPeriod === 'afternoon' || needsEveningCheckin);
  const showEvening = needsEveningCheckin && currentPeriod === 'evening' && !needsAfternoonCheckin;
  
  const period = showAfternoon ? 'afternoon' : 'evening';
  const timeLabel = showAfternoon ? '3:00 PM' : '8:45 PM';
  const icon = showAfternoon ? Sun : Moon;
  const IconComponent = icon;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <IconComponent className={`mr-3 ${showAfternoon ? 'text-yellow-600' : 'text-indigo-600'}`} size={24} />
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {showAfternoon ? 'Afternoon' : 'Evening'} Check-in
            </h2>
            <p className="text-sm text-gray-600">{timeLabel}</p>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock size={16} className="mr-1" />
          {getCurrentTime()}
        </div>
      </div>
      
      {isReminderTime() && (
        <div className="bg-yellow-100 border-l-4 border-yellow-400 p-3 mb-4 rounded">
          <p className="text-yellow-700 font-medium">⏰ Reminder: Time for your {timeLabel} check-in!</p>
        </div>
      )}

      {/* Show previous check-in if completed */}
      {todayEntry?.afternoon_checkin && showEvening && (
        <div className="mb-4 p-3 bg-white rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sun size={16} className="text-yellow-600 mr-2" />
              <span className="text-sm font-medium">3:00 PM Check-in</span>
            </div>
            <div className="flex items-center">
              {todayEntry.afternoon_had_drink ? (
                <>
                  <X size={16} className="text-red-600 mr-1" />
                  <span className="text-sm text-red-600">Had drink</span>
                </>
              ) : (
                <>
                  <Check size={16} className="text-green-600 mr-1" />
                  <span className="text-sm text-green-600">Stayed clean</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          Did you have any fizzy drinks since your last check-in?
        </h3>
        <p className="text-gray-600 text-sm">
          Be honest with yourself - this is your journey to health
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onCheckIn(period, false)}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        >
          <div className="flex flex-col items-center">
            <Check size={24} className="mb-2" />
            <span>No, stayed clean!</span>
          </div>
        </button>
        
        <button
          onClick={() => onCheckIn(period, true)}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        >
          <div className="flex flex-col items-center">
            <X size={24} className="mb-2" />
            <span>Yes, I had some</span>
          </div>
        </button>
      </div>

      {/* Progress indicator */}
      <div className="mt-4 flex justify-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          todayEntry?.afternoon_checkin ? 'bg-blue-500' : 'bg-gray-300'
        }`} />
        <div className={`w-3 h-3 rounded-full ${
          todayEntry?.evening_checkin ? 'bg-blue-500' : 'bg-gray-300'
        }`} />
      </div>
      <p className="text-center text-xs text-gray-500 mt-2">
        Daily progress: {(todayEntry?.afternoon_checkin ? 1 : 0) + (todayEntry?.evening_checkin ? 1 : 0)}/2 check-ins
      </p>
    </div>
  );
};