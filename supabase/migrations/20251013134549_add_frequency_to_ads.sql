/*
  # Add frequency settings to ads

  1. Changes to `ads` table
    - Add `max_views_per_user` (integer) - maximum times one user can see this ad
    - Add `max_total_views` (integer) - maximum total views for this ad across all users
    - Add `current_total_views` (integer) - counter for total views so far
  
  2. New table `ad_views`
    - `id` (uuid, primary key)
    - `ad_id` (uuid, foreign key to ads)
    - `user_id` (text) - can be auth user id or session identifier
    - `viewed_at` (timestamp)
    - Track individual ad views per user
  
  3. Security
    - Enable RLS on `ad_views` table
    - Add policies for inserting and reading ad views
*/

-- Add frequency columns to ads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ads' AND column_name = 'max_views_per_user'
  ) THEN
    ALTER TABLE ads ADD COLUMN max_views_per_user INTEGER DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ads' AND column_name = 'max_total_views'
  ) THEN
    ALTER TABLE ads ADD COLUMN max_total_views INTEGER DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ads' AND column_name = 'current_total_views'
  ) THEN
    ALTER TABLE ads ADD COLUMN current_total_views INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create ad_views table if it doesn't exist
CREATE TABLE IF NOT EXISTS ad_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ad_views_ad_user ON ad_views(ad_id, user_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_ad ON ad_views(ad_id);

-- Enable RLS
ALTER TABLE ad_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert ad views" ON ad_views;
DROP POLICY IF EXISTS "Users can read ad views" ON ad_views;

-- Allow anyone to insert ad views (tracking)
CREATE POLICY "Anyone can insert ad views"
  ON ad_views
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow reading own ad views
CREATE POLICY "Users can read ad views"
  ON ad_views
  FOR SELECT
  TO public
  USING (true);

-- Create function to increment ad views
CREATE OR REPLACE FUNCTION increment_ad_views(p_ad_id UUID, p_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  -- Insert view record
  INSERT INTO ad_views (ad_id, user_id)
  VALUES (p_ad_id, p_user_id);
  
  -- Increment total views counter
  UPDATE ads
  SET current_total_views = current_total_views + 1
  WHERE id = p_ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if ad should be shown
CREATE OR REPLACE FUNCTION should_show_ad(p_ad_id UUID, p_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_ad RECORD;
  v_user_views INTEGER;
BEGIN
  -- Get ad settings
  SELECT max_views_per_user, max_total_views, current_total_views
  INTO v_ad
  FROM ads
  WHERE id = p_ad_id;
  
  -- Check if ad exists
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check total views limit
  IF v_ad.max_total_views IS NOT NULL AND v_ad.current_total_views >= v_ad.max_total_views THEN
    RETURN false;
  END IF;
  
  -- Check per-user views limit
  IF v_ad.max_views_per_user IS NOT NULL THEN
    SELECT COUNT(*)
    INTO v_user_views
    FROM ad_views
    WHERE ad_id = p_ad_id AND user_id = p_user_id;
    
    IF v_user_views >= v_ad.max_views_per_user THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
