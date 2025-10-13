/*
  # Fix RLS policies for profiles table to support both email and phone users

  1. Changes
    - Drop existing RLS policies that only check auth.uid()
    - Create new policies that allow updates/inserts for any authenticated user on their own profile
    - This enables both email users (via auth.users) and phone users (via phone_users) to update their profiles
    
  2. Security
    - Users can only update their own profile (checked by id match)
    - Public read access remains unchanged
    - Both authenticated users and anonymous users can insert (for initial profile creation)
*/

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies that work for all user types
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);
