-- Dah Glow affiliate program: private identities, saved picks, last-click attribution and verified USD earnings.

create table if not exists public.dg_affiliate_program(
 id boolean primary key default true check(id),
 enabled boolean not null default false,
 commission_rate numeric(6,5) check(commission_rate between 0 and 1),
 returning_rate numeric(6,5) check(returning_rate between 0 and 1),
 payout_enabled boolean not null default false,
 rules_version text not null default '2026-11-03',
 updated_at timestamptz not null default now()
);
insert into public.dg_affiliate_program(id) values(true) on conflict(id) do nothing;
create table if not exists public.dg_affiliates(
 user_id uuid primary key references public.user_profiles(id) on delete cascade,
 affiliate_id text not null unique default ('DG'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
 referral_code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
 display_name text not null,
 categories text[] not null default '{}',
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create table if not exists public.dg_affiliate_picks(
 user_id uuid not null references public.user_profiles(id) on delete cascade,
 product_handle text not null check(length(product_handle) between 1 and 255),
 created_at timestamptz not null default now(),
 primary key(user_id,product_handle)
);
create table if not exists public.dg_affiliate_social(
 user_id uuid not null references public.user_profiles(id) on delete cascade,
 provider text not null check(provider in ('tiktok','facebook','instagram','x','youtube')),
 profile_url text not null check(length(profile_url)<=2048),
 verified boolean not null default false,
 updated_at timestamptz not null default now(),
 primary key(user_id,provider)
);
create table if not exists public.dg_affiliate_links(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.user_profiles(id) on delete cascade,
 target_path text not null,
 created_at timestamptz not null default now(),
 unique(user_id,target_path)
);
create table if not exists public.dg_affiliate_visits(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.user_profiles(id) on delete cascade,
 visitor_key uuid not null,
 visitor_user_id uuid references public.user_profiles(id) on delete set null,
 source text not null check(source in ('link','code')),
 target_path text not null,
 product_handles text[] not null default '{}',
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now()+interval '24 hours')
);
create index if not exists dg_affiliate_visits_user_time_idx on public.dg_affiliate_visits(user_id,created_at desc);
create index if not exists dg_affiliate_visits_visitor_idx on public.dg_affiliate_visits(visitor_key,created_at desc);
create table if not exists public.dg_affiliate_earnings(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.user_profiles(id) on delete cascade,
 order_id text not null unique,
 order_name text not null,
 visit_id uuid not null references public.dg_affiliate_visits(id),
 customer_id text,
 revenue numeric(14,2) not null check(revenue>=0),
 commission numeric(14,2) not null check(commission between 0 and 100),
 rate numeric(6,5) not null check(rate between 0 and 1),
 status text not null check(status in ('pending','available','disqualified')),
 delivered_at timestamptz,
 available_at timestamptz,
 reason text,
 created_at timestamptz not null,
 updated_at timestamptz not null default now()
);
create index if not exists dg_affiliate_earnings_user_time_idx on public.dg_affiliate_earnings(user_id,created_at desc);
create table if not exists public.dg_affiliate_withdrawals(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.user_profiles(id) on delete cascade,
 amount numeric(14,2) not null check(amount>=20),
 status text not null default 'requested' check(status in ('requested','processing','paid','rejected')),
 payout_reference text,
 tax_verified boolean not null default false,
 payment_verified boolean not null default false,
 created_at timestamptz not null default now()
);
alter table public.dg_affiliate_program enable row level security;
alter table public.dg_affiliates enable row level security;
alter table public.dg_affiliate_picks enable row level security;
alter table public.dg_affiliate_social enable row level security;
alter table public.dg_affiliate_links enable row level security;
alter table public.dg_affiliate_visits enable row level security;
alter table public.dg_affiliate_earnings enable row level security;
alter table public.dg_affiliate_withdrawals enable row level security;
revoke all on public.dg_affiliate_program,public.dg_affiliates,public.dg_affiliate_picks,public.dg_affiliate_social,public.dg_affiliate_links,public.dg_affiliate_visits,public.dg_affiliate_earnings,public.dg_affiliate_withdrawals from public,anon,authenticated;
grant all on public.dg_affiliate_program,public.dg_affiliates,public.dg_affiliate_picks,public.dg_affiliate_social,public.dg_affiliate_links,public.dg_affiliate_visits,public.dg_affiliate_earnings,public.dg_affiliate_withdrawals to service_role;
-- Browser reads are own-user only; all mutations go through the authenticated Edge Function.
grant select on public.dg_affiliates,public.dg_affiliate_picks,public.dg_affiliate_social,public.dg_affiliate_links,public.dg_affiliate_earnings,public.dg_affiliate_withdrawals to authenticated;
do $$ declare t text; begin
 foreach t in array array['dg_affiliates','dg_affiliate_picks','dg_affiliate_social','dg_affiliate_links','dg_affiliate_earnings','dg_affiliate_withdrawals'] loop
 if not exists(select 1 from pg_policies where schemaname='public' and tablename=t and policyname='authenticated_select_own_'||t) then
 execute format('create policy %I on public.%I for select to authenticated using(user_id=auth.uid())','authenticated_select_own_'||t,t);
 end if; end loop;
end $$;
-- The database serializes a beneficiary's order ledger, applies caps in Pacific Time and rejects stale attribution.
create or replace function public.dg_record_affiliate_order(p_visit_id uuid,p_order_id text,p_order_name text,p_customer_id text,p_created_at timestamptz,p_revenue numeric,p_rate numeric,p_delivered_at timestamptz,p_disqualified boolean)
returns void language plpgsql security definer set search_path=public as $$
declare v public.dg_affiliate_visits; old public.dg_affiliate_earnings; total numeric; fee numeric; begin
 select * into v from public.dg_affiliate_visits where id=p_visit_id;
 if not found or p_created_at<v.created_at or p_created_at>v.expires_at then return; end if;
 if exists(select 1 from public.dg_affiliate_visits where visitor_key=v.visitor_key and created_at>v.created_at and created_at<=p_created_at) then return; end if;
 perform pg_advisory_xact_lock(hashtextextended(v.user_id::text,0));
 select * into old from public.dg_affiliate_earnings where order_id=p_order_id;
 if found then
 update public.dg_affiliate_earnings set status=case when p_disqualified then 'disqualified' when coalesce(old.available_at,p_delivered_at+interval '45 days')<=now() then 'available' else status end,
 delivered_at=coalesce(delivered_at,p_delivered_at),available_at=coalesce(available_at,p_delivered_at+interval '45 days'),reason=case when p_disqualified then 'Cancelled, returned or refunded order' else reason end,updated_at=now() where order_id=p_order_id;
 return;
 end if;
 if p_rate is null or p_rate<=0 or p_disqualified then return; end if;
 select coalesce(sum(commission),0) into total from public.dg_affiliate_earnings where user_id=v.user_id and status<>'disqualified' and date_trunc('month',created_at at time zone 'America/Los_Angeles')=date_trunc('month',p_created_at at time zone 'America/Los_Angeles');
 fee=round(least(100,greatest(0,100000-total),greatest(0,p_revenue)*p_rate),2);
 insert into public.dg_affiliate_earnings(user_id,order_id,order_name,visit_id,customer_id,revenue,commission,rate,status,delivered_at,available_at,created_at)
 values(v.user_id,p_order_id,p_order_name,p_visit_id,p_customer_id,greatest(0,p_revenue),fee,p_rate,case when p_delivered_at+interval '45 days'<=now() then 'available' else 'pending' end,p_delivered_at,p_delivered_at+interval '45 days',p_created_at) on conflict(order_id) do nothing;
end $$;
create or replace function public.dg_verify_affiliate_earnings(p_user_id uuid)
returns void language plpgsql security definer set search_path=public as $$ begin
 update public.dg_affiliate_earnings set status='available',updated_at=now() where user_id=p_user_id and status='pending' and available_at<=now();
end $$;
revoke all on function public.dg_record_affiliate_order(uuid,text,text,text,timestamptz,numeric,numeric,timestamptz,boolean),public.dg_verify_affiliate_earnings(uuid) from public,anon,authenticated;
grant execute on function public.dg_record_affiliate_order(uuid,text,text,text,timestamptz,numeric,numeric,timestamptz,boolean),public.dg_verify_affiliate_earnings(uuid) to service_role;
