/*
  # Create increment views function

  1. New Functions
    - `increment_video_views` - Safely increments the view count for a video
      - Takes video_id as parameter
      - Increments views column by 1
      - Prevents race conditions using atomic update
  
  2. Security
    - Function is accessible to all users (public)
    - Uses safe atomic increment operation
*/

CREATE OR REPLACE FUNCTION increment_video_views(video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE videos
  SET views = views + 1
  WHERE id = video_id;
END;
$$;
