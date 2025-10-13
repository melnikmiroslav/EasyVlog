import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Comment from './Comment';
import CommentForm from './CommentForm';
import './CommentsList.css';

interface CommentData {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface CommentsListProps {
  videoId: string;
}

export default function CommentsList({ videoId }: CommentsListProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments(data);
    }

    setIsLoading(false);
  };

  const handleCommentAdded = () => {
    loadComments();
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments(comments.filter(c => c.id !== commentId));
  };

  return (
    <div className="comments-section">
      <h3 className="comments-title">
        {comments.length} {comments.length === 1 ? 'комментарий' : 'комментариев'}
      </h3>

      <CommentForm videoId={videoId} onCommentAdded={handleCommentAdded} />

      {isLoading ? (
        <div className="comments-loading">Загрузка комментариев...</div>
      ) : comments.length === 0 ? (
        <div className="comments-empty">Комментариев пока нет. Будьте первым!</div>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              onDelete={handleCommentDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
