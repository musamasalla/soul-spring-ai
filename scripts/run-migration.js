const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running Supabase migration for check_permissions function...');

// Path to the migration file
const migrationFile = path.join(__dirname, '../supabase/migrations/20240405_create_check_permissions.sql');

try {
  // Ensure the migration file exists
  if (!fs.existsSync(migrationFile)) {
    console.error('Migration file not found:', migrationFile);
    process.exit(1);
  }

  // Read the migration file content
  const sqlContent = fs.readFileSync(migrationFile, 'utf8');
  
  console.log('Migration file loaded successfully.');
  console.log('Please run this SQL in your Supabase dashboard SQL editor:');
  console.log('\n------------------------------------------\n');
  console.log(sqlContent);
  console.log('\n------------------------------------------\n');
  
  console.log('After running the SQL:');
  console.log('1. Restart your application');
  console.log('2. Clear browser cache or use incognito mode');
  console.log('3. Test the dashboard functionality');
  
} catch (error) {
  console.error('Error running migration:', error);
  process.exit(1);
} 