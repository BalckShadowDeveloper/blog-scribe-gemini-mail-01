
import { useState, useCallback } from 'react';

export const useRandomScheduling = () => {
  const [scheduledTimes, setScheduledTimes] = useState<number[]>([]);

  const generateRandomSchedule = useCallback(() => {
    // Generate 3-4 random times within an hour (in minutes)
    const numberOfEmails = Math.floor(Math.random() * 2) + 3; // 3 or 4 emails
    const times: number[] = [];
    
    for (let i = 0; i < numberOfEmails; i++) {
      // Random time between 5-55 minutes from now
      const randomMinutes = Math.floor(Math.random() * 50) + 5;
      times.push(randomMinutes * 60 * 1000); // Convert to milliseconds
    }
    
    // Sort times
    times.sort((a, b) => a - b);
    setScheduledTimes(times);
    
    console.log('Generated random schedule:', times.map(t => `${Math.floor(t / 60000)} minutes`));
    return times;
  }, []);

  const getNextScheduledTime = useCallback(() => {
    if (scheduledTimes.length === 0) return null;
    return scheduledTimes[0];
  }, [scheduledTimes]);

  const removeCompletedTime = useCallback(() => {
    setScheduledTimes(prev => prev.slice(1));
  }, []);

  const clearSchedule = useCallback(() => {
    setScheduledTimes([]);
  }, []);

  return {
    generateRandomSchedule,
    getNextScheduledTime,
    removeCompletedTime,
    clearSchedule,
    scheduledTimes
  };
};
