import { supabase } from './supabase';
import { Profile } from '../types/auth';

export const authService = {
  // Sign up with email & password
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  // Login with email & password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Forgot password reset request
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'ecommerce-stripe://reset-password',
    });
    if (error) throw error;
    return data;
  },

  // Get profile by UID
  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update profile
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.full_name,
        phone: updates.phone,
        avatar_url: updates.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get current active session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
};
export default authService;
