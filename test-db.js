// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = "https://ryjawoplxfttnsuznssi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5amF3b3BseGZ0dG5zdXpuc3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTE4NzIsImV4cCI6MjA1OTA4Nzg3Mn0.qvvjbZKo05FWnTJ89dRyl9Z2ob6_AZeQlixHZXUiYRE";

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Function to test the meditations table
async function testMeditationsTable() {
  console.log('Testing meditations table...');

  try {
    // Attempt to fetch all meditations
    const { data: meditations, error } = await supabase
      .from('meditations')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error fetching meditations:', error);
    } else {
      console.log('Successfully fetched meditations:');
      console.log(meditations);
      
      // List the columns present in the first meditation record
      if (meditations && meditations.length > 0) {
        console.log('\nColumns in the meditations table:');
        console.log(Object.keys(meditations[0]));
      }
    }
  } catch (error) {
    console.error('Exception when testing meditations table:', error);
  }
}

// Run the test
testMeditationsTable(); 