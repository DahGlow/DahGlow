-- Dah Glow Shopify support. Applied to OnSpace Cloud during this session.
-- All sensitive token values are AES-GCM encrypted in Edge Functions, never stored in plaintext.

create table if not exists public.dg_shopify_tokens (shop text primary key, ciphertext text, expires_at timestamptz, refreshed_at timestamptz, status text not null default 'uninitialized', scopes text, lease_owner uuid, lease_until timestamptz);
create table if not exists public.dg_shopify_cache (cache_key text primary key, payload jsonb not null, expires_at timestamptz not null);
create table if not exists public.dg_webhook_events (event_id text primary key, topic text not null, shop text not null, status text not null default 'pending', attempts integer not null default 1, received_at timestamptz not null default now(), processed_at timestamptz, lease_until timestamptz, error text);
create table if not exists public.dg_customer_accounts (user_id uuid primary key references public.user_profiles(id) on delete cascade, customer_id text unique not null, ciphertext text not null, expires_at timestamptz not null, updated_at timestamptz not null default now());
create table if not exists public.dg_customer_flows (state text primary key, user_id uuid not null references public.user_profiles(id) on delete cascade, ciphertext text not null, expires_at timestamptz not null);
create table if not exists public.dg_orders (id text primary key, customer_id text not null, user_id uuid references public.user_profiles(id) on delete cascade, order_number text not null, payload jsonb not null, updated_at timestamptz not null default now());
create index if not exists dg_orders_customer_idx on public.dg_orders(customer_id);
create table if not exists public.dg_order_preferences (user_id uuid not null references public.user_profiles(id) on delete cascade, order_id text not null references public.dg_orders(id), archived boolean not null default false, primary key(user_id, order_id));
create table if not exists public.dg_wishlists (user_id uuid not null references public.user_profiles(id) on delete cascade, product_handle text not null, created_at timestamptz not null default now(), primary key(user_id, product_handle));
create table if not exists public.dg_coupons (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.user_profiles(id) on delete cascade, code text not null, description text not null, expires_at timestamptz, used_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.dg_points (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.user_profiles(id) on delete cascade, amount integer not null, description text not null, kind text not null check(kind in ('earned','used','expired')), created_at timestamptz not null default now());
-- Private server tables: RLS enabled, no browser policies, explicit browser grant revocation.
alter table public.dg_shopify_tokens enable row level security;
alter table public.dg_shopify_cache enable row level security;
alter table public.dg_webhook_events enable row level security;
alter table public.dg_customer_accounts enable row level security;
alter table public.dg_customer_flows enable row level security;
revoke all on public.dg_shopify_tokens, public.dg_shopify_cache, public.dg_webhook_events, public.dg_customer_accounts, public.dg_customer_flows from anon, authenticated;
grant all on public.dg_shopify_tokens, public.dg_shopify_cache, public.dg_webhook_events, public.dg_customer_accounts, public.dg_customer_flows to service_role;
alter table public.dg_orders enable row level security;
alter table public.dg_order_preferences enable row level security;
alter table public.dg_wishlists enable row level security;
alter table public.dg_coupons enable row level security;
alter table public.dg_points enable row level security;
-- Repeatable policies, one policy for each permitted operation.
do $$ begin
if not exists(select 1 from pg_policies where schemaname='public' and policyname='authenticated_select_own_shopify_orders') then
create policy authenticated_select_own_shopify_orders on public.dg_orders for select to authenticated using(user_id=auth.uid());
create policy authenticated_select_own_order_preferences on public.dg_order_preferences for select to authenticated using(user_id=auth.uid());
create policy authenticated_insert_own_order_preferences on public.dg_order_preferences for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.dg_orders where id=order_id and user_id=auth.uid()));
create policy authenticated_update_own_order_preferences on public.dg_order_preferences for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy authenticated_select_own_wishlist on public.dg_wishlists for select to authenticated using(user_id=auth.uid());
create policy authenticated_insert_own_wishlist on public.dg_wishlists for insert to authenticated with check(user_id=auth.uid());
create policy authenticated_delete_own_wishlist on public.dg_wishlists for delete to authenticated using(user_id=auth.uid());
create policy authenticated_select_own_coupons on public.dg_coupons for select to authenticated using(user_id=auth.uid());
create policy authenticated_select_own_points on public.dg_points for select to authenticated using(user_id=auth.uid());
end if; end $$;
-- Cross-instance lease for secure Admin token refreshes.
create or replace function public.dg_acquire_token_lease(p_shop text,p_owner uuid) returns boolean language plpgsql security definer set search_path=public as $$
begin
insert into dg_shopify_tokens(shop) values(p_shop) on conflict do nothing;
update dg_shopify_tokens set lease_owner=p_owner,lease_until=now()+interval '45 seconds' where shop=p_shop and (lease_until is null or lease_until<now());
return found;
end; $$;
revoke all on function public.dg_acquire_token_lease(text,uuid) from public,anon,authenticated;
grant execute on function public.dg_acquire_token_lease(text,uuid) to service_role;
-- Cross-instance webhook event deduplication and abandoned-lease recovery.
create or replace function public.dg_claim_webhook(p_id text,p_topic text,p_shop text) returns boolean language plpgsql security definer set search_path=public as $$
begin
insert into dg_webhook_events(event_id,topic,shop,status,lease_until) values(p_id,p_topic,p_shop,'processing',now()+interval '60 seconds') on conflict do nothing;
if found then return true; end if;
update dg_webhook_events set status='processing',attempts=attempts+1,lease_until=now()+interval '60 seconds' where event_id=p_id and status!='processed' and (lease_until is null or lease_until<now());
return found;
end; $$;
revoke all on function public.dg_claim_webhook(text,text,text) from public,anon,authenticated;
grant execute on function public.dg_claim_webhook(text,text,text) to service_role;
