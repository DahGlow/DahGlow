create or replace function public.dg_affiliate_totals(p_user_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with earnings as (
    select
      coalesce(sum(commission) filter (where status = 'available'), 0) as available,
      coalesce(sum(commission) filter (where status = 'pending'), 0) as pending,
      coalesce(sum(commission) filter (where status <> 'disqualified'), 0) as income
    from public.dg_affiliate_earnings
    where user_id = p_user_id
  ),
  paid_withdrawals as (
    select coalesce(sum(amount), 0) as total
    from public.dg_affiliate_withdrawals
    where user_id = p_user_id and status = 'paid'
  )
  select jsonb_build_object(
    'balance', greatest(earnings.available - paid_withdrawals.total, 0),
    'pending', earnings.pending,
    'income', earnings.income,
    'withdrawals', paid_withdrawals.total
  )
  from earnings cross join paid_withdrawals;
$$;

create or replace function public.dg_affiliate_stats(p_user_id uuid, p_days integer)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with period as (
    select case when p_days in (1, 7, 30) then p_days else 7 end as days
  ),
  date_range as (
    select
      (now() at time zone 'America/Los_Angeles')::date - (period.days - 1) as first_day,
      (now() at time zone 'America/Los_Angeles')::date as last_day
    from period
  ),
  visits as (
    select count(*) as total
    from public.dg_affiliate_visits, date_range
    where user_id = p_user_id
      and created_at >= date_range.first_day::timestamp at time zone 'America/Los_Angeles'
      and created_at < (date_range.last_day + 1)::timestamp at time zone 'America/Los_Angeles'
  ),
  earnings as (
    select
      count(*) filter (where status <> 'disqualified') as orders,
      coalesce(sum(revenue) filter (where status <> 'disqualified'), 0) as revenue,
      coalesce(sum(commission) filter (where status <> 'disqualified'), 0) as commission
    from public.dg_affiliate_earnings, date_range
    where user_id = p_user_id
      and created_at >= date_range.first_day::timestamp at time zone 'America/Los_Angeles'
      and created_at < (date_range.last_day + 1)::timestamp at time zone 'America/Los_Angeles'
  ),
  daily as (
    select
      dates.day,
      count(visits.id) as visits
    from date_range
    cross join lateral generate_series(date_range.first_day, date_range.last_day, interval '1 day') as dates(day)
    left join public.dg_affiliate_visits as visits
      on visits.user_id = p_user_id
      and visits.created_at >= dates.day::timestamp at time zone 'America/Los_Angeles'
      and visits.created_at < (dates.day + 1)::timestamp at time zone 'America/Los_Angeles'
    group by dates.day
    order by dates.day
  )
  select jsonb_build_object(
    'visits', visits.total,
    'orders', earnings.orders,
    'revenue', earnings.revenue,
    'commission', earnings.commission,
    'daily', coalesce(
      (select jsonb_agg(jsonb_build_object('date', daily.day, 'visits', daily.visits) order by daily.day) from daily),
      '[]'::jsonb
    )
  )
  from visits cross join earnings;
$$;

revoke all on function public.dg_affiliate_totals(uuid), public.dg_affiliate_stats(uuid, integer)
from public, anon, authenticated;
grant execute on function public.dg_affiliate_totals(uuid), public.dg_affiliate_stats(uuid, integer)
to service_role;
