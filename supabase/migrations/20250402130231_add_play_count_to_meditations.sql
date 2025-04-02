-- Add play_count column to meditations table
ALTER TABLE IF EXISTS public.meditations
ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0 NOT NULL;

-- Add a comment to explain the column
COMMENT ON COLUMN public.meditations.play_count IS 'Number of times this meditation has been played';

-- Update existing records to have a play_count of 0
UPDATE public.meditations SET play_count = 0 WHERE play_count IS NULL;
