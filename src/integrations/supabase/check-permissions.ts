import { supabase, safeQuery, extractErrorMessage } from './client';
import { toast } from 'sonner';

// Types for the permission check response
interface PermissionCheckResult {
  authenticated: boolean;
  user_id?: string;
  message?: string;
  permissions?: {
    therapy_goals: boolean;
    therapy_sessions: boolean;
    session_goals: boolean;
    tts_usage: boolean;
  };
  rls_enabled?: {
    therapy_goals: boolean;
    therapy_sessions: boolean;
    session_goals: boolean;
    tts_usage: boolean;
  };
  actual_access?: {
    therapy_goals_insert: boolean;
    therapy_goals_select: boolean;
    error?: string;
  };
}

/**
 * Checks the user's permissions for therapy-related database tables
 * This helps diagnose issues when data isn't loading properly
 */
export async function checkDatabasePermissions(): Promise<PermissionCheckResult | null> {
  try {
    console.log('Checking database permissions...');
    
    // Try the RPC function first
    const { data, error } = await safeQuery(() => 
      supabase.rpc('check_permissions')
    );
    
    if (error) {
      console.error('Error checking permissions:', error);
      
      // Handle specific database errors
      if (typeof error === 'string') {
        // Check for common error messages
        if (error.includes('PGRST202') || 
            error.includes('not find the function') || 
            error.includes('column "rls_enabled" does not exist')) {
          
          // This is expected if the function or column doesn't exist
          const session = await supabase.auth.getSession();
          const user = session?.data?.session?.user;
          
          // Simple fallback for when function doesn't exist or there's a schema mismatch
          return {
            authenticated: !!user,
            user_id: user?.id,
            message: 'Using client-side fallback for permission check.',
            actual_access: {
              therapy_goals_insert: false,
              therapy_goals_select: false,
              error: error.includes('column "rls_enabled"') 
                ? 'Database schema mismatch: column "rls_enabled" does not exist' 
                : 'check_permissions function not available in database'
            }
          };
        }
      } else if (error.code === '42703' && error.message?.includes('column "rls_enabled" does not exist')) {
        // Handle the specific PostgreSQL error about rls_enabled column
        const session = await supabase.auth.getSession();
        const user = session?.data?.session?.user;
        
        return {
          authenticated: !!user,
          user_id: user?.id,
          message: 'Schema mismatch detected.',
          actual_access: {
            therapy_goals_insert: false,
            therapy_goals_select: false,
            error: 'Database schema mismatch: column "rls_enabled" does not exist (Code: 42703)'
          }
        };
      }
      
      return null;
    }
    
    console.log('Permission check results:', data);
    
    return data as PermissionCheckResult;
  } catch (err) {
    console.error('Unexpected error checking permissions:', err);
    toast.error('An error occurred while checking permissions');
    return null;
  }
}

/**
 * Creates a test therapy goal to verify write permissions
 * This is a fallback when the RPC method isn't available
 */
export async function testTherapyGoalCreation(userId: string): Promise<boolean> {
  try {
    // Try to create a test goal
    const { data, error } = await safeQuery(() => 
      supabase
        .from('therapy_goals')
        .insert([{
          user_id: userId,
          title: 'TEST PERMISSION RECORD',
          description: 'This record tests permissions and will be deleted',
          status: 'not_started'
        }])
        .select()
    );
    
    if (error) {
      console.error('Error creating test goal:', error);
      return false;
    }
    
    // Delete the test goal
    if (data && data.length > 0) {
      const goalId = data[0].id;
      await supabase
        .from('therapy_goals')
        .delete()
        .eq('id', goalId);
      
      return true;
    }
    
    return false;
  } catch (err) {
    console.error('Unexpected error testing goal creation:', err);
    return false;
  }
}

/**
 * Tests that we can read from the therapy_goals table
 */
export async function testTherapyGoalRead(): Promise<boolean> {
  try {
    const { data, error } = await safeQuery(() => 
      supabase
        .from('therapy_goals')
        .select('*')
        .limit(1)
    );
    
    if (error) {
      console.error('Error reading therapy_goals:', error);
      return false;
    }
    
    // We don't care if there's data or not, just that we can query without error
    return true;
  } catch (err) {
    console.error('Unexpected error testing goal read:', err);
    return false;
  }
}

/**
 * Diagnoses and attempts to fix common permission issues
 */
export async function diagnosePermissionIssues(): Promise<string> {
  const session = await supabase.auth.getSession();
  const user = session?.data?.session?.user;
  
  if (!user) {
    return "Not authenticated. Please log in.";
  }
  
  // Try the RPC function first
  const permissionCheck = await checkDatabasePermissions();
  
  // If permissionCheck has an error about rls_enabled column
  if (permissionCheck?.actual_access?.error?.includes('column "rls_enabled" does not exist')) {
    // Test table access instead of relying on the RPC
    const canReadGoals = await testTherapyGoalRead();
    const canCreateGoal = await testTherapyGoalCreation(user.id);
    
    if (canReadGoals && canCreateGoal) {
      return "Basic read/write permissions confirmed. The check_permissions function is not available on the server, but table access appears to be working.";
    } else if (canReadGoals) {
      return "Can read from therapy_goals but cannot write. Row Level Security may be restricting inserts.";
    } else if (canCreateGoal) {
      return "Can write to therapy_goals but cannot read. Row Level Security may be restricting selects.";
    } else {
      return "Cannot read or write to therapy_goals table. This could be a database connection issue, permissions problem, or Row Level Security restriction.";
    }
  }
  
  // If RPC function is unavailable or other error, try direct test
  if (!permissionCheck) {
    // Test table access
    const canReadGoals = await testTherapyGoalRead();
    const canCreateGoal = await testTherapyGoalCreation(user.id);
    
    if (canReadGoals && canCreateGoal) {
      return "Basic read/write permissions confirmed. The check_permissions function is not available on the server, but table access appears to be working.";
    } else if (canReadGoals) {
      return "Can read from therapy_goals but cannot write. Row Level Security may be restricting inserts.";
    } else if (canCreateGoal) {
      return "Can write to therapy_goals but cannot read. Row Level Security may be restricting selects.";
    } else {
      return "Cannot read or write to therapy_goals table. This could be a database connection issue, permissions problem, or Row Level Security restriction.";
    }
  }
  
  // Analyze the permission check results
  if (!permissionCheck.authenticated) {
    return "Authentication issue. User is not properly authenticated.";
  }
  
  if (permissionCheck.actual_access?.error) {
    return `Database access error: ${permissionCheck.actual_access.error}`;
  }
  
  if (!permissionCheck.permissions?.therapy_goals) {
    return "Missing RLS policies for therapy_goals table.";
  }
  
  if (!permissionCheck.actual_access?.therapy_goals_insert) {
    return "Cannot insert into therapy_goals despite policies. Check RLS policy conditions.";
  }
  
  if (!permissionCheck.actual_access?.therapy_goals_select) {
    return "Cannot select from therapy_goals despite policies. Check RLS policy conditions.";
  }
  
  return "All permission checks passed. Issue may be elsewhere.";
} 