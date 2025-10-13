/*
  # Create phone_users table for phone authentication

  1. New Tables
    - `phone_users`
      - `id` (uuid, primary key) - Unique user identifier
      - `phone` (text, unique) - Phone number as login
      - `password_hash` (text) - Hashed password
      - `created_at` (timestamptz) - Registration timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      
  2. Security
    - Enable RLS on `phone_users` table
    - Add policy for users to read their own data
    - Add policy for users to update their own data
    - Add policy for new user registration (insert)
    
  3. Indexes
    - Create index on phone column for fast lookups
*/

CREATE TABLE IF NOT EXISTS phone_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_phone_users_phone ON phone_users(phone);

ALTER TABLE phone_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own phone data"
  ON phone_users
  FOR SELECT
  TO authenticated
  USING (id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can update own phone data"
  ON phone_users
  FOR UPDATE
  TO authenticated
  USING (id = (current_setting('app.current_user_id', true))::uuid)
  WITH CHECK (id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Allow phone user registration"
  ON phone_users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
