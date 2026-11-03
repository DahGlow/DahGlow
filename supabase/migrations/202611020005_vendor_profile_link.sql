alter table public.dg_vendor_settings
  add column if not exists profile_url text;
