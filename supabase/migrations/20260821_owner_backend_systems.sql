-- DASH Mobile Services owner backend foundation
-- Adds operational data structures for inventory, jobs, customers, employees,
-- vehicles/equipment, complaints/callbacks, retention, forecasting and owner attention.

create extension if not exists pgcrypto;

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  unit text not null default 'each',
  current_stock numeric not null default 0,
  minimum_stock numeric not null default 0,
  target_stock numeric not null default 0,
  maximum_stock numeric,
  average_daily_usage numeric not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  quantity_change numeric not null,
  transaction_type text not null check (transaction_type in ('purchase','usage','damage','adjustment','return')),
  job_id uuid,
  performed_by uuid,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.supply_requests (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id),
  quantity numeric not null check (quantity > 0),
  location text not null,
  reason text not null,
  requested_by uuid,
  status text not null default 'pending' check (status in ('pending','approved','denied','ordered','received','cancelled')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.business_jobs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  service_name text not null,
  service_location text,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  assigned_manager uuid,
  assigned_crew text,
  estimated_revenue numeric not null default 0,
  estimated_direct_cost numeric not null default 0,
  estimated_overhead numeric not null default 0,
  actual_revenue numeric,
  actual_direct_cost numeric,
  actual_overhead numeric,
  status text not null default 'scheduled',
  customer_instructions text,
  access_notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.job_costs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.business_jobs(id) on delete cascade,
  category text not null,
  description text,
  amount numeric not null default 0,
  recorded_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.employee_work_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null,
  job_id uuid references public.business_jobs(id),
  work_category text not null,
  hours numeric not null default 0,
  hourly_cost numeric not null default 0,
  notes text,
  work_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  active boolean not null default true,
  last_service_at timestamptz,
  expected_next_service_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_feedback (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  job_id uuid references public.business_jobs(id),
  feedback_type text not null check (feedback_type in ('complaint','compliment','callback','other')),
  description text not null,
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.fleet_assets (
  id uuid primary key default gen_random_uuid(),
  asset_type text not null check (asset_type in ('vehicle','equipment','trailer','other')),
  name text not null,
  identifier text,
  current_mileage numeric,
  next_service_mileage numeric,
  next_service_date date,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.asset_usage (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.fleet_assets(id) on delete cascade,
  job_id uuid references public.business_jobs(id),
  hours numeric default 0,
  mileage numeric default 0,
  usage_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.employee_training_events (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null,
  trigger_type text not null,
  reason text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.owner_attention_items (
  id uuid primary key default gen_random_uuid(),
  severity text not null check (severity in ('urgent','routine','info')),
  category text not null,
  title text not null,
  description text,
  source_table text,
  source_id uuid,
  resolved boolean not null default false,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_inventory_requests_status on public.supply_requests(status);
create index if not exists idx_inventory_transactions_item on public.inventory_transactions(inventory_item_id, created_at desc);
create index if not exists idx_jobs_status_schedule on public.business_jobs(status, scheduled_start);
create index if not exists idx_feedback_customer on public.customer_feedback(customer_id, created_at desc);
create index if not exists idx_asset_service on public.fleet_assets(next_service_date, next_service_mileage);
create index if not exists idx_owner_attention_open on public.owner_attention_items(resolved, severity, created_at desc);

-- Seed the owner-approved inventory categories/items used by the manager workflow.
insert into public.inventory_items (name, category, unit, current_stock, minimum_stock, target_stock)
select * from (values
  ('Pine Bark Mulch — 2 cu. ft. bags','Mulch','bags',0,15,50),
  ('Contractor Bags','Contractor bags','bags',0,15,50),
  ('Lawn Bags','Lawn bags','bags',0,15,50),
  ('Edging','Edging','feet',0,25,100),
  ('Landscape Staples','Landscape staples','each',0,50,200),
  ('Fuel / Equipment Supplies','Fuel/equipment supplies','unit',0,5,20),
  ('Cleaning Supplies','Cleaning supplies','unit',0,5,20)
) v(name,category,unit,current_stock,minimum_stock,target_stock)
where not exists (select 1 from public.inventory_items i where i.name=v.name);

-- Basic analytical views used by owner reporting.
create or replace view public.owner_job_profitability as
select j.id, j.service_name, j.status,
       coalesce(j.actual_revenue,j.estimated_revenue) as revenue,
       coalesce(j.actual_direct_cost,j.estimated_direct_cost) as direct_cost,
       coalesce(j.actual_overhead,j.estimated_overhead) as overhead,
       coalesce(j.actual_revenue,j.estimated_revenue)
         - coalesce(j.actual_direct_cost,j.estimated_direct_cost)
         - coalesce(j.actual_overhead,j.estimated_overhead) as company_profit
from public.business_jobs j;

create or replace view public.inventory_order_timing as
select sr.id, sr.inventory_item_id, i.name, sr.quantity, i.current_stock,
       i.minimum_stock, i.target_stock, sr.status, sr.created_at,
       case when i.current_stock < i.minimum_stock then 'late'
            when i.current_stock > i.target_stock then 'early'
            else 'appropriate' end as timing_assessment
from public.supply_requests sr
join public.inventory_items i on i.id=sr.inventory_item_id;

alter table public.inventory_items enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.supply_requests enable row level security;
alter table public.business_jobs enable row level security;
alter table public.job_costs enable row level security;
alter table public.employee_work_logs enable row level security;
alter table public.customers enable row level security;
alter table public.customer_feedback enable row level security;
alter table public.fleet_assets enable row level security;
alter table public.asset_usage enable row level security;
alter table public.employee_training_events enable row level security;
alter table public.owner_attention_items enable row level security;

-- Policies should be completed against the project's existing role/claims model.
-- No permissive public policies are created here intentionally.
