-- =============================================================
-- Laser Estate Services — initial schema
-- Run this in Supabase Studio → SQL Editor once your project exists.
-- =============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- =============================================================
-- app_settings  (key/value config the app can read at runtime)
-- =============================================================
create table app_settings (
  key   text primary key,
  value text not null
);

-- Seed the admin email. Change this later with:
--   update app_settings set value = 'new@email.com' where key = 'admin_email';
insert into app_settings (key, value)
values ('admin_email', 'obi.anyanwu@yahoo.com')
on conflict (key) do update set value = excluded.value;

alter table app_settings enable row level security;
-- Nobody can read app_settings directly. Only SECURITY DEFINER functions access it.

-- =============================================================
-- Enums
-- =============================================================
create type property_type as enum (
  'detached_house', 'semi_detached', 'terrace', 'duplex',
  'bungalow', 'apartment', 'penthouse', 'serviced_apartment',
  'land', 'commercial', 'warehouse', 'filling_station',
  'hotel', 'event_center', 'mixed_use'
);

create type listing_type as enum ('sale', 'rent', 'lease');

create type property_status as enum ('draft', 'available', 'under_offer', 'sold', 'rented');

create type user_role as enum ('admin', 'client');

-- =============================================================
-- profiles  (linked 1:1 to auth.users)
-- =============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role user_role not null default 'client',
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup; auto-promote to admin if email matches app_settings.admin_email
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_email text;
begin
  select value into admin_email from public.app_settings where key = 'admin_email';

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when new.email = coalesce(admin_email, '') then 'admin'::user_role else 'client'::user_role end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================================
-- properties
-- =============================================================
create table properties (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  price bigint not null,                    -- Naira, no decimals
  currency text not null default 'NGN',
  listing_type listing_type not null,
  property_type property_type not null,
  status property_status not null default 'draft',
  bedrooms int,
  bathrooms int,
  toilets int,
  size_sqm numeric,
  area text not null,                       -- 'Ikoyi', 'Victoria Island', 'Banana Island', 'Lekki', ...
  address text,
  latitude numeric,
  longitude numeric,
  amenities text[] not null default '{}',
  -- Nigerian real-estate fees. All optional so land / commercial listings
  -- can leave them blank if not applicable.
  caution_deposit bigint,                    -- refundable, Naira
  agency_fee_percent numeric,                -- e.g. 10 for 10%
  legal_fee_percent numeric,                 -- e.g. 10 for 10%
  service_charge bigint,                     -- Naira per annum; NULL means "TBD"
  featured boolean not null default false,
  view_count int not null default 0,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_properties_status on properties(status);
create index idx_properties_area on properties(area);
create index idx_properties_listing_type on properties(listing_type);
create index idx_properties_price on properties(price);
create index idx_properties_featured on properties(featured) where featured = true;

-- updated_at trigger
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger properties_updated_at
  before update on properties
  for each row execute function touch_updated_at();

-- =============================================================
-- media  (images + videos, one table)
-- =============================================================
create type media_type as enum ('image', 'video');

create table media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  url text not null,                        -- Public URL (R2)
  public_id text,                           -- R2 object key, kept for later deletion
  type media_type not null default 'image',
  display_order int not null default 0,
  width int,
  height int,
  created_at timestamptz not null default now()
);

create index idx_media_property on media(property_id, display_order);

-- =============================================================
-- inquiries
-- =============================================================
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_inquiries_property on inquiries(property_id);
create index idx_inquiries_unhandled on inquiries(handled) where handled = false;

-- =============================================================
-- property_views  (dedup analytics)
-- =============================================================
create table property_views (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  session_id text not null,
  user_id uuid references profiles(id),
  viewed_at timestamptz not null default now(),
  -- Stored generated column so the dedup unique index below is immutable.
  -- Lagos time is fixed at UTC+01 (no DST) so date rollover is stable.
  viewed_date date generated always as (((viewed_at at time zone 'Africa/Lagos')::date)) stored
);

create index idx_views_property on property_views(property_id);
create unique index idx_views_dedup on property_views(property_id, session_id, viewed_date);

-- Increment cached counter on new distinct view
create or replace function bump_property_view_count()
returns trigger language plpgsql as $$
begin
  update properties set view_count = view_count + 1 where id = new.property_id;
  return new;
end;
$$;

create trigger property_views_bump
  after insert on property_views
  for each row execute function bump_property_view_count();

-- =============================================================
-- Row Level Security
-- =============================================================
alter table profiles enable row level security;
alter table properties enable row level security;
alter table media enable row level security;
alter table inquiries enable row level security;
alter table property_views enable row level security;

-- Helper: is current user admin?
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles: user reads own, admin reads all
create policy profiles_self_read on profiles for select using (auth.uid() = id or is_admin());
create policy profiles_self_update on profiles for update using (auth.uid() = id);

-- properties: anyone can read available/under_offer/sold/rented; only admin sees drafts
create policy properties_public_read on properties for select
  using (status <> 'draft' or is_admin());
create policy properties_admin_write on properties for all
  using (is_admin()) with check (is_admin());

-- media: read if property is readable; write admin only
create policy media_public_read on media for select
  using (exists (
    select 1 from properties p
    where p.id = media.property_id
      and (p.status <> 'draft' or is_admin())
  ));
create policy media_admin_write on media for all
  using (is_admin()) with check (is_admin());

-- inquiries: anyone can insert; only admin can read/update
create policy inquiries_public_insert on inquiries for insert with check (true);
create policy inquiries_admin_read on inquiries for select using (is_admin());
create policy inquiries_admin_update on inquiries for update using (is_admin());

-- property_views: anyone can insert; nobody reads except admin
create policy views_public_insert on property_views for insert with check (true);
create policy views_admin_read on property_views for select using (is_admin());

-- =============================================================
-- Table grants
-- Supabase normally installs these via default privileges; recreating the
-- schema (drop schema public cascade) wipes them, so we reapply explicitly.
-- RLS still filters what rows each role actually sees.
-- =============================================================
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert on all tables in schema public to anon;
grant usage, select on all sequences in schema public to authenticated, anon;
grant execute on all functions in schema public to authenticated, anon;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select, insert on tables to anon;
alter default privileges in schema public
  grant usage, select on sequences to authenticated, anon;
alter default privileges in schema public
  grant execute on functions to authenticated, anon;
