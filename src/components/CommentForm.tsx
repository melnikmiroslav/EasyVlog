import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './CommentForm.css';

interface CommentFormProps {
  videoId: string;
  onCommentAdded: () => void;
}

export default function CommentForm({ videoId, onCommentAdded }: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !content.trim()) return;

    setIsSubmitting(true);

    const { error } = await supabase
      .from('comments')
      .insert({
        video_id: videoId,
        user_id: user.id,
        content: content.trim()
      });

    if (!error) {
      setContent('');
      setIsFocused(false);
      onCommentAdded();
    } else {
      alert('Ошибка при добавлении комментария');
    }

    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setContent('');
    setIsFocused(false);
  };

  if (!user) {
    return null;
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        className="comment-input"
        placeholder="Добавьте комментарий..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => setIsFocused(true)}
        disabled={isSubmitting}
        rows={isFocused ? 3 : 1}
      />
      {isFocused && (
        <div className="comment-form-actions">
          <button
            type="button"
            className="comment-form-btn cancel"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="comment-form-btn submit"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      )}
    </form>
  );
}
