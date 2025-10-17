/*
  # Create push subscriptions table

  1. New Tables
    - `push_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (text, references auth users or phone_users)
      - `subscription` (jsonb, push subscription object)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `push_subscriptions` table
    - Add policy for authenticated users to manage their own subscriptions
    - Add policy for phone users to manage their own subscriptions
*/

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  subscription jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON push_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own subscription"
  ON push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own subscription"
  ON push_subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own subscription"
  ON push_subscriptions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Phone users can view own subscription"
  ON push_subscriptions FOR SELECT
  TO anon
  USING (EXISTS (SELECT 1 FROM phone_users WHERE id::text = user_id));

CREATE POLICY "Phone users can insert own subscription"
  ON push_subscriptions FOR INSERT
  TO anon
  WITH CHECK (EXISTS (SELECT 1 FROM phone_users WHERE id::text = user_id));

CREATE POLICY "Phone users can update own subscription"
  ON push_subscriptions FOR UPDATE
  TO anon
  USING (EXISTS (SELECT 1 FROM phone_users WHERE id::text = user_id))
  WITH CHECK (EXISTS (SELECT 1 FROM phone_users WHERE id::text = user_id));

CREATE POLICY "Phone users can delete own subscription"
  ON push_subscriptions FOR DELETE
  TO anon
  USING (EXISTS (SELECT 1 FROM phone_users WHERE id::text = user_id));

CREATE OR REPLACE FUNCTION update_push_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_push_subscription_timestamp
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscription_timestamp();
