// Desktop Notification Utility Functions

export type NotificationPermission = 'granted' | 'denied' | 'default';

/**
 * Request permission to show desktop notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Check if notifications are supported and permitted
 */
export function canShowNotifications(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission as NotificationPermission;
}

export interface EmailNotificationOptions {
  from: string;
  subject: string;
  snippet?: string;
  icon?: string;
  tag?: string;
  silent?: boolean;
  onClick?: () => void;
}

/**
 * Show a desktop notification for a new email
 */
export function showEmailNotification(options: EmailNotificationOptions): Notification | null {
  if (!canShowNotifications()) {
    console.warn('Cannot show notification: permission not granted or not supported');
    return null;
  }

  const { from, subject, snippet, icon, tag, silent = false, onClick } = options;

  const title = `New email from ${from}`;
  const body = subject + (snippet ? `\n${snippet}` : '');

  const notification = new Notification(title, {
    body,
    icon: icon || '/icon.png',
    badge: '/icon.png',
    tag: tag || `email-${Date.now()}`,
    silent,
    requireInteraction: false,
  });

  // Handle click event
  if (onClick) {
    notification.onclick = () => {
      onClick();
      notification.close();
    };
  } else {
    // Default: focus window when clicked
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  // Auto-close after 10 seconds
  setTimeout(() => {
    notification.close();
  }, 10000);

  return notification;
}

/**
 * Show a notification for multiple new emails
 */
export function showBulkEmailNotification(count: number, onClick?: () => void): Notification | null {
  if (!canShowNotifications()) {
    return null;
  }

  const notification = new Notification(`${count} new emails`, {
    body: 'Click to view your inbox',
    icon: '/icon.png',
    badge: '/icon.png',
    tag: 'bulk-email-notification',
    silent: false,
    requireInteraction: false,
  });

  notification.onclick = () => {
    if (onClick) {
      onClick();
    } else {
      window.focus();
    }
    notification.close();
  };

  setTimeout(() => {
    notification.close();
  }, 10000);

  return notification;
}

/**
 * Play notification sound (optional)
 */
export function playNotificationSound(volume: number = 0.5): void {
  try {
    // Create an audio context if needed
    const audio = new Audio('/notification.mp3');
    audio.volume = volume;
    audio.play().catch(error => {
      console.warn('Could not play notification sound:', error);
    });
  } catch (error) {
    console.warn('Audio playback not supported:', error);
  }
}

/**
 * Store notification preferences in localStorage
 */
export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  soundVolume: number;
  showPreview: boolean;
  silent: boolean;
}

const PREFS_KEY = 'notification-preferences';

export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Failed to save notification preferences:', error);
  }
}

export function loadNotificationPreferences(): NotificationPreferences {
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load notification preferences:', error);
  }

  // Default preferences
  return {
    enabled: true,
    sound: true,
    soundVolume: 0.5,
    showPreview: true,
    silent: false,
  };
}
