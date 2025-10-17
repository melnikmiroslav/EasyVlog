import { useState, useEffect } from 'react';
import { requestNotificationPermission, subscribeToPushNotifications } from '../utils/notifications';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import './NotificationPrompt.css';

export default function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { user, phoneUser } = useAuth();
  const currentUserId = user?.id || phoneUser?.id;

  useEffect(() => {
    try {
      const hasSeenPrompt = localStorage.getItem('notification-prompt-seen');

      if (typeof window === 'undefined' || !('Notification' in window)) {
        return;
      }

      const NotificationAPI = window.Notification;

      if (!hasSeenPrompt && NotificationAPI && NotificationAPI.permission === 'default' && currentUserId) {
        const timer = setTimeout(() => {
          setShow(true);
        }, 3000);

        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('Error checking notification permission:', error);
    }
  }, [currentUserId]);

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();

    if (granted && currentUserId) {
      await subscribeToPushNotifications(supabase, currentUserId);
      localStorage.setItem('notification-prompt-seen', 'true');
      setShow(false);
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notification-prompt-seen', 'true');
    setShow(false);
    setDismissed(true);
  };

  if (!show || dismissed) {
    return null;
  }

  return (
    <div className="notification-prompt">
      <div className="notification-prompt-content">
        <div className="notification-prompt-icon">🔔</div>
        <div className="notification-prompt-text">
          <h3>Включить уведомления?</h3>
          <p>Получайте уведомления о новых видео и комментариях</p>
        </div>
        <div className="notification-prompt-actions">
          <button className="notification-prompt-btn primary" onClick={handleEnable}>
            Включить
          </button>
          <button className="notification-prompt-btn secondary" onClick={handleDismiss}>
            Не сейчас
          </button>
        </div>
      </div>
    </div>
  );
}
