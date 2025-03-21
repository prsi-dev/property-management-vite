import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with admin privileges for seeding
export const createSupabaseAdmin = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  // This should be the service_role key, not the anon key
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for admin operations');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Seeds a user into the Supabase Auth system
 * @param user User data from Prisma
 * @param plainTextPassword The plain text password for the user
 * @returns The Supabase user data or null if creation failed
 */
export const seedUserToSupabase = async (
  user,
  plainTextPassword
) => {
  const supabaseAdmin = createSupabaseAdmin();
  
  try {
    // First check if the user already exists to avoid duplicates
    // Using listUsers and filtering by email as getUserByEmail is not available
    const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error(`Error listing users in Supabase: ${listError.message}`);
      return null;
    }
    
    const existingUser = usersList.users.find(u => u.email === user.email);
    
    if (existingUser) {
      console.log(`User with email ${user.email} already exists in Supabase Auth`);
      return existingUser;
    }
    
    // Create the user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: plainTextPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        prisma_id: user.id, // Store the Prisma UUID for reference
      },
    });
    
    if (error) {
      console.error(`Error creating user in Supabase: ${error.message}`);
      return null;
    }
    
    console.log(`User ${user.email} successfully created in Supabase Auth`);
    return data.user;
  } catch (error) {
    console.error('Error in seedUserToSupabase:', error);
    return null;
  }
};

/**
 * Removes a user from Supabase Auth
 * @param email The email of the user to remove
 */
export const removeUserFromSupabase = async (email) => {
  const supabaseAdmin = createSupabaseAdmin();
  
  try {
    // Using listUsers and filtering by email as getUserByEmail is not available
    const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error(`Error listing users in Supabase: ${listError.message}`);
      return;
    }
    
    const user = usersList.users.find(u => u.email === email);
    
    if (user) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      
      if (error) {
        console.error(`Error deleting user from Supabase: ${error.message}`);
      } else {
        console.log(`User ${email} successfully deleted from Supabase Auth`);
      }
    } else {
      console.log(`User with email ${email} not found in Supabase Auth`);
    }
  } catch (error) {
    console.error('Error in removeUserFromSupabase:', error);
  }
};

/**
 * Cleans all seed users from Supabase Auth
 * @param emails Array of email addresses to clean up
 */
export const cleanSupabaseUsers = async (emails) => {
  console.log('Cleaning Supabase Auth users...');
  
  for (const email of emails) {
    await removeUserFromSupabase(email);
  }
  
  console.log('Supabase Auth users cleanup completed');
}; 