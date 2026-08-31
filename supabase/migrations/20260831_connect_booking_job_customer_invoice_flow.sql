-- DASH: connect approved customer bookings to customer records, jobs, and invoices.
-- This migration mirrors the production Supabase migration applied on 2026-08-31.

create unique index if not exists customers_email_unique_idx on public.customers (lower(email)) where email is not null and length(trim(email)) > 0;
create unique index if not exists customers_phone_unique_idx on public.customers (regexp_replace(phone, '[^0-9]', '', 'g')) where phone is not null and length(regexp_replace(phone, '[^0-9]', '', 'g')) > 0;

create table if not exists public.job_invoices (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.business_jobs(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  invoice_number text not null unique,
  amount numeric not null default 0,
  status text not null default 'draft' check (status in ('draft','sent','partially_paid','paid','void','overdue')),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists job_invoices_job_unique_idx on public.job_invoices(job_id);

create table if not exists public.job_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.job_invoices(id) on delete cascade,
  job_id uuid not null references public.business_jobs(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  amount numeric not null check (amount >= 0),
  status text not null default 'recorded' check (status in ('pending','recorded','refunded','failed')),
  method text,
  processor_reference text,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create sequence if not exists public.job_invoice_number_seq;

create or replace function public.sync_service_request_to_job()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_customer_id uuid; v_job_id uuid; v_phone_digits text; v_start timestamptz; v_end timestamptz; v_invoice_number text;
begin
  if new.request_status not in ('approved','scheduled','confirmed') or new.business_job_id is not null then return new; end if;
  v_phone_digits := regexp_replace(coalesce(new.phone,''), '[^0-9]', '', 'g');
  if nullif(trim(new.email),'') is not null then
    select id into v_customer_id from customers where lower(trim(email))=lower(trim(new.email)) limit 1;
  end if;
  if v_customer_id is null and length(v_phone_digits)>0 then
    select id into v_customer_id from customers where regexp_replace(phone,'[^0-9]','','g')=v_phone_digits limit 1;
  end if;
  if v_customer_id is null then
    insert into customers(name,phone,email,active) values(trim(concat_ws(' ',nullif(trim(new.first_name),''),nullif(trim(new.last_name),''))),nullif(trim(new.phone),''),nullif(trim(new.email),''),true) returning id into v_customer_id;
  else
    update customers set name=coalesce(nullif(trim(concat_ws(' ',nullif(trim(new.first_name),''),nullif(trim(new.last_name),''))),''),name), phone=coalesce(nullif(trim(new.phone),''),phone), email=coalesce(nullif(trim(new.email),''),email), active=true where id=v_customer_id;
  end if;
  if new.preferred_date is not null then
    v_start := (new.preferred_date + coalesce(new.preferred_time,time '09:00')) at time zone 'America/New_York';
    v_end := v_start + interval '1 hour';
  end if;
  insert into business_jobs(customer_id,service_name,service_location,scheduled_start,scheduled_end,status,customer_instructions,priority)
  values(v_customer_id,new.service_name,concat_ws(', ',nullif(trim(new.full_address),''),nullif(trim(new.city),''),nullif(trim(new.state),''),nullif(trim(new.postal_code),'')),v_start,v_end,case when new.request_status='approved' then 'approved' else 'scheduled' end,nullif(trim(new.restriction_details),''),'normal') returning id into v_job_id;
  update service_requests set business_job_id=v_job_id,updated_at=now() where id=new.id;
  v_invoice_number := 'DASH-' || to_char(current_date,'YYYYMMDD') || '-' || lpad(nextval('job_invoice_number_seq')::text,5,'0');
  insert into job_invoices(job_id,customer_id,invoice_number,amount,status) values(v_job_id,v_customer_id,v_invoice_number,0,'draft');
  return new;
end; $$;

drop trigger if exists trg_sync_service_request_to_job on public.service_requests;
create trigger trg_sync_service_request_to_job after insert or update of request_status on public.service_requests for each row execute function public.sync_service_request_to_job();

create or replace function public.refresh_invoice_from_payment()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_total numeric; v_amount numeric;
begin
  select amount into v_amount from job_invoices where id=new.invoice_id;
  select coalesce(sum(amount),0) into v_total from job_payments where invoice_id=new.invoice_id and status='recorded';
  update job_invoices set status=case when v_total<=0 then case when status='void' then 'void' else status end when v_total>=v_amount and v_amount>0 then 'paid' else 'partially_paid' end, updated_at=now() where id=new.invoice_id and status<>'void';
  return new;
end; $$;

drop trigger if exists trg_refresh_invoice_from_payment on public.job_payments;
create trigger trg_refresh_invoice_from_payment after insert or update of amount,status on public.job_payments for each row execute function public.refresh_invoice_from_payment();

alter table public.job_invoices enable row level security;
alter table public.job_payments enable row level security;
