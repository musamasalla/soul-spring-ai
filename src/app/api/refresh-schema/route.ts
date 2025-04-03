import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    // Create a direct Supabase client with admin rights to send NOTIFY
    // This uses environment variables that should be securely stored
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    // Execute a raw SQL query to notify the PostgREST to reload schema
    const { error } = await supabaseAdmin.rpc('pg_notify', {
      channel: 'pgrst',
      payload: 'reload schema'
    });
    
    if (error) {
      console.error('Error refreshing schema:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Exception refreshing schema:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 