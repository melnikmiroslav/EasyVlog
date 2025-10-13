/*
  # Create comments table

  1. New Tables
    - `comments`
      - `id` (uuid, primary key) - Unique identifier for each comment
      - `video_id` (uuid, foreign key) - References the video being commented on
      - `user_id` (text) - ID of the user who created the comment (supports both email and phone users)
      - `content` (text) - The comment text content
      - `created_at` (timestamptz) - Timestamp when comment was created
      - `updated_at` (timestamptz) - Timestamp when comment was last updated
  
  2. Security
    - Enable RLS on `comments` table
    - Add policy for authenticated users to read all comments
    - Add policy for authenticated users to create their own comments
    - Add policy for users to update their own comments
    - Add policy for users to delete their own comments
  
  3. Indexes
    - Add index on `video_id` for faster comment retrieval by video
    - Add index on `user_id` for faster user comment lookups
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (authenticated or not) can read comments
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (true);

-- Policy: Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_updated_at_trigger
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();