/*
  # Add banner background to profiles

  1. Changes
    - Add `banner_url` column to `profiles` table
      - Type: text (URL to banner image)
      - Nullable: true (not all users may have a banner)
  
  2. Notes
    - This allows users to customize their channel page with a banner image
    - Banner will be displayed behind the avatar on the profile page
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'banner_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN banner_url text;
  END IF;
END $$;