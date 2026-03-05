-- PROAFILIADOS SUPPLEMENTARY SCHEMA

-- Enable Row Level Security
-- Setup Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  plan_type TEXT,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY, -- e.g. 'basic', 'pro', 'enterprise'
  name TEXT NOT NULL,
  price DECIMAL NOT NULL,
  features JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES public.plans(id),
  status TEXT DEFAULT 'inactive', -- active, inactive, past_due
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table (Evolution API)
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL,
  status TEXT DEFAULT 'disconnected', -- connected, disconnected, scanning
  qrcode TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  group_jid TEXT NOT NULL,
  name TEXT,
  is_monitored BOOLEAN DEFAULT TRUE,
  is_destination BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, group_jid)
);

-- Captured Links table
CREATE TABLE IF NOT EXISTS public.captured_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  group_jid TEXT,
  sender_name TEXT,
  sender_number TEXT,
  content TEXT,
  link_url TEXT NOT NULL,
  platform TEXT, -- Hotmart, Eduzz, Monetizze, Amazon, etc.
  raw_message JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captured_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Sessions: Users can only see/edit their own sessions
CREATE POLICY "Users can view own sessions" ON public.sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.sessions FOR DELETE USING (auth.uid() = user_id);

-- Groups: Users can only see groups from their sessions
CREATE POLICY "Users can view own groups" ON public.groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sessions WHERE id = public.groups.session_id AND user_id = auth.uid())
);
-- ... other policies for groups and links following same pattern ...
CREATE POLICY "Users can view own links" ON public.captured_links FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sessions WHERE id = public.captured_links.session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own links" ON public.captured_links FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.sessions WHERE id = public.captured_links.session_id AND user_id = auth.uid())
);

-- Groups: Users can manage groups from their sessions
CREATE POLICY "Users can insert own groups" ON public.groups FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.sessions WHERE id = public.groups.session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own groups" ON public.groups FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.sessions WHERE id = public.groups.session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own groups" ON public.groups FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.sessions WHERE id = public.groups.session_id AND user_id = auth.uid())
);

-- Subscriptions: Users can only view their own subscriptions
CREATE POLICY "Users can view own subs" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subs" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Plans: Anyone can read plans (public data)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are publicly readable" ON public.plans FOR SELECT USING (true);

-- Seed Plans
INSERT INTO public.plans (id, name, price, features) VALUES
('basic', 'Básico', 47.00, '{"max_sessions": 1, "max_groups": 10}'),
('pro', 'Pro', 97.00, '{"max_sessions": 3, "max_groups": 50}'),
('enterprise', 'Enterprise', 197.00, '{"max_sessions": 10, "max_groups": -1}')
ON CONFLICT (id) DO NOTHING;

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
