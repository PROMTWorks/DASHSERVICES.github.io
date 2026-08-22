-- DASH Mobile Services owner management backend systems.
-- Applied to the connected Supabase project before this migration file was committed.

alter table public.supply_restock_requests
  add column if not exists current_stock_at_request numeric,
  add column if not exists minimum_stock_at_request numeric,
  add column if not exists target_stock_at_request numeric,
  add column if not exists recommended_quantity numeric,
  add column if not exists timing_class text check (timing_class is null or timing_class in ('early','appropriate','late','unknown'));

create or replace function public.capture_supply_request_snapshot()
returns trigger language plpgsql security definer set search_path=public as $$
declare s public.supply_items%rowtype;
begin
 select * into s from public.supply_items where id=new.supply_item_id;
 new.current_stock_at_request:=coalesce(s.current_stock,0);
 new.minimum_stock_at_request:=coalesce(s.minimum_stock,0);
 new.target_stock_at_request:=coalesce(s.reorder_quantity,0);
 new.recommended_quantity:=greatest(coalesce(s.reorder_quantity,0)-coalesce(s.current_stock,0),0);
 new.timing_class:=case when s.id is null then 'unknown' when s.current_stock<=greatest(s.minimum_stock*.5,0) then 'late' when s.current_stock<=s.minimum_stock then 'appropriate' when s.current_stock>greatest(s.minimum_stock*2,s.reorder_quantity) then 'early' else 'appropriate' end;
 return new;
end;$$;
drop trigger if exists trg_supply_request_snapshot on public.supply_restock_requests;
create trigger trg_supply_request_snapshot before insert on public.supply_restock_requests for each row execute function public.capture_supply_request_snapshot();

create table if not exists public.employee_role_history(id uuid primary key default gen_random_uuid(),employee_id text not null,role text not null,start_date date not null,end_date date,notes text,created_by uuid references auth.users(id),created_at timestamptz not null default now());
alter table public.employee_role_history enable row level security;
create policy if not exists employee_role_history_owner_all on public.employee_role_history for all to authenticated using (exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active)) with check (exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active));

create table if not exists public.employee_performance_scores(id uuid primary key default gen_random_uuid(),employee_id text not null,role_period text not null check(role_period in('regular_employee','manager','other')),period_start date,period_end date,job_performance integer check(job_performance between 0 and 100),attendance integer check(attendance between 0 and 100),customer_satisfaction integer check(customer_satisfaction between 0 and 100),job_quality integer check(job_quality between 0 and 100),productivity integer check(productivity between 0 and 100),equipment_material_care integer check(equipment_material_care between 0 and 100),training_improvement integer check(training_improvement between 0 and 100),manager_feedback integer check(manager_feedback between 0 and 100),overall_rating integer check(overall_rating between 0 and 100),obvious_issues jsonb not null default '[]'::jsonb,owner_notes text,created_by uuid references auth.users(id),created_at timestamptz not null default now());
alter table public.employee_performance_scores enable row level security;
create policy if not exists employee_performance_scores_owner_all on public.employee_performance_scores for all to authenticated using (exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active)) with check (exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active));

create table if not exists public.employee_complaints(id uuid primary key default gen_random_uuid(),employee_id text not null,source text not null check(source in('customer','employee','owner_operations')),category text not null,description text not null,severity text not null default 'moderate' check(severity in('minor','moderate','serious')),related_job_id uuid,determination text not null default 'still_reviewing' check(determination in('confirmed','not_confirmed','unfounded','still_reviewing')),action_taken text,resolution text,owner_notes text,created_by uuid references auth.users(id),created_at timestamptz not null default now(),resolved_at timestamptz);
alter table public.employee_complaints enable row level security;
create policy if not exists employee_complaints_owner_all on public.employee_complaints for all to authenticated using (exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active)) with check (exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active));

create table if not exists public.employee_reports(id uuid primary key default gen_random_uuid(),submitted_by uuid not null references auth.users(id),subject_employee_id text,subject_manager_id text,category text not null check(category in('scheduling','workplace_behavior','safety','harassment_bullying','customer_issue','pay_timekeeping','policy','other')),description text not null,event_date date,location_or_job text,immediate_owner_attention boolean not null default false,status text not null default 'owner_review' check(status in('owner_review','investigating','confirmed','not_confirmed','unfounded','resolved')),owner_notes text,created_at timestamptz not null default now(),resolved_at timestamptz);
alter table public.employee_reports enable row level security;
create policy if not exists employee_reports_submitter_insert on public.employee_reports for insert to authenticated with check(submitted_by=auth.uid());
create policy if not exists employee_reports_owner_select on public.employee_reports for select to authenticated using(submitted_by=auth.uid() or exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active));
create policy if not exists employee_reports_owner_update on public.employee_reports for update to authenticated using(exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active)) with check(exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active));

