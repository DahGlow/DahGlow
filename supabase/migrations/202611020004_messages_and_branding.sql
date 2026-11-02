-- Real customer notifications and additive admin storage permissions.
-- This migration does not change or remove existing user data.

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('dg-branding','dg-branding',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create table if not exists public.dg_messages(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.user_profiles(id) on delete cascade,
 event_key text not null,
 category text not null check(category in ('order','benefit','promo','notice')),
 title text not null,body text not null,href text,read_at timestamptz,created_at timestamptz not null default now(),
 unique(user_id,event_key)
);
alter table public.dg_messages enable row level security;
create index if not exists dg_messages_user_recent_idx on public.dg_messages(user_id,created_at desc);
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='dg_messages' and policyname='authenticated_select_own_messages') then
  -- Customers can only read their own notifications.
  create policy authenticated_select_own_messages on public.dg_messages for select to authenticated using(user_id=auth.uid());
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='dg_messages' and policyname='authenticated_update_own_message_read_state') then
  -- Column-level privileges below restrict this policy to marking messages read.
  create policy authenticated_update_own_message_read_state on public.dg_messages for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
 end if;
 if not exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='authenticated_insert_product_branding') then
  -- Product admins may upload branding images; existing policies remain intact.
  create policy authenticated_insert_product_branding on storage.objects for insert to authenticated with check(bucket_id='dg-branding' and public.dg_has_permission('products'));
 end if;
end $$;
revoke insert,delete,update on public.dg_messages from anon,authenticated;
grant select on public.dg_messages to authenticated;
grant update(read_at) on public.dg_messages to authenticated;
grant all on public.dg_messages to service_role;
