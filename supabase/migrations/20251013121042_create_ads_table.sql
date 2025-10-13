/*
  # Create ads table for video advertising

  1. New Tables
    - `ads`
      - `id` (uuid, primary key) - Unique identifier for the ad
      - `video_id` (uuid, foreign key) - Reference to the video this ad belongs to
      - `title` (text) - Title/name of the ad
      - `description` (text) - Ad description/content
      - `image_url` (text) - URL to the ad image/banner
      - `link_url` (text, optional) - Click-through URL for the ad
      - `show_at_seconds` (integer) - Time in seconds when ad should appear
      - `duration_seconds` (integer) - How long the ad should stay visible
      - `is_active` (boolean) - Whether the ad is currently active
      - `created_at` (timestamptz) - When the ad was created
      - `updated_at` (timestamptz) - When the ad was last updated

  2. Security
    - Enable RLS on `ads` table
    - Add policy for anyone to view active ads for videos
    - Add policy for video owners to manage their ads (create, update, delete)
    - Add policy for video owners to view all their ads (including inactive)

  3. Indexes
    - Index on video_id for faster lookups
    - Index on show_at_seconds for efficient time-based queries
*/

CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  image_url text NOT NULL,
  link_url text,
  show_at_seconds integer NOT NULL CHECK (show_at_seconds >= 0),
  duration_seconds integer NOT NULL DEFAULT 5 CHECK (duration_seconds > 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ads_video_id ON ads(video_id);
CREATE INDEX IF NOT EXISTS idx_ads_show_time ON ads(show_at_seconds);

CREATE POLICY "Anyone can view active ads"
  ON ads FOR SELECT
  USING (is_active = true);

CREATE POLICY "Video owners can view all their ads"
  ON ads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = ads.video_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Video owners can create ads for their videos"
  ON ads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = ads.video_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Video owners can update their ads"
  ON ads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = ads.video_id
      AND videos.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = ads.video_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Video owners can delete their ads"
  ON ads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = ads.video_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION update_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ads_updated_at_trigger
  BEFORE UPDATE ON ads
  FOR EACH ROW
  EXECUTE FUNCTION update_ads_updated_at();