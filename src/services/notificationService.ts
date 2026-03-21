import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions() {
    if (Platform.OS === 'web') return false;
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  }

  static async scheduleAttendanceNotifications(schedules: any[]) {
    // Cancel all existing scheduled notifications to avoid duplicates/stale data
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = new Date();

    for (const schedule of schedules) {
      const startTimeStr = schedule.class_start_time || schedule.start_time;
      const endTimeStr = schedule.class_end_time || schedule.end_time;
      const courseCode = schedule.course_code || schedule.course_id || 'Class';

      if (!startTimeStr || !endTimeStr) continue;

      const startTime = new Date(startTimeStr);
      const endTime = new Date(endTimeStr);

      // 1. Attendance Open Notification
      if (startTime > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Attendance Open!',
            body: `Attendance is now open for ${courseCode}. Mark it now!`,
            data: { scheduleId: schedule.id, type: 'open' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: startTime,
          },
        });
      }

      // 2. Attendance Closing Soon Notification (2 minutes before end)
      const closingSoonTime = new Date(endTime.getTime() - 2 * 60 * 1000);
      if (closingSoonTime > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Attendance Closing Soon!',
            body: `Attendance for ${courseCode} closes in 2 minutes!`,
            data: { scheduleId: schedule.id, type: 'closing' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: closingSoonTime,
          },
        });
      }
    }
  }
}
