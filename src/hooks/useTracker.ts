/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { DayEntry, WeekData, MonthData, WeeklyReward } from '../types';
import { getToday, getWeekStart, getWeekEnd, getDaysInWeek, formatDate, getWeeksInMonth, getMonthName } from '../utils/dateUtils';
import { supabase } from '../lib/supabase';
import { getRewardForWeek } from '../utils/rewards';

export const useTracker = () => {
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStreaks = useCallback(() => {
    if (entries.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }

    // Sort entries chronologically to ensure correct streak calculation.
    const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    // Use a Map for efficient O(1) average lookup of entries by date.
    const entriesByDate = new Map(sortedEntries.map(e => [e.date, e]));

    let longest = 0;
    let tempStreak = 0;

    // --- Calculate Longest Streak ---
    // To find the longest streak ever, we iterate through all days from the very
    // first entry to today. This ensures all historical data is considered.
    if (sortedEntries.length > 0) {
      const firstDate = new Date(sortedEntries[0].date);
      const today = new Date();
      // Loop day-by-day from the start date.
      for (let d = firstDate; d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = formatDate(d);
        const entry = entriesByDate.get(dateStr);

        // A day is "clean" if an entry exists, at least one check-in was made,
        // and no drinks were recorded for either check-in.
        if (entry && (entry.afternoon_checkin || entry.evening_checkin) && !entry.afternoon_had_drink && !entry.evening_had_drink) {
          tempStreak++;
        } else {
          // If the day is not clean, the streak is broken.
          // Update the longest streak found so far and reset the temporary counter.
          longest = Math.max(longest, tempStreak);
          tempStreak = 0;
        }
      }
    }
    // Final check in case the streak extends to the very last day.
    longest = Math.max(longest, tempStreak);
    setLongestStreak(longest);


    // --- Calculate Current Streak ---
    // To find the current streak, we iterate backwards from today.
    tempStreak = 0; // reset for current streak calculation
    const checkDate = new Date();

    // Check up to 5 years back, which is a reasonable limit.
    for (let i = 0; i < 365 * 5; i++) { // Check up to 5 years back
      const dateStr = formatDate(checkDate);
      const entry = entriesByDate.get(dateStr);

      // Check if the day was clean.
      if (entry && (entry.afternoon_checkin || entry.evening_checkin) && !entry.afternoon_had_drink && !entry.evening_had_drink) {
        tempStreak++;
      } else {
        // The streak is broken if there's a record of a drink, or if an entry is
        // missing for a day that is *not* today. A missing entry for today doesn't
        // break the streak yet, as the user can still check in.
        const isToday = dateStr === getToday();
        if (!isToday || (entry && (entry.afternoon_had_drink || entry.evening_had_drink))) {
          break; // Exit the loop as the current streak has ended.
        }
      }
      // Move to the previous day for the next iteration.
      checkDate.setDate(checkDate.getDate() - 1);
    }
    setCurrentStreak(tempStreak);

  }, [entries]);


  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('day_entries')
        .select('*')
        .order('date', { ascending: false });

      if (supabaseError) throw supabaseError;

      setEntries(data || []);
      localStorage.setItem('fizzy-drink-tracker', JSON.stringify({ entries: data || [] }));

    } catch (err: any) {
      console.error('Error loading entries:', err);
      setError('Failed to load your progress. Please check your connection or Supabase credentials.');

      const savedData = localStorage.getItem('fizzy-drink-tracker');
      if (savedData) {
        setEntries(JSON.parse(savedData).entries || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data from Supabase on mount
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Calculate streaks whenever entries change
  useEffect(() => {
    if (!loading) {
      calculateStreaks();
    }
  }, [entries, loading, calculateStreaks]);

  const saveEntry = useCallback(async (entry: DayEntry) => {
    try {
      // Optimistic UI update
      setEntries(prev => {
        const existing = prev.find(e => e.date === entry.date);
        if (existing) {
          return prev.map(e => e.date === entry.date ? entry : e);
        } else {
          return [entry, ...prev].sort((a, b) => b.date.localeCompare(a.date));
        }
      });

      const { data, error } = await supabase
        .from('day_entries')
        .upsert({ ...entry, updated_at: new Date().toISOString() }, { onConflict: 'date' })
        .select()
        .single();

      if (error) throw error;

      // Update state with confirmed data from Supabase
      setEntries(prev => {
        const updatedEntries = prev.map(e => (e.date === data.date ? data : e));
        if (!prev.some(e => e.date === data.date)) {
          updatedEntries.push(data);
        }
        return updatedEntries.sort((a, b) => b.date.localeCompare(a.date));
      });

    } catch (err) {
      console.error('Error saving entry:', err);
      setError("Could not save your last check-in. It's saved on this device but not in the cloud.");
      // The optimistic update is already saved to local state
    } finally {
      // Save to localStorage as a backup
      localStorage.setItem('fizzy-drink-tracker', JSON.stringify({ entries }));
    }
  }, [entries]);

  const getTodayEntry = useCallback((): DayEntry | null => {
    const today = getToday();
    return entries.find(entry => entry.date === today) || null;
  }, [entries]);

  const checkIn = useCallback(async (period: 'afternoon' | 'evening', hadFizzyDrink: boolean) => {
    const today = getToday();
    const existingEntry = entries.find(entry => entry.date === today);

    const updatedEntry: DayEntry = existingEntry ? { ...existingEntry } : {
      date: today,
      afternoon_checkin: false,
      evening_checkin: false,
      afternoon_had_drink: false,
      evening_had_drink: false
    };

    if (period === 'afternoon') {
      updatedEntry.afternoon_checkin = true;
      updatedEntry.afternoon_had_drink = hadFizzyDrink;
    } else {
      updatedEntry.evening_checkin = true;
      updatedEntry.evening_had_drink = hadFizzyDrink;
    }

    await saveEntry(updatedEntry);
  }, [entries, saveEntry]);

  const checkWeeklyReward = useCallback(async (weekData: WeekData) => {
    if (!weekData.isComplete || weekData.percentage < 70) return;

    const weekStart = weekData.weekStart;

    try {
      const { data: existingReward } = await supabase
        .from('weekly_rewards')
        .select('id')
        .eq('week_start', weekStart)
        .single();

      if (!existingReward) {
        const allEntries = await supabase.from('day_entries').select('date');
        const firstEntryDate = allEntries.data ? new Date(allEntries.data[0].date) : new Date();
        const weekNumber = Math.floor((new Date(weekStart).getTime() - firstEntryDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
        const rewardTemplate = getRewardForWeek(weekNumber);

        await supabase.from('weekly_rewards').insert({
          week_start: weekStart,
          title: rewardTemplate.title,
          description: rewardTemplate.description,
          icon: rewardTemplate.icon,
          color: rewardTemplate.color,
          unlocked: true,
          unlocked_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error checking weekly reward:', err);
    }
  }, []);

  const getWeekData = useCallback(async (weekStart: Date): Promise<WeekData> => {
    const weekEnd = getWeekEnd(weekStart);
    const weekDays = getDaysInWeek(weekStart);

    const weekEntries = weekDays.map(day => {
      const dateStr = formatDate(day);
      return entries.find(e => e.date === dateStr) || {
        date: dateStr,
        afternoon_checkin: false, evening_checkin: false,
        afternoon_had_drink: false, evening_had_drink: false,
      };
    });

    const totalCompletedCheckins = weekEntries.reduce((sum, entry) => sum + (entry.afternoon_checkin ? 1 : 0) + (entry.evening_checkin ? 1 : 0), 0);
    const cleanCheckins = weekEntries.reduce((sum, entry) => {
      let clean = 0;
      if (entry.afternoon_checkin && !entry.afternoon_had_drink) clean++;
      if (entry.evening_checkin && !entry.evening_had_drink) clean++;
      return sum + clean;
    }, 0);

    const now = new Date();
    let totalExpectedCheckins = 0;
    let missedCheckins = 0;

    const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const firstEverEntryDate = sortedEntries.length > 0 ? new Date(sortedEntries[0].date) : null;

    weekEntries.forEach(entry => {
      const entryDate = new Date(entry.date);

      if (firstEverEntryDate && entryDate < firstEverEntryDate) {
        return;
      }

      const afternoonMissedTime = new Date(entry.date);
      afternoonMissedTime.setHours(16, 0, 0, 0);

      const eveningMissedTime = new Date(entry.date);
      eveningMissedTime.setHours(21, 45, 0, 0);

      if (now > afternoonMissedTime) {
        totalExpectedCheckins++;
        if (!entry.afternoon_checkin) {
          missedCheckins++;
        }
      }
      if (now > eveningMissedTime) {
        totalExpectedCheckins++;
        if (!entry.evening_checkin) {
          missedCheckins++;
        }
      }
    });

    const percentage = totalExpectedCheckins > 0 ? (cleanCheckins / totalExpectedCheckins) * 100 : 0;
    const isComplete = new Date() > weekEnd;

    const weekData: WeekData = {
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
      entries: weekEntries,
      cleanDays: cleanCheckins,
      totalCheckins: totalCompletedCheckins,
      missedCheckins: missedCheckins,
      totalExpectedCheckins: totalExpectedCheckins, // Pass this new property
      percentage: percentage,
      isComplete,
    };

    await checkWeeklyReward(weekData);

    try {
      const { data: reward } = await supabase.from('weekly_rewards').select('*').eq('week_start', weekData.weekStart).single();
      if (reward) weekData.reward = reward;
    } catch (err) { /* No reward exists */ }

    return weekData;
  }, [entries, checkWeeklyReward]);

  const getMonthData = useCallback(async (year: number, month: number): Promise<MonthData> => {
    const weeks = getWeeksInMonth(year, month);
    const weekDataArray = await Promise.all(weeks.map(week => getWeekData(week)));

    const totalCleanDays = weekDataArray.reduce((sum, week) => sum + week.cleanDays, 0);
    const totalCheckins = weekDataArray.reduce((sum, week) => sum + week.totalCheckins, 0);
    const totalMissedCheckins = weekDataArray.reduce((sum, week) => sum + week.missedCheckins, 0);

    // FIX: Use the already calculated (and correct) value from each week.
    const totalExpectedCheckinsInMonth = weekDataArray.reduce((sum, week) => sum + week.totalExpectedCheckins, 0);

    let bestWeek: WeekData | null = null;
    if (weekDataArray.length > 0) {
      const relevantWeeks = weekDataArray.filter(w => w.totalExpectedCheckins > 0);
      if (relevantWeeks.length > 0) {
        bestWeek = relevantWeeks.reduce((best, current) =>
          (current.percentage > best.percentage ? current : best), relevantWeeks[0]);
      }
    }

    let trend: 'Improving' | 'Declining' | 'Steady' | 'N/A' = 'N/A';
    if (weekDataArray.length >= 2) {
      const relevantWeeks = weekDataArray.filter(w => w.totalExpectedCheckins > 0);
      if (relevantWeeks.length >= 2) {
        const firstHalfWeeks = relevantWeeks.slice(0, Math.ceil(relevantWeeks.length / 2));
        const secondHalfWeeks = relevantWeeks.slice(Math.ceil(relevantWeeks.length / 2));

        if (secondHalfWeeks.length > 0) {
          const firstHalfAvg = firstHalfWeeks.reduce((sum, week) => sum + week.percentage, 0) / firstHalfWeeks.length;
          const secondHalfAvg = secondHalfWeeks.reduce((sum, week) => sum + week.percentage, 0) / secondHalfWeeks.length;

          if (secondHalfAvg > firstHalfAvg + 5) {
            trend = 'Improving';
          } else if (secondHalfAvg < firstHalfAvg - 5) {
            trend = 'Declining';
          } else {
            trend = 'Steady';
          }
        }
      }
    }

    return {
      month: getMonthName(month),
      year,
      cleanDays: totalCleanDays,
      totalCheckins,
      missedCheckins: totalMissedCheckins,
      percentage: totalExpectedCheckinsInMonth > 0 ? (totalCleanDays / totalExpectedCheckinsInMonth) * 100 : 0,
      weeks: weekDataArray,
      bestWeek,
      trend,
    };
  }, [getWeekData]);

  const getCurrentWeekData = useCallback(async (): Promise<WeekData> => {
    const today = new Date();
    const weekStart = getWeekStart(today);
    return await getWeekData(weekStart);
  }, [getWeekData]);

  const getCurrentMonthData = useCallback(async (): Promise<MonthData> => {
    const today = new Date();
    return await getMonthData(today.getFullYear(), today.getMonth());
  }, [getMonthData]);

  return {
    entries,
    currentStreak,
    longestStreak,
    loading,
    error,
    getTodayEntry,
    checkIn,
    getCurrentWeekData,
    getCurrentMonthData,
    refreshData: loadEntries
  };
};