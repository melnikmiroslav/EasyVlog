/*
  # Add category field to videos table

  1. Changes
    - Add `category` column to `videos` table
      - Type: text
      - Default: 'Все' (All)
      - Possible values: 'Все', 'Музыка', 'Игры', 'Новости', 'Прямые трансляции', 'Кулинария', 'Спорт', 'Технологии', 'Путешествия', 'Образование'
    
  2. Index
    - Add index on category column for faster filtering
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'category'
  ) THEN
    ALTER TABLE videos ADD COLUMN category text DEFAULT 'Все';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS videos_category_idx ON videos(category);