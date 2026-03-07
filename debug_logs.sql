CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
