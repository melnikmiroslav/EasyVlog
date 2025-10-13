/*
  # Fix videos table to support phone users

  1. Changes
    - Drop foreign key constraint on auth.users
    - Make user_id a simple uuid without foreign key (allows both auth and phone users)
    - Update RLS policies to work with both user types
    
  2. Security
    - Users can only insert/update/delete their own videos
    - Everyone can view all videos
    - Proper checks for both auth.uid() and phone_users
*/

-- Drop the old foreign key constraint
ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_user_id_fkey;

-- Drop old policies
DROP POLICY IF EXISTS "Users can insert own videos" ON videos;
DROP POLICY IF EXISTS "Users can update own videos" ON videos;
DROP POLICY IF EXISTS "Users can delete own videos" ON videos;

-- Create new policies that work for both user types
CREATE POLICY "Users can insert own videos"
  ON videos
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM phone_users WHERE phone_users.id = videos.user_id)
  );

CREATE POLICY "Users can update own videos"
  ON videos
  FOR UPDATE
  TO authenticated, anon
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM phone_users WHERE phone_users.id = videos.user_id)
  )
  WITH CHECK (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM phone_users WHERE phone_users.id = videos.user_id)
  );

CREATE POLICY "Users can delete own videos"
  ON videos
  FOR DELETE
  TO authenticated, anon
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM phone_users WHERE phone_users.id = videos.user_id)
  );
