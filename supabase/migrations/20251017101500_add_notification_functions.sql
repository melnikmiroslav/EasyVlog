/*
  # Add notification functions

  1. New Functions
    - `notify_new_video` - Sends notifications when a new video is uploaded
    - `notify_new_comment` - Sends notifications when a new comment is added

  2. Triggers
    - Trigger on videos insert to notify subscribers
    - Trigger on comments insert to notify video owner
*/

CREATE OR REPLACE FUNCTION notify_new_video()
RETURNS TRIGGER AS $$
DECLARE
  video_owner_id text;
  subscriber_id text;
BEGIN
  video_owner_id := NEW.user_id;

  FOR subscriber_id IN
    SELECT DISTINCT user_id FROM push_subscriptions
    WHERE user_id != video_owner_id
  LOOP
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'userId', subscriber_id,
        'title', 'Новое видео',
        'body', 'Загружено новое видео: ' || NEW.title,
        'url', '/watch/' || NEW.id,
        'tag', 'new-video-' || NEW.id
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  video_owner_id text;
  video_title text;
BEGIN
  SELECT user_id, title INTO video_owner_id, video_title
  FROM videos
  WHERE id = NEW.video_id;

  IF video_owner_id IS NOT NULL AND video_owner_id != NEW.user_id THEN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'userId', video_owner_id,
        'title', 'Новый комментарий',
        'body', 'Новый комментарий к видео: ' || video_title,
        'url', '/watch/' || NEW.video_id,
        'tag', 'new-comment-' || NEW.id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_notify_new_video'
  ) THEN
    CREATE TRIGGER trigger_notify_new_video
      AFTER INSERT ON videos
      FOR EACH ROW
      EXECUTE FUNCTION notify_new_video();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_notify_new_comment'
  ) THEN
    CREATE TRIGGER trigger_notify_new_comment
      AFTER INSERT ON comments
      FOR EACH ROW
      EXECUTE FUNCTION notify_new_comment();
  END IF;
END $$;
