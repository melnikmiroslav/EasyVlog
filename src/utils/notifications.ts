export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const NotificationAPI = window.Notification;

    if (!NotificationAPI) {
      return false;
    }

    if (NotificationAPI.permission === 'granted') {
      return true;
    }

    if (NotificationAPI.permission !== 'denied') {
      const permission = await NotificationAPI.requestPermission();
      return permission === 'granted';
    }

    return false;
  } catch (error) {
    console.error('Notification permission error:', error);
    return false;
  }
};

export const subscribeToPushNotifications = async (
  supabase: any,
  userId: string
): Promise<PushSubscription | null> => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return null;
    }

    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
      )
    });

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        subscription: subscription.toJSON()
      });

    if (error) {
      console.error('Failed to save subscription:', error);
      await subscription.unsubscribe();
      return null;
    }

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
};

export const unsubscribeFromPushNotifications = async (
  supabase: any,
  userId: string
): Promise<boolean> => {
  try {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);

      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
};

export const showLocalNotification = (title: string, options?: NotificationOptions) => {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    const NotificationAPI = window.Notification;

    if (NotificationAPI && NotificationAPI.permission === 'granted') {
      new NotificationAPI(title, {
        icon: '/icon-192.png',
        badge: '/icon-96.png',
        ...options
      });
    }
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
