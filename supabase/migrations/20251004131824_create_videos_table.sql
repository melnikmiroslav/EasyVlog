/*
  # Create videos table for user uploads

  1. New Tables
    - `videos`
      - `id` (uuid, primary key) - Unique identifier for each video
      - `user_id` (uuid, foreign key) - References auth.users
      - `title` (text) - Video title
      - `description` (text) - Video description
      - `video_url` (text) - URL to the video
      - `thumbnail_url` (text) - URL to the thumbnail image
      - `views` (integer) - Number of views, defaults to 0
      - `created_at` (timestamptz) - When the video was uploaded
      - `updated_at` (timestamptz) - When the video was last updated

  2. Security
    - Enable RLS on `videos` table
    - Add policy for authenticated users to read all videos
    - Add policy for users to insert their own videos
    - Add policy for users to update their own videos
    - Add policy for users to delete their own videos
*/

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  video_url text NOT NULL,
  thumbnail_url text NOT NULL,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view videos"
  ON videos
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own videos"
  ON videos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos"
  ON videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos"
  ON videos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS videos_user_id_idx ON videos(user_id);
CREATE INDEX IF NOT EXISTS videos_created_at_idx ON videos(created_at DESC);