import { useEffect, useCallback } from 'react';
import { NotificationService } from '../services/notificationService';

export const usePushNotifications = () => {
  useEffect(() => {
    // Request permissions on mount if not already granted
    NotificationService.requestPermissions();
  }, []);

  const scheduleAttendanceNotifications = useCallback(async (schedules: any[]) => {
    try {
      const hasPermission = await NotificationService.requestPermissions();
      if (hasPermission) {
        await NotificationService.scheduleAttendanceNotifications(schedules);
        console.log('Successfully scheduled attendance notifications');
      } else {
        console.warn('Notification permission not granted');
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }, []);

  return {
    scheduleAttendanceNotifications,
  };
};
