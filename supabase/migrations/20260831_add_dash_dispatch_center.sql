-- DASH Mobile Services: native dispatch layer.
-- Keeps dispatch state separate from existing booking/job/financial records.
create table if not exists public.dispatch_employee_status (
  employee_id text primary key references public.employees(employee_id) on delete cascade,
  status text not null default 'off_duty' check (status in ('available','on_break','en_route','on_site','working','off_duty','unavailable')),
  status_note text,
  updated_at timestamptz not null default now()
);

create table if not exists public.dispatch_assignments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.business_jobs(id) on delete cascade,
  employee_id text not null references public.employees(employee_id) on delete restrict,
  dispatch_status text not null default 'assigned' check (dispatch_status in ('assigned','accepted','en_route','on_site','working','completed','declined','cancelled')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  dispatcher_notes text,
  assigned_at timestamptz not null default now(),
  accepted_at timestamptz,
  en_route_at timestamptz,
  on_site_at timestamptz,
  working_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create unique index if not exists dispatch_one_active_assignment_per_job on public.dispatch_assignments(job_id) where dispatch_status not in ('completed','declined','cancelled');
create index if not exists dispatch_assignments_employee_idx on public.dispatch_assignments(employee_id, dispatch_status);
create index if not exists dispatch_assignments_job_idx on public.dispatch_assignments(job_id, updated_at desc);

create table if not exists public.dispatch_status_history (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.dispatch_assignments(id) on delete cascade,
  job_id uuid not null references public.business_jobs(id) on delete cascade,
  employee_id text not null references public.employees(employee_id) on delete restrict,
  old_status text,
  new_status text not null,
  note text,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists dispatch_status_history_job_idx on public.dispatch_status_history(job_id, created_at desc);

alter table public.dispatch_employee_status enable row level security;
alter table public.dispatch_assignments enable row level security;
alter table public.dispatch_status_history enable row level security;

create policy if not exists dispatch_employee_status_owner_all on public.dispatch_employee_status for all to authenticated using (exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active)) with check (exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active));
create policy if not exists dispatch_assignments_owner_all on public.dispatch_assignments for all to authenticated using (exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active)) with check (exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active));
create policy if not exists dispatch_status_history_owner_all on public.dispatch_status_history for all to authenticated using (exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active)) with check (exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active));

create or replace function public.dispatch_update_assignment_status(p_assignment_id uuid, p_status text, p_note text default null)
returns public.dispatch_assignments language plpgsql security definer set search_path=public as $$
declare a public.dispatch_assignments; old text;
begin
 if not exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active) then raise exception 'Owner access required'; end if;
 select * into a from public.dispatch_assignments where id=p_assignment_id for update;
 if a.id is null then raise exception 'Assignment not found'; end if;
 old:=a.dispatch_status;
 if p_status not in ('assigned','accepted','en_route','on_site','working','completed','declined','cancelled') then raise exception 'Invalid dispatch status'; end if;
 update public.dispatch_assignments set dispatch_status=p_status, dispatcher_notes=coalesce(p_note,dispatcher_notes), accepted_at=case when p_status='accepted' and accepted_at is null then now() else accepted_at end, en_route_at=case when p_status='en_route' and en_route_at is null then now() else en_route_at end, on_site_at=case when p_status='on_site' and on_site_at is null then now() else on_site_at end, working_at=case when p_status='working' and working_at is null then now() else working_at end, completed_at=case when p_status='completed' and completed_at is null then now() else completed_at end, updated_at=now() where id=a.id returning * into a;
 insert into public.dispatch_status_history(assignment_id,job_id,employee_id,old_status,new_status,note,changed_by) values(a.id,a.job_id,a.employee_id,old,p_status,p_note,auth.uid());
 return a;
end; $$;
revoke all on function public.dispatch_update_assignment_status(uuid,text,text) from public,anon;
grant execute on function public.dispatch_update_assignment_status(uuid,text,text) to authenticated;
