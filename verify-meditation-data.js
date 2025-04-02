// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = "https://ryjawoplxfttnsuznssi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5amF3b3BseGZ0dG5zdXpuc3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTE4NzIsImV4cCI6MjA1OTA4Nzg3Mn0.qvvjbZKo05FWnTJ89dRyl9Z2ob6_AZeQlixHZXUiYRE";

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Function to verify meditation data
async function verifyMeditationData() {
  console.log('Verifying meditation data...');

  try {
    // Fetch meditations ordered by play_count
    const { data: meditations, error } = await supabase
      .from('meditations')
      .select('*')
      .order('play_count', { ascending: false });
    
    if (error) {
      console.error('Error fetching meditations:', error);
      return;
    }
    
    if (!meditations || meditations.length === 0) {
      console.log('No meditation data found!');
      return;
    }
    
    console.log(`Found ${meditations.length} meditations:`);
    
    // Display summary of each meditation with play_count
    meditations.forEach((meditation, index) => {
      console.log(`\n${index + 1}. ${meditation.title}`);
      console.log(`   Category: ${meditation.category}`);
      console.log(`   Duration: ${Math.floor(meditation.duration / 60)} minutes`);
      console.log(`   Play Count: ${meditation.play_count}`);
      console.log(`   Tags: ${meditation.tags ? meditation.tags.join(', ') : 'None'}`);
    });
    
    // Verify we can order by play_count
    console.log('\nVerifying play_count ordering is working correctly...');
    const highestPlayCount = meditations[0].play_count;
    const highestPlayCountTitle = meditations[0].title;
    console.log(`Meditation with highest play count (${highestPlayCount}): ${highestPlayCountTitle}`);
    
  } catch (error) {
    console.error('Error verifying meditation data:', error);
  }
}

// Run the verification
verifyMeditationData(); 