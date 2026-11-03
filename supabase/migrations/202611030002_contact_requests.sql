create table if not exists public.dg_contact_requests(
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 2 and 120),
 email text not null check(length(email) between 3 and 254),
 order_number text check(order_number is null or length(order_number)<=100),
 subject text not null check(length(subject) between 3 and 180),
 message text not null check(length(message) between 10 and 5000),
 status text not null default 'new' check(status in ('new','in_progress','resolved')),
 tidio_contact_id uuid,
 tidio_conversation_url text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists dg_contact_requests_recent_idx on public.dg_contact_requests(created_at desc);
create index if not exists dg_contact_requests_status_recent_idx on public.dg_contact_requests(status,created_at desc);
alter table public.dg_contact_requests enable row level security;
revoke all on public.dg_contact_requests from public,anon,authenticated;
grant all on public.dg_contact_requests to service_role;
