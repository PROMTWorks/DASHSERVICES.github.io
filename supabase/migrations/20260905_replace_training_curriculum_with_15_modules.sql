-- DASH MOBILE SERVICES — 15-module employee training curriculum
-- Keeps the training schema intact and makes the agreed 15 modules the active path.

update public.employee_training_catalog
set active = false
where title not in (
  'DASH Commercial','Company Orientation','Customer Service','Communication & Teamwork','Safety',
  'Attendance, Reliability & Accountability','Professional Conduct & Confidentiality',
  'Customer Property & Trust','Job Documentation & Recordkeeping','Company Vehicles & Equipment',
  'Core Automotive Services','Lawn & Property Care','Moving Services','Trash & Junk Removal','Garage Cleaning'
);

insert into public.employee_training_catalog (title, description, required, validity_days, active)
values
('DASH Commercial','Watch the official DASH commercial and learn the company mission, services, and customer promise.',true,null,true),
('Company Orientation','Company structure, expectations, workplace basics, policies, and what it means to represent DASH.',true,null,true),
('Customer Service','Professional customer communication, service expectations, complaints, property care, and completion standards.',true,null,true),
('Communication & Teamwork','Clear communication, teamwork, handoffs, problem-solving, and working effectively with customers and coworkers.',true,null,true),
('Safety','Core safety practices, PPE awareness, incident reporting, and safe job-site conduct.',true,null,true),
('Attendance, Reliability & Accountability','Attendance expectations, punctuality, dependability, communication, and accountability.',true,null,true),
('Professional Conduct & Confidentiality','Professional behavior, confidentiality, customer information, workplace conduct, and company expectations.',true,null,true),
('Customer Property & Trust','Respecting customer homes, vehicles, belongings, access information, privacy, and maintaining customer trust.',true,null,true),
('Job Documentation & Recordkeeping','Accurate job notes, photos, service records, completion documentation, and reporting requirements.',true,null,true),
('Company Vehicles & Equipment','Safe and responsible use, inspection, care, security, and reporting of DASH vehicles and equipment.',true,null,true),
('Core Automotive Services','Introduction to DASH automotive services, service standards, customer expectations, and safe work practices.',true,null,true),
('Lawn & Property Care','Introduction to DASH lawn and property-care services, equipment awareness, property protection, and service standards.',true,null,true),
('Moving Services','Introduction to DASH moving services, safe lifting, customer property protection, loading practices, and service standards.',true,null,true),
('Trash & Junk Removal','Introduction to DASH trash and junk removal, sorting, lifting, property protection, and disposal-service standards.',true,null,true),
('Garage Cleaning','Introduction to DASH garage-cleaning services, safe cleaning practices, organization, property protection, and completion standards.',true,null,true)
on conflict (title) do update set description=excluded.description, required=true, active=true;

-- Reset per-employee progress so the new 15-module curriculum is a fresh training path.
delete from public.employee_training_records
where training_name not in (
  'DASH Commercial','Company Orientation','Customer Service','Communication & Teamwork','Safety',
  'Attendance, Reliability & Accountability','Professional Conduct & Confidentiality',
  'Customer Property & Trust','Job Documentation & Recordkeeping','Company Vehicles & Equipment',
  'Core Automotive Services','Lawn & Property Care','Moving Services','Trash & Junk Removal','Garage Cleaning'
);

insert into public.employee_training_records (employee_id, training_name, status, owner_validation_status)
select ep.id, m.title, 'pending', 'NOT_PASSED'
from public.employee_profiles ep
cross join (
  values
  ('DASH Commercial'),('Company Orientation'),('Customer Service'),('Communication & Teamwork'),('Safety'),
  ('Attendance, Reliability & Accountability'),('Professional Conduct & Confidentiality'),
  ('Customer Property & Trust'),('Job Documentation & Recordkeeping'),('Company Vehicles & Equipment'),
  ('Core Automotive Services'),('Lawn & Property Care'),('Moving Services'),('Trash & Junk Removal'),('Garage Cleaning')
) as m(title)
where not exists (
  select 1 from public.employee_training_records r
  where r.employee_id=ep.id and r.training_name=m.title
);

update public.employee_training_records
set status='pending', completed_at=null, expires_at=null, notes=null,
    owner_validation_status='NOT_PASSED', owner_validated_at=null,
    owner_validated_by=null, owner_validation_notes=null
where training_name in (
  'DASH Commercial','Company Orientation','Customer Service','Communication & Teamwork','Safety',
  'Attendance, Reliability & Accountability','Professional Conduct & Confidentiality',
  'Customer Property & Trust','Job Documentation & Recordkeeping','Company Vehicles & Equipment',
  'Core Automotive Services','Lawn & Property Care','Moving Services','Trash & Junk Removal','Garage Cleaning'
);