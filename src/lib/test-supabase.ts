import { supabase } from './supabase';

/**
 * Test function to check Supabase connection
 * Call this function in browser console or use it for debugging
 */
export async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...');
  console.log('=====================================');
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('1. Environment Variables:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓ Set' : '✗ Missing');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Environment variables are missing!');
    return { success: false, error: 'Missing environment variables' };
  }
  
  try {
    // Test connection by querying beritas table
    console.log('\n2. Testing database connection...');
    const { data, error } = await supabase
      .from('beritas')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Database Error:', error);
      console.error('   Code:', error.code);
      console.error('   Message:', error.message);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
      
      // Common error solutions
      if (error.code === 'PGRST116') {
        console.error('\n💡 Solution: Table "beritas" not found. Check table name in Supabase.');
      } else if (error.code === '42501') {
        console.error('\n💡 Solution: Permission denied. Check Row Level Security (RLS) policies in Supabase.');
      }
      
      return { success: false, error };
    }
    
    console.log('✅ Connection successful!');
    console.log('   Data sample:', data);
    console.log('   Total items found:', data?.length || 0);
    
    // Test full query
    console.log('\n3. Testing full query...');
    const { data: allData, error: allError } = await supabase
      .from('beritas')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.error('❌ Full query error:', allError);
      return { success: false, error: allError };
    }
    
    console.log('✅ Full query successful!');
    console.log('   Total berita items:', allData?.length || 0);
    
    return { 
      success: true, 
      data: allData,
      count: allData?.length || 0 
    };
    
  } catch (err: any) {
    console.error('❌ Unexpected error:', err);
    return { success: false, error: err };
  }
}

// Make it available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).testSupabase = testSupabaseConnection;
}

