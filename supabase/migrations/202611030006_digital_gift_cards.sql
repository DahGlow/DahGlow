create table if not exists public.dg_gift_card_purchases (
  id uuid primary key default gen_random_uuid(),
  client_request_id uuid not null unique,
  request_hash text not null,
  buyer_email text not null,
  recipient_email text not null,
  recipient_name text not null,
  sender_name text not null,
  message text not null,
  design text not null,
  amount numeric(10,2) not null check (amount >= 1 and amount <= 2000),
  currency text not null default 'USD' check (currency = 'USD'),
  send_at timestamptz,
  timezone text,
  status text not null default 'requested' check (status in (
    'requested', 'checkout_creating', 'checkout_created', 'checkout_failed',
    'paid_verified', 'issuing', 'issued', 'needs_review', 'refunded'
  )),
  draft_order_id text unique,
  checkout_url text,
  order_id text unique,
  gift_card_id text unique,
  issue_attempted_at timestamptz,
  issue_attempts integer not null default 0,
  lease_owner uuid,
  lease_until timestamptz,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  issued_at timestamptz
);

create index if not exists dg_gift_card_purchases_status_idx
  on public.dg_gift_card_purchases(status, lease_until);
create index if not exists dg_gift_card_purchases_created_at_idx
  on public.dg_gift_card_purchases(created_at);

alter table public.dg_gift_card_purchases enable row level security;
revoke all on public.dg_gift_card_purchases from anon, authenticated;
grant all on public.dg_gift_card_purchases to service_role;

create or replace function public.dg_claim_gift_card_checkout(p_id uuid, p_owner uuid)
returns boolean language plpgsql security definer set search_path=public as $$
begin
  update dg_gift_card_purchases
  set status='checkout_creating', lease_owner=p_owner,
      lease_until=now()+interval '60 seconds', updated_at=now(),
      error_code=null
  where id=p_id
    and (status in ('requested','checkout_failed')
      or (status='checkout_creating' and lease_until < now()));
  return found;
end;
$$;
revoke all on function public.dg_claim_gift_card_checkout(uuid,uuid) from public,anon,authenticated;
grant execute on function public.dg_claim_gift_card_checkout(uuid,uuid) to service_role;

create or replace function public.dg_claim_gift_card_issue(p_id uuid, p_owner uuid)
returns boolean language plpgsql security definer set search_path=public as $$
begin
  update dg_gift_card_purchases
  set status='issuing', lease_owner=p_owner,
      lease_until=now()+interval '90 seconds', issue_attempts=issue_attempts+1,
      issue_attempted_at=coalesce(issue_attempted_at,now()),
      updated_at=now(), error_code=null
  where id=p_id
    and order_id is not null
    and (status='paid_verified'
      or (status='issuing' and lease_until < now()));
  return found;
end;
$$;
revoke all on function public.dg_claim_gift_card_issue(uuid,uuid) from public,anon,authenticated;
grant execute on function public.dg_claim_gift_card_issue(uuid,uuid) to service_role;
