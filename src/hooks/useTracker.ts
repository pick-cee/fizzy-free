/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback, useRef } from 'react';
import { DayEntry, WeekData, MonthData, WeeklyReward } from '../types';
import { getToday, getWeekStart, getWeekEnd, getDaysInWeek, formatDate, getWeeksInMonth, getMonthName } from '../utils/dateUtils';
import { supabase } from '../lib/supabase';
import { getRewardForWeek } from '../utils/rewards';

export const useTracker = () => {
  const [entries, setEntries] = useState<DayEntry[]>([]);
  // FIX: Create a ref to hold the most current version of entries to solve stale state issues.
  const entriesRef = useRef(entries);
  // This effect ensures the ref is updated after every render.
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

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

    const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const entriesByDate = new Map(sortedEntries.map(e => [e.date, e]));

    let longest = 0;
    let tempStreak = 0;

    if (sortedEntries.length > 0) {
      const firstDate = new Date(sortedEntries[0].date);
      const today = new Date();
      for (let d = firstDate; d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = formatDate(d);
        const entry = entriesByDate.get(dateStr);

        if (entry && (entry.afternoon_checkin || entry.evening_checkin) && !entry.afternoon_had_drink && !entry.evening_had_drink) {
          tempStreak++;
        } else {
          longest = Math.max(longest, tempStreak);
          tempStreak = 0;
        }
      }
    }
    longest = Math.max(longest, tempStreak);
    setLongestStreak(longest);

    tempStreak = 0;
    const checkDate = new Date();

    for (let i = 0; i < 365 * 5; i++) {
      const dateStr = formatDate(checkDate);
      const entry = entriesByDate.get(dateStr);

      if (entry && (entry.afternoon_checkin || entry.evening_checkin) && !entry.afternoon_had_drink && !entry.evening_had_drink) {
        tempStreak++;
      } else {
        const isToday = dateStr === getToday();
        if (!isToday || (entry && (entry.afternoon_had_drink || entry.evening_had_drink))) {
          break;
        }
      }
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

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    if (!loading) {
      calculateStreaks();
    }
  }, [entries, loading, calculateStreaks]);

  const saveEntry = useCallback(async (entryToSave: DayEntry, currentEntries: DayEntry[]) => {
    try {
      await supabase
        .from('day_entries')
        .upsert({ ...entryToSave, updated_at: new Date().toISOString() }, { onConflict: 'date' })
        .select()
        .single();
    } catch (err) {
      console.error('Error saving entry:', err);
      setError("Could not save your last check-in. It's saved on this device but not in the cloud.");
    } finally {
      localStorage.setItem('fizzy-drink-tracker', JSON.stringify({ entries: currentEntries }));
    }
  }, []);

  const getTodayEntry = useCallback((): DayEntry | null => {
    const today = getToday();
    return entriesRef.current.find(entry => entry.date === today) || null;
  }, []);

  const checkIn = useCallback(async (period: 'afternoon' | 'evening', hadFizzyDrink: boolean) => {
    const today = getToday();
    const existingEntry = entriesRef.current.find(entry => entry.date === today);


    const updatedEntry: DayEntry = existingEntry ? { ...existingEntry } : {
      date: today, afternoon_checkin: false, evening_checkin: false,
      afternoon_had_drink: false, evening_had_drink: false
    };

    if (period === 'afternoon') {
      updatedEntry.afternoon_checkin = true;
      updatedEntry.afternoon_had_drink = hadFizzyDrink;
    } else {
      updatedEntry.evening_checkin = true;
      updatedEntry.evening_had_drink = hadFizzyDrink;
    }

    // Manually compute the next state array
    const existingIndex = entriesRef.current.findIndex(e => e.date === updatedEntry.date);
    let nextEntries;
    if (existingIndex > -1) {
      nextEntries = [...entriesRef.current];
      nextEntries[existingIndex] = updatedEntry;
    } else {
      nextEntries = [updatedEntry, ...entriesRef.current].sort((a, b) => b.date.localeCompare(a.date));
    }

    // Update the state AND the ref immediately before any async operations
    setEntries(nextEntries);
    entriesRef.current = nextEntries;

    await saveEntry(updatedEntry, nextEntries);
  }, [saveEntry]);

  const checkWeeklyReward = useCallback(async (weekData: WeekData) => {
    if (!weekData.isComplete || weekData.percentage < 70) return;
    const weekStart = weekData.weekStart;
    try {
      const { data: existingReward } = await supabase.from('weekly_rewards').select('id').eq('week_start', weekStart).single();
      if (!existingReward) {
        const { data: allEntries } = await supabase.from('day_entries').select('date').order('date', { ascending: true });
        const firstEntryDate = allEntries && allEntries.length > 0 ? new Date(allEntries[0].date) : new Date();
        const weekNumber = Math.floor((new Date(weekStart).getTime() - firstEntryDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
        const rewardTemplate = getRewardForWeek(weekNumber);
        await supabase.from('weekly_rewards').insert({
          week_start: weekStart, title: rewardTemplate.title, description: rewardTemplate.description,
          icon: rewardTemplate.icon, color: rewardTemplate.color, unlocked: true, unlocked_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error checking weekly reward:', err);
    }
  }, []);

  const getWeekData = useCallback(async (weekStart: Date): Promise<WeekData> => {
    // --- Start of new/updated getWeekData function ---

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // No changes to this part: handles future weeks correctly.
    if (weekStart > today) {
      const weekEnd = getWeekEnd(weekStart);
      const weekDays = getDaysInWeek(weekStart);
      const entries = weekDays.map(day => ({
        date: formatDate(day), afternoon_checkin: false, evening_checkin: false,
        afternoon_had_drink: false, evening_had_drink: false,
      }));
      return {
        weekStart: formatDate(weekStart), weekEnd: formatDate(weekEnd), entries,
        cleanDays: 0, totalCheckins: 0, missedCheckins: 0,
        totalExpectedCheckins: 0, percentage: 0, isComplete: false,
      };
    }

    const weekEnd = getWeekEnd(weekStart);
    const weekDays = getDaysInWeek(weekStart);

    // Memoize the first entry date to avoid re-calculating it in the loop.
    const sortedEntries = [...entriesRef.current].sort((a, b) => a.date.localeCompare(b.date));

    // FIX: Normalize first entry date for safe comparison.
    // We get the timestamp for the very beginning of the first day of tracking.
    const firstEverEntryTimestamp = sortedEntries.length > 0
      ? new Date(sortedEntries[0].date).setHours(0, 0, 0, 0)
      : null;

    let totalCompletedCheckins = 0;
    let cleanCheckins = 0;
    let totalExpectedCheckins = 0;
    let missedCheckins = 0;
    const now = new Date();

    const weekEntries = weekDays.map(day => {
      const dateStr = formatDate(day);
      const entryDate = new Date(dateStr);

      // FIX: Normalize the current day's date for safe comparison.
      const entryTimestamp = entryDate.setHours(0, 0, 0, 0);

      const entry = entriesRef.current.find(e => e.date === dateStr) || {
        date: dateStr, afternoon_checkin: false, evening_checkin: false,
        afternoon_had_drink: false, evening_had_drink: false,
      };

      // FIX: Skip calculations for any day before the user started tracking.
      // This check is now robust against timezone shifts.
      if (firstEverEntryTimestamp && entryTimestamp < firstEverEntryTimestamp) {
        return entry; // Return the blank entry but don't perform calculations.
      }

      const afternoonMissedTime = new Date(dateStr);
      afternoonMissedTime.setHours(16, 0, 0, 0); // 4:00 PM

      const eveningMissedTime = new Date(dateStr);
      eveningMissedTime.setHours(21, 45, 0, 0); // 9:45 PM

      // Afternoon Check-in Logic
      if (now > afternoonMissedTime) {
        totalExpectedCheckins++;
        if (entry.afternoon_checkin) {
          totalCompletedCheckins++;
          if (!entry.afternoon_had_drink) cleanCheckins++;
        } else {
          missedCheckins++;
        }
      }

      // Evening Check-in Logic
      if (now > eveningMissedTime) {
        totalExpectedCheckins++;
        if (entry.evening_checkin) {
          totalCompletedCheckins++;
          if (!entry.evening_had_drink) cleanCheckins++;
        } else {
          missedCheckins++;
        }
      }

      return entry;
    });

    const rawPercentage = totalExpectedCheckins > 0 ? (cleanCheckins / totalExpectedCheckins) * 100 : 0;
    const percentage = Math.max(0, Math.min(rawPercentage, 100));
    const isComplete = new Date() > weekEnd;

    const weekData: WeekData = {
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
      entries: weekEntries,
      cleanDays: cleanCheckins,
      totalCheckins: totalCompletedCheckins,
      missedCheckins,
      totalExpectedCheckins,
      percentage,
      isComplete,
    };

    await checkWeeklyReward(weekData);

    try {
      const { data: reward } = await supabase.from('weekly_rewards').select('*').eq('week_start', weekData.weekStart).single();
      if (reward) weekData.reward = reward;
    } catch (err) { /* No reward exists, which is fine */ }

    return weekData;

    // --- End of new/updated getWeekData function ---
  }, [checkWeeklyReward]);

  const getMonthData = useCallback(async (year: number, month: number): Promise<MonthData> => {
    const weeks = getWeeksInMonth(year, month);
    const weekDataArray = await Promise.all(weeks.map(week => getWeekData(week)));

    const totalCleanDays = weekDataArray.reduce((sum, week) => sum + week.cleanDays, 0);
    const totalCheckins = weekDataArray.reduce((sum, week) => sum + week.totalCheckins, 0);
    const totalMissedCheckins = weekDataArray.reduce((sum, week) => sum + week.missedCheckins, 0);
    const totalExpectedCheckinsInMonth = weekDataArray.reduce((sum, week) => sum + week.totalExpectedCheckins, 0);

    let bestWeek: WeekData | null = null;
    let trend: 'Improving' | 'Declining' | 'Steady' | 'N/A' = 'N/A';

    const relevantWeeks = weekDataArray.filter(w => w.totalExpectedCheckins > 0);

    if (relevantWeeks.length > 0) {
      bestWeek = relevantWeeks.reduce((best, current) =>
        (current.percentage > best.percentage ? current : best), relevantWeeks[0]);
    }

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

    return {
      month: getMonthName(month), year, cleanDays: totalCleanDays,
      totalCheckins, missedCheckins: totalMissedCheckins,
      percentage: totalExpectedCheckinsInMonth > 0 ? (totalCleanDays / totalExpectedCheckinsInMonth) * 100 : 0,
      weeks: weekDataArray, bestWeek, trend,
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
  }, [getWeekData]);

  return {
    entries, currentStreak, longestStreak, loading,
    error, getTodayEntry, checkIn,
    getCurrentWeekData, getCurrentMonthData, refreshData: loadEntries
  };
};