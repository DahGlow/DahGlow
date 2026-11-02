-- Customer-owned browsing and contact consent. Verified purchases are backend-only writes.

create table if not exists public.dg_store_visits (user_id uuid not null references public.user_profiles(id) on delete cascade,store_id text not null references public.dg_stores(id),visited_at timestamptz not null default now(),primary key(user_id,store_id));
alter table public.dg_store_visits enable row level security;
create policy authenticated_select_own_store_visits on public.dg_store_visits for select to authenticated using(user_id=auth.uid());
create policy authenticated_insert_own_store_visits on public.dg_store_visits for insert to authenticated with check(user_id=auth.uid());
create policy authenticated_update_own_store_visits on public.dg_store_visits for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy authenticated_delete_own_store_visits on public.dg_store_visits for delete to authenticated using(user_id=auth.uid());
create table if not exists public.dg_contact_preferences(user_id uuid primary key references public.user_profiles(id) on delete cascade,email_marketing boolean not null default false,sms_marketing boolean not null default false,whatsapp_marketing boolean not null default false,rewards_reminders boolean not null default true,updated_at timestamptz not null default now());
alter table public.dg_contact_preferences enable row level security;
create policy authenticated_select_own_contact_preferences on public.dg_contact_preferences for select to authenticated using(user_id=auth.uid());
create policy authenticated_insert_own_contact_preferences on public.dg_contact_preferences for insert to authenticated with check(user_id=auth.uid());
create policy authenticated_update_own_contact_preferences on public.dg_contact_preferences for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy authenticated_delete_own_contact_preferences on public.dg_contact_preferences for delete to authenticated using(user_id=auth.uid());
create table if not exists public.dg_purchased_stores(user_id uuid not null references public.user_profiles(id) on delete cascade,store_id text not null references public.dg_stores(id),order_id text not null references public.dg_orders(id),purchased_at timestamptz not null,primary key(user_id,store_id,order_id));
alter table public.dg_purchased_stores enable row level security;
-- No client insert/update/delete policy: only trusted verification can record a purchase.
create policy authenticated_select_own_purchased_stores on public.dg_purchased_stores for select to authenticated using(user_id=auth.uid());
create index if not exists dg_store_visits_recent_idx on public.dg_store_visits(user_id,visited_at desc);
create index if not exists dg_purchased_stores_recent_idx on public.dg_purchased_stores(user_id,purchased_at desc);
