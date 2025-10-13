import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './Comment.css';

interface CommentProps {
  comment: {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
  };
  currentUserId?: string;
  onDelete: (commentId: string) => void;
}

export default function Comment({ comment, currentUserId, onDelete }: CommentProps) {
  const [channelName, setChannelName] = useState<string>('User');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [comment.user_id]);

  const loadUserProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('channel_name, avatar_url')
      .eq('id', comment.user_id)
      .maybeSingle();

    if (data) {
      setChannelName(data.channel_name || 'User');
      setAvatarUrl(data.avatar_url);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить комментарий?')) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', comment.id);

    if (!error) {
      onDelete(comment.id);
    } else {
      setIsDeleting(false);
      alert('Ошибка при удалении комментария');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'только что';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин. назад`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч. назад`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} дн. назад`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} мес. назад`;
    return `${Math.floor(seconds / 31536000)} г. назад`;
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="comment">
      <div className="comment-avatar-container">
        {avatarUrl ? (
          <img src={avatarUrl} alt={channelName} className="comment-avatar" />
        ) : (
          <div className="comment-avatar-placeholder">
            {getInitials(channelName)}
          </div>
        )}
      </div>
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{channelName}</span>
          <span className="comment-date">{getTimeAgo(comment.created_at)}</span>
        </div>
        <p className="comment-text">{comment.content}</p>
        {currentUserId === comment.user_id && (
          <button
            className="comment-delete-btn"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            Удалить
          </button>
        )}
      </div>
    </div>
  );
}
