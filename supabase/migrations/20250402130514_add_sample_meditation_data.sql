-- Add sample meditation data
INSERT INTO public.meditations (
  title, 
  description, 
  audio_url, 
  cover_image, 
  duration, 
  instructor, 
  category, 
  tags, 
  is_premium, 
  play_count
)
VALUES 
(
  'Calming Breath Work',
  'A gentle breathing meditation to calm anxiety and stress',
  'https://example.com/audio/calm-breath.mp3',
  'https://example.com/images/calm-breath.jpg',
  300,  -- 5 minutes in seconds
  'Sarah Johnson',
  'anxiety',
  ARRAY['breathing', 'anxiety', 'beginner'],
  false,
  42    -- play count
),
(
  'Body Scan Relaxation',
  'Progressive relaxation technique for deep relaxation',
  'https://example.com/audio/body-scan.mp3',
  'https://example.com/images/body-scan.jpg',
  600,  -- 10 minutes
  'Michael Chen',
  'sleep',
  ARRAY['relaxation', 'sleep', 'body-scan'],
  false,
  28    -- play count
),
(
  'Morning Energy Meditation',
  'Start your day with energy and positivity',
  'https://example.com/audio/morning-energy.mp3',
  'https://example.com/images/morning-energy.jpg',
  420,  -- 7 minutes
  'Emma Roberts',
  'energizing',
  ARRAY['morning', 'energy', 'positivity'],
  false,
  15    -- play count
),
(
  'Loving-Kindness Practice',
  'Cultivate compassion for yourself and others',
  'https://example.com/audio/loving-kindness.mp3',
  'https://example.com/images/loving-kindness.jpg',
  480,  -- 8 minutes
  'David Wong',
  'self-compassion',
  ARRAY['compassion', 'loving-kindness', 'emotional'],
  false,
  36    -- play count
),
(
  'Stress Relief Focus',
  'Quick meditation for immediate stress relief',
  'https://example.com/audio/stress-relief.mp3',
  'https://example.com/images/stress-relief.jpg',
  240,  -- 4 minutes
  'Alex Thompson',
  'stress',
  ARRAY['stress', 'quick', 'focus'],
  false,
  52    -- play count
),
(
  'Deep Sleep Journey',
  'Guided meditation to help you fall asleep naturally',
  'https://example.com/audio/deep-sleep.mp3',
  'https://example.com/images/deep-sleep.jpg',
  1200, -- 20 minutes
  'Sophia Martinez',
  'sleep',
  ARRAY['sleep', 'relaxation', 'night'],
  true,
  18    -- play count
);
