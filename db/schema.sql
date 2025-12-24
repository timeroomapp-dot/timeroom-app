-- Timeroom Database Schema (Supabase PostgreSQL)
-- Created: December 24, 2025

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'trial', -- 'trial', 'active', 'cancelled'
  subscription_id TEXT UNIQUE, -- Stripe subscription ID
  customer_id TEXT UNIQUE, -- Stripe customer ID
  plan_type TEXT DEFAULT 'basic', -- 'basic', 'pro', 'enterprise'
  time_saved_hours DECIMAL DEFAULT 0, -- Total hours saved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT, -- 'appointment', 'automation', 'meeting', 'document'
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_duration_minutes INTEGER,
  actual_duration_minutes INTEGER,
  time_saved_minutes INTEGER DEFAULT 0,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly schedules table
CREATE TABLE public.weekly_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  schedule_data JSONB, -- Claude-generated optimized schedule
  total_hours_saved DECIMAL DEFAULT 0,
  energy_levels JSONB, -- User's energy levels by day
  preferences JSONB, -- User preferences for scheduling
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Documents/Paperwork table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  document_type TEXT, -- 'invoice', 'contract', 'form', 'receipt'
  s3_url TEXT,
  extracted_data JSONB, -- OCR extracted fields
  status TEXT DEFAULT 'pending', -- 'pending', 'extracted', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time wallet analytics table
CREATE TABLE public.time_wallet_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  hours_saved DECIMAL DEFAULT 0,
  category_breakdown JSONB, -- Time saved by category
  weekly_trend JSONB, -- Weekly trend data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Auto-tasks execution log
CREATE TABLE public.auto_task_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  intent TEXT,
  entities JSONB, -- Extracted entities (who, what, when, where)
  execution_status TEXT, -- 'success', 'failed', 'pending'
  automation_workflow JSONB, -- Generated workflow
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions/Billing table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT, -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  amount_paid DECIMAL,
  currency TEXT DEFAULT 'EUR',
  status TEXT, -- 'paid', 'pending', 'failed'
  invoice_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX idx_users_customer_id ON public.users(customer_id);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_weekly_schedules_user_id ON public.weekly_schedules(user_id);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_auto_task_logs_user_id ON public.auto_task_logs(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_wallet_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_task_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for tasks table
CREATE POLICY "Users can read own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Similar RLS policies for other tables
CREATE POLICY "Users can read own schedules" ON public.weekly_schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own analytics" ON public.time_wallet_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
