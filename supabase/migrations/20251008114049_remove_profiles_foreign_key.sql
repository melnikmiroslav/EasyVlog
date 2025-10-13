/*
  # Remove foreign key constraint from profiles table

  1. Changes
    - Drop foreign key constraint on auth.users from profiles table
    - This allows profiles to be created for both auth.users and phone_users
    
  2. Security
    - RLS policies remain unchanged
    - Users can still only manage their own profiles
*/

-- Drop the foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
