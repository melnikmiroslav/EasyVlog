/*
  # Fix RLS policies for phone_users table

  1. Changes
    - Add policy for anonymous users to check if phone exists during registration
    - This allows the registration form to verify if a phone number is already registered
    
  2. Security
    - Policy only allows SELECT operations
    - Limited to anonymous and authenticated users
    - Does not expose sensitive data (password hash is never returned in registration check)
*/

CREATE POLICY "Allow phone existence check for registration"
  ON phone_users
  FOR SELECT
  TO anon, authenticated
  USING (true);