create or replace function public.get_owner_management_dashboard() returns jsonb language plpgsql security definer set search_path=public as $$
declare result jsonb; is_owner boolean;
begin
 select exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active) into is_owner;
 if not is_owner then raise exception 'Owner access required'; end if;
 select jsonb_build_object(
 'owner_attention',coalesce((select jsonb_agg(to_jsonb(x)) from(select id,severity,category,title,description,created_at from public.owner_attention_items where not resolved order by case severity when 'urgent' then 1 when 'routine' then 2 else 3 end,created_at desc limit 50)x),'[]'::jsonb),
 'inventory',coalesce((select jsonb_agg(to_jsonb(x)) from(select id,name,category,unit,current_stock,minimum_stock,target_stock,maximum_stock,average_daily_usage from public.inventory_items where active order by category,name)x),'[]'::jsonb),
 'supply_requests',coalesce((select jsonb_agg(to_jsonb(x)) from(select r.id,i.name supply_name,i.category,i.unit_label,r.quantity,r.reason,r.status,r.created_at,r.current_stock_at_request,r.minimum_stock_at_request,r.target_stock_at_request,r.recommended_quantity,r.timing_class,l.name location from public.supply_restock_requests r join public.supply_items i on i.id=r.supply_item_id join public.supply_locations l on l.id=r.location_id order by case r.status when 'pending' then 1 when 'approved' then 2 else 3 end,r.created_at desc limit 100)x),'[]'::jsonb),
 'jobs',coalesce((select jsonb_agg(to_jsonb(x)) from(select id,service_name,service_location,status,estimated_revenue,estimated_direct_cost,estimated_overhead,actual_revenue,actual_direct_cost,actual_overhead,completed_at from public.business_jobs order by created_at desc limit 100)x),'[]'::jsonb),
 'customers',coalesce((select jsonb_agg(to_jsonb(x)) from(select c.id,c.name,c.last_service_at,c.expected_next_service_at,coalesce((select sum(j.actual_revenue) from public.business_jobs j where j.customer_id=c.id),0) revenue from public.customers c order by c.name limit 100)x),'[]'::jsonb),
 'fleet',coalesce((select jsonb_agg(to_jsonb(x)) from(select id,asset_type,name,identifier,current_mileage,next_service_mileage,next_service_date,status from public.fleet_assets order by name)x),'[]'::jsonb),
 'training',coalesce((select jsonb_agg(to_jsonb(x)) from(select t.id,e.employee_id,e.first_name,e.last_name,t.trigger_type,t.reason,t.completed,t.created_at from public.employee_training_events t left join public.employees e on e.auth_user_id=t.employee_id order by t.created_at desc limit 100)x),'[]'::jsonb),
 'performance',coalesce((select jsonb_agg(to_jsonb(x)) from(select p.employee_id,p.role_period,p.period_start,p.period_end,p.overall_rating,p.job_performance,p.attendance,p.customer_satisfaction,p.job_quality,p.productivity,p.equipment_material_care,p.training_improvement,p.manager_feedback,p.obvious_issues from public.employee_performance_scores p order by p.overall_rating asc nulls first,p.created_at desc limit 100)x),'[]'::jsonb),
 'complaints',coalesce((select jsonb_agg(to_jsonb(x)) from(select c.*,e.first_name,e.last_name from public.employee_complaints c left join public.employees e on e.employee_id=c.employee_id order by c.created_at desc limit 100)x),'[]'::jsonb),
 'employee_reports',coalesce((select jsonb_agg(to_jsonb(x)) from(select r.*,e.first_name,e.last_name from public.employee_reports r left join public.employees e on e.auth_user_id=r.submitted_by order by r.immediate_owner_attention desc,r.created_at desc limit 100)x),'[]'::jsonb),
 'role_history',coalesce((select jsonb_agg(to_jsonb(x)) from(select h.*,e.first_name,e.last_name from public.employee_role_history h left join public.employees e on e.employee_id=h.employee_id order by h.start_date desc)x),'[]'::jsonb),
 'policy',coalesce((select to_jsonb(p) from public.employee_performance_policies p where p.owner_user_id=auth.uid() limit 1),jsonb_build_object('fireable_threshold',60,'enabled',true)),
 'financials',coalesce((select to_jsonb(f) from public.business_financials f order by f.period_year desc,f.period_month desc limit 1),'{}'::jsonb)
 ) into result; return result;
end;$$;
revoke all on function public.get_owner_management_dashboard() from public,anon;
grant execute on function public.get_owner_management_dashboard() to authenticated;

create or replace function public.update_owner_fireable_threshold(new_threshold integer) returns jsonb language plpgsql security definer set search_path=public as $$
declare is_owner boolean; row_out public.employee_performance_policies;
begin
 select exists(select 1 from public.admin_user_roles r where r.user_id=auth.uid() and r.role='SUPER_ADMIN' and r.active) into is_owner;
 if not is_owner then raise exception 'Owner access required'; end if;
 if new_threshold<0 or new_threshold>100 then raise exception 'Threshold must be between 0 and 100'; end if;
 insert into public.employee_performance_policies(owner_user_id,fireable_threshold,enabled) values(auth.uid(),new_threshold,true)
 on conflict(owner_user_id) do update set fireable_threshold=excluded.fireable_threshold,updated_at=now();
 select * into row_out from public.employee_performance_policies where owner_user_id=auth.uid(); return to_jsonb(row_out);
end;$$;
revoke all on function public.update_owner_fireable_threshold(integer) from public,anon;
grant execute on function public.update_owner_fireable_threshold(integer) to authenticated;
