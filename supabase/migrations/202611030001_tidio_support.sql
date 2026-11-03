-- Tidio support metadata is limited to verified webhook event identifiers and statuses.
create table if not exists public.dg_tidio_webhook_events(
 webhook_id uuid primary key,
 topic text not null,
 contact_id uuid,
 ticket_id bigint,
 status text,
 assigned_operator_id uuid,
 assigned_department_id uuid,
 occurred_at timestamptz not null,
 reason text,
 received_at timestamptz not null default now()
);
create index if not exists dg_tidio_events_contact_recent_idx on public.dg_tidio_webhook_events(contact_id,occurred_at desc) where contact_id is not null;
create index if not exists dg_tidio_events_received_idx on public.dg_tidio_webhook_events(received_at desc);
alter table public.dg_tidio_webhook_events enable row level security;
revoke all on public.dg_tidio_webhook_events from anon,authenticated;
grant all on public.dg_tidio_webhook_events to service_role;

insert into public.dg_admin_roles(name,permissions)
values('support_agent',array['support'])
on conflict(name) do update set permissions=case
 when 'support'=any(dg_admin_roles.permissions) then dg_admin_roles.permissions
 else array_append(dg_admin_roles.permissions,'support')
end;
update public.dg_admin_roles set permissions=case
 when 'support'=any(permissions) then permissions
 else array_append(permissions,'support')
end where name='super_admin';
