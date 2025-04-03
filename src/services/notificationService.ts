import { supabase } from "@/integrations/supabase/client";
import { MeditationReminderSettings } from "@/types/meditation";

// Types for notifications
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedItemId?: string;
  relatedItemType?: string;
  createdAt: string;
  scheduledFor?: string;
}

export type NotificationType = 
  | "meditation_reminder"
  | "program_reminder"
  | "mood_reminder"
  | "streak_milestone"
  | "achievement"
  | "system_message";

interface ReminderSchedule {
  userId: string;
  type: string;
  frequency: "daily" | "weekly" | "custom";
  customDays?: number[]; // 0-6 representing Sunday-Saturday
  time: string; // HH:MM format
  enabled: boolean;
  data?: Record<string, any>;
}

/**
 * Fetches all notifications for a user
 */
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Transform from snake_case to camelCase
    return (data || []).map(notification => ({
      id: notification.id,
      userId: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type as NotificationType,
      isRead: notification.is_read,
      relatedItemId: notification.related_item_id,
      relatedItemType: notification.related_item_type,
      createdAt: notification.created_at,
      scheduledFor: notification.scheduled_for
    }));
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

/**
 * Marks a notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

/**
 * Marks all notifications for a user as read
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};

/**
 * Creates a new notification
 */
