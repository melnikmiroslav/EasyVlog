/*
  # Add trigger to create profile for phone users

  1. New Functions
    - `handle_new_phone_user()` - Creates a profile when a phone user registers
      - Automatically generates channel name based on phone number
      - Creates profile entry in profiles table
      
  2. Triggers
    - `on_phone_user_created` - Calls handle_new_phone_user after phone_users insert
*/

-- Create function to automatically create profile on phone user registration
CREATE OR REPLACE FUNCTION public.handle_new_phone_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, channel_name)
  VALUES (new.id, 'Пользователь ' || substring(new.phone from 1 for 4))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call function on phone user registration
DROP TRIGGER IF EXISTS on_phone_user_created ON phone_users;
CREATE TRIGGER on_phone_user_created
  AFTER INSERT ON phone_users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_phone_user();
