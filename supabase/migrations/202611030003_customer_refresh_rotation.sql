alter table public.dg_customer_accounts
 add column if not exists session_status text not null default 'connected',
 add column if not exists token_updated_at timestamptz not null default now(),
 add column if not exists refresh_lease_owner uuid,
 add column if not exists refresh_lease_until timestamptz,
 add column if not exists refresh_attempts integer not null default 0,
 add column if not exists refresh_attempted_at timestamptz;

do $$ begin
 if not exists(select 1 from pg_constraint where conrelid='public.dg_customer_accounts'::regclass and conname='dg_customer_accounts_session_status_check') then
  alter table public.dg_customer_accounts add constraint dg_customer_accounts_session_status_check check(session_status in ('connected','reauth_required'));
 end if;
 if not exists(select 1 from pg_constraint where conrelid='public.dg_customer_accounts'::regclass and conname='dg_customer_accounts_refresh_attempts_check') then
  alter table public.dg_customer_accounts add constraint dg_customer_accounts_refresh_attempts_check check(refresh_attempts>=0);
 end if;
end $$;

create or replace function public.dg_acquire_customer_refresh_lease(p_user_id uuid,p_owner uuid,p_lease_seconds integer)
returns integer language plpgsql security definer set search_path=public as $$
declare attempt integer;
begin
 update public.dg_customer_accounts
 set refresh_lease_owner=p_owner,
     refresh_lease_until=now()+make_interval(secs=>greatest(30,least(p_lease_seconds,180))),
     refresh_attempts=refresh_attempts+1,
     refresh_attempted_at=now()
 where user_id=p_user_id
   and session_status='connected'
   and (refresh_lease_until is null or refresh_lease_until<now())
 returning refresh_attempts into attempt;
 return attempt;
end;
$$;

create or replace function public.dg_save_customer_refresh(p_user_id uuid,p_owner uuid,p_ciphertext text,p_expires_at timestamptz)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 update public.dg_customer_accounts
 set ciphertext=p_ciphertext,
     expires_at=p_expires_at,
     token_updated_at=now(),
     refresh_lease_owner=null,
     refresh_lease_until=null,
     updated_at=now()
 where user_id=p_user_id
   and refresh_lease_owner=p_owner
   and session_status='connected';
 return found;
end;
$$;

create or replace function public.dg_require_customer_reauth(p_user_id uuid,p_owner uuid)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 update public.dg_customer_accounts
 set session_status='reauth_required',
     refresh_lease_owner=null,
     refresh_lease_until=null,
     updated_at=now()
 where user_id=p_user_id
   and refresh_lease_owner=p_owner
   and session_status='connected';
 return found;
end;
$$;

create or replace function public.dg_release_customer_refresh_lease(p_user_id uuid,p_owner uuid)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 update public.dg_customer_accounts
 set refresh_lease_owner=null,
     refresh_lease_until=null
 where user_id=p_user_id
   and refresh_lease_owner=p_owner;
 return found;
end;
$$;

revoke all on function public.dg_acquire_customer_refresh_lease(uuid,uuid,integer) from public,anon,authenticated;
revoke all on function public.dg_save_customer_refresh(uuid,uuid,text,timestamptz) from public,anon,authenticated;
revoke all on function public.dg_require_customer_reauth(uuid,uuid) from public,anon,authenticated;
revoke all on function public.dg_release_customer_refresh_lease(uuid,uuid) from public,anon,authenticated;
grant execute on function public.dg_acquire_customer_refresh_lease(uuid,uuid,integer) to service_role;
grant execute on function public.dg_save_customer_refresh(uuid,uuid,text,timestamptz) to service_role;
grant execute on function public.dg_require_customer_reauth(uuid,uuid) to service_role;
grant execute on function public.dg_release_customer_refresh_lease(uuid,uuid) to service_role;
