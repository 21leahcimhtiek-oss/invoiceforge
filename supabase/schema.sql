-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'agency')),
  -- Business info
  business_name text,
  business_email text,
  business_address text,
  business_phone text,
  business_website text,
  business_logo_url text,
  tax_id text,
  -- Invoice settings
  invoice_prefix text not null default 'INV',
  next_invoice_number integer not null default 1,
  invoice_count integer not null default 0,
  -- Stripe
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Clients table
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  email text,
  company text,
  address text,
  phone text,
  website text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Invoices table
create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  invoice_number text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  currency text not null default 'USD',
  line_items jsonb not null default '[]',
  subtotal numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  notes text,
  terms text,
  issued_at date not null default current_date,
  due_at date not null default (current_date + interval '30 days'),
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, invoice_number)
);

-- Indexes
create index if not exists idx_clients_user_id on public.clients(user_id);
create index if not exists idx_invoices_user_id on public.invoices(user_id);
create index if not exists idx_invoices_client_id on public.invoices(client_id);
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_invoices_due_at on public.invoices(due_at);

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_users_updated on public.users;
create trigger on_users_updated
  before update on public.users
  for each row execute function public.handle_updated_at();

drop trigger if exists on_clients_updated on public.clients;
create trigger on_clients_updated
  before update on public.clients
  for each row execute function public.handle_updated_at();

drop trigger if exists on_invoices_updated on public.invoices;
create trigger on_invoices_updated
  before update on public.invoices
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.invoices enable row level security;

-- Users policies
create policy "Users can view own profile"    on public.users for select using (auth.uid() = id);
create policy "Users can update own profile"  on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile"  on public.users for insert with check (auth.uid() = id);
create policy "Users can delete own profile"  on public.users for delete using (auth.uid() = id);

-- Clients policies
create policy "Users can view own clients"    on public.clients for select using (auth.uid() = user_id);
create policy "Users can insert own clients"  on public.clients for insert with check (auth.uid() = user_id);
create policy "Users can update own clients"  on public.clients for update using (auth.uid() = user_id);
create policy "Users can delete own clients"  on public.clients for delete using (auth.uid() = user_id);

-- Invoices policies
create policy "Users can view own invoices"   on public.invoices for select using (auth.uid() = user_id);
create policy "Users can insert own invoices" on public.invoices for insert with check (auth.uid() = user_id);
create policy "Users can update own invoices" on public.invoices for update using (auth.uid() = user_id);
create policy "Users can delete own invoices" on public.invoices for delete using (auth.uid() = user_id);