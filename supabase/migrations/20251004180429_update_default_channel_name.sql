/*
  # Update default channel name

  1. Changes
    - Update the handle_new_user function to set default channel name to "новый пользователь"
    - This affects all new user registrations going forward

  2. Important Notes
    - Existing profiles are not affected by this change
    - Only new user signups will have the new default name
*/

-- Update function to set default channel name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, channel_name)
  VALUES (new.id, 'новый пользователь');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