export const createNotification = async (notification: Omit<Notification, "id" | "createdAt">): Promise<string | null> => {
  try {
    const notificationData = {
      user_id: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      is_read: notification.isRead,
      related_item_id: notification.relatedItemId,
      related_item_type: notification.relatedItemType,
      scheduled_for: notification.scheduledFor
    };

    const { data, error } = await supabase
      .from("notifications")
      .insert(notificationData)
      .select("id");

    if (error) {
      throw error;
    }

    return data && data[0] ? data[0].id : null;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

/**
 * Sets up a meditation reminder schedule for a user
 */
export const setupMeditationReminders = async (
  userId: string, 
  settings: MeditationReminderSettings
): Promise<boolean> => {
  try {
    // First, delete any existing meditation reminders for this user
    await supabase
      .from("reminder_schedules")
      .delete()
      .eq("user_id", userId)
      .eq("type", "meditation_reminder");

    if (!settings.enabled) {
      // If reminders are disabled, just delete and return
      return true;
    }

    // Create new reminder schedule
    const reminderData: ReminderSchedule = {
      userId: userId,
      type: "meditation_reminder",
      frequency: settings.frequency,
      customDays: settings.customDays,
      time: settings.time,
      enabled: true,
      data: {
        message: settings.customMessage || "Time for your daily meditation practice!",
        notificationType: settings.notification || "app"
      }
    };

    const { error } = await supabase
      .from("reminder_schedules")
      .insert({
        user_id: reminderData.userId,
        type: reminderData.type,
        frequency: reminderData.frequency,
        custom_days: reminderData.customDays,
        time: reminderData.time,
        enabled: reminderData.enabled,
        data: reminderData.data
      });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error setting up meditation reminders:", error);
    return false;
  }
};

/**
 * Creates a one-time reminder for a specific meditation or program
 */
export const createMeditationReminder = async (
  userId: string,
  title: string,
  message: string,
  scheduledFor: string,
  meditationId?: string,
  programId?: string
): Promise<string | null> => {
  try {
    const notificationData = {
      userId,
      title,
      message,
      type: "meditation_reminder" as NotificationType,
      isRead: false,
      relatedItemId: meditationId || programId,
      relatedItemType: meditationId ? "meditation" : "program",
      scheduledFor
    };

    return await createNotification(notificationData);
  } catch (error) {
    console.error("Error creating meditation reminder:", error);
    return null;
  }
};

/**
 * Creates a reminder for a mood check-in
 */
export const createMoodCheckInReminder = async (
  userId: string,
  scheduledFor: string
): Promise<string | null> => {
  try {
    const notificationData = {
      userId,
      title: "Mood Check-In",
      message: "How are you feeling today? Take a moment to track your mood.",
      type: "mood_reminder" as NotificationType,
      isRead: false,
      scheduledFor
    };

    return await createNotification(notificationData);
  } catch (error) {
    console.error("Error creating mood check-in reminder:", error);
    return null;
  }
};

/**
 * Sets up daily mood tracking reminders
 */
export const setupMoodTrackingReminders = async (
  userId: string,
  enabled: boolean,
  time: string = "20:00", // Default to 8:00 PM
  frequency: "daily" | "twice_daily" = "daily"
): Promise<boolean> => {
  try {
    // First, delete any existing mood tracking reminders for this user
    await supabase
      .from("reminder_schedules")
      .delete()
      .eq("user_id", userId)
      .eq("type", "mood_reminder");

    if (!enabled) {
      // If reminders are disabled, just delete and return
      return true;
    }

    // Create new reminder schedule
    const reminderData: ReminderSchedule = {
      userId: userId,
      type: "mood_reminder",
      frequency: "daily", // Mood tracking is always daily
      time: time,
      enabled: true,
      data: {
        message: "Time to check in with your mood!",
        frequency: frequency // Store actual frequency in data
      }
    };

    const { error } = await supabase
      .from("reminder_schedules")
      .insert({
        user_id: reminderData.userId,
        type: reminderData.type,
        frequency: reminderData.frequency,
        time: reminderData.time,
        enabled: reminderData.enabled,
        data: reminderData.data
      });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error setting up mood tracking reminders:", error);
    return false;
  }
};

/**
 * Creates a notification for a streak milestone
 */
export const createStreakMilestoneNotification = async (
  userId: string,
  streakDays: number
): Promise<string | null> => {
  try {
    const milestones = [3, 7, 14, 21, 30, 60, 90, 180, 365];
    if (!milestones.includes(streakDays)) {
      return null; // Not a milestone we want to celebrate
    }

    let message = "";
    if (streakDays === 3) {
      message = "You've meditated for 3 days in a row! Keep up the momentum!";
    } else if (streakDays === 7) {
      message = "One week meditation streak achieved! You're building a great habit!";
    } else if (streakDays === 14) {
      message = "Two weeks of consistent meditation! Your mind is thanking you!";
    } else if (streakDays === 21) {
      message = "21 days - You've formed a meditation habit! This is a significant milestone!";
    } else if (streakDays === 30) {
      message = "30 day meditation streak! A full month of mindfulness!";
    } else if (streakDays === 60) {
      message = "60 days of meditation! Your consistency is truly impressive!";
    } else if (streakDays === 90) {
      message = "90 day streak! You've maintained your practice for a full season!";
    } else if (streakDays === 180) {
      message = "Half a year of daily meditation! You're a mindfulness warrior!";
    } else if (streakDays === 365) {
      message = "ONE YEAR STREAK! You've meditated every day for a year! Incredible achievement!";
    }

    const notificationData = {
      userId,
      title: `${streakDays} Day Streak!`,
      message,
      type: "streak_milestone" as NotificationType,
      isRead: false
    };

    return await createNotification(notificationData);
  } catch (error) {
    console.error("Error creating streak milestone notification:", error);
    return null;
  }
};

/**
 * Handles achievement unlocks and creates notifications
 */
export const createAchievementNotification = async (
  userId: string,
  achievementId: string,
  achievementName: string,
  description: string
): Promise<string | null> => {
  try {
    const notificationData = {
      userId,
      title: `Achievement Unlocked: ${achievementName}`,
      message: description,
      type: "achievement" as NotificationType,
      isRead: false,
      relatedItemId: achievementId,
      relatedItemType: "achievement"
    };

    return await createNotification(notificationData);
  } catch (error) {
    console.error("Error creating achievement notification:", error);
    return null;
  }
};

/**
 * Process due reminders and create notifications (would be called by a scheduled job)
 */
export const processDueReminders = async (): Promise<number> => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    const currentDay = now.getDay(); // 0-6, where 0 is Sunday

    // Get all enabled reminders scheduled for the current time
    const { data: reminders, error } = await supabase
      .from("reminder_schedules")
      .select("*")
      .eq("enabled", true)
      .eq("time", currentTime);

    if (error) {
      throw error;
    }

    if (!reminders || reminders.length === 0) {
      return 0;
    }

    let notificationsCreated = 0;

    // Process each reminder
    for (const reminder of reminders) {
      // Check frequency
      if (reminder.frequency === "daily" || 
          (reminder.frequency === "weekly" && reminder.day_of_week === currentDay) ||
          (reminder.frequency === "custom" && reminder.custom_days && reminder.custom_days.includes(currentDay))) {
        
        // Create notification based on reminder type
        const userId = reminder.user_id;
        const data = reminder.data || {};
        
        if (reminder.type === "meditation_reminder") {
          await createNotification({
            userId,
            title: "Meditation Reminder",
            message: data.message || "Time for your meditation practice!",
            type: "meditation_reminder",
            isRead: false
          });
          notificationsCreated++;
        } 
        else if (reminder.type === "mood_reminder") {
          await createNotification({
            userId,
            title: "Mood Check-In",
            message: data.message || "How are you feeling right now?",
            type: "mood_reminder",
            isRead: false
          });
          notificationsCreated++;
        }
        else if (reminder.type === "program_reminder") {
          await createNotification({
            userId,
            title: data.title || "Program Reminder",
            message: data.message || "Continue your meditation program",
            type: "program_reminder",
            isRead: false,
            relatedItemId: data.programId,
            relatedItemType: "program"
          });
          notificationsCreated++;
        }
      }
    }

    return notificationsCreated;
  } catch (error) {
    console.error("Error processing due reminders:", error);
    return 0;
  }
}; 