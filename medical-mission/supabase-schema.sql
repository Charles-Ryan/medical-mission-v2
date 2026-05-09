-- ============================================================
-- PILGRIM CWOP MEDICAL MISSION — SUPABASE SCHEMA
-- Run this entire script in the Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ─── PATIENTS ────────────────────────────────────────────────
create table if not exists patients (
  id              uuid primary key default uuid_generate_v4(),
  patient_number  integer not null unique,
  full_name       text not null,
  age             integer not null check (age >= 0 and age <= 150),
  gender          text not null check (gender in ('Male', 'Female')),
  contact_number  text,
  address         text,
  medical_history text,
  created_at      timestamptz not null default now()
);

create index if not exists patients_full_name_idx on patients using gin (to_tsvector('simple', full_name));
create index if not exists patients_patient_number_idx on patients (patient_number);
create index if not exists patients_contact_idx on patients (contact_number);

-- ─── SERVICES ────────────────────────────────────────────────
create table if not exists services (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  category    text not null default '',
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Seed services — names match CWOP 2026 Patient Database spreadsheet
insert into services (name, category, is_active) values
  ('Medical Adult',            'Medical',   true),
  ('Medical Pedia',            'Medical',   true),
  ('Medical Dermatology',      'Medical',   true),
  ('Dental Extraction',        'Dental',    true),
  ('Eye Screening',            'Screening', true),
  ('Physical Therapy',         'Medical',   true),
  ('Prenatal Check up',        'Medical',   true),
  ('Cervical Cancer Screening','Screening', true)
on conflict (name) do nothing;

-- ─── PATIENT SERVICES ────────────────────────────────────────
create table if not exists patient_services (
  id         uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references patients(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  logged_at  timestamptz not null default now()
);

create index if not exists ps_patient_idx on patient_services (patient_id);
create index if not exists ps_service_idx on patient_services (service_id);

-- ─── COUNSEL LOGS ─────────────────────────────────────────────
create table if not exists counsel_logs (
  id              uuid primary key default uuid_generate_v4(),
  patient_id      uuid not null references patients(id) on delete cascade,
  counsel_type    text not null check (counsel_type in ('Salvation','Baptism','Assurance','Prayer for Health')),
  counselor_name  text,
  logged_at       timestamptz not null default now()
);

create index if not exists cl_patient_idx on counsel_logs (patient_id);
create index if not exists cl_type_idx on counsel_logs (counsel_type);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
alter table patients         enable row level security;
alter table services         enable row level security;
alter table patient_services enable row level security;
alter table counsel_logs     enable row level security;

create policy "public_all_patients"         on patients         for all using (true) with check (true);
create policy "public_all_services"         on services         for all using (true) with check (true);
create policy "public_all_patient_services" on patient_services for all using (true) with check (true);
create policy "public_all_counsel_logs"     on counsel_logs     for all using (true) with check (true);

-- ─── REALTIME ────────────────────────────────────────────────
alter publication supabase_realtime add table patients;
alter publication supabase_realtime add table patient_services;
alter publication supabase_realtime add table counsel_logs;
