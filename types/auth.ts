export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
}
