-- Minimal schema for the experiment (Supabase Postgres)

create table if not exists public.experiment_data (
  id bigserial primary key,
  participant_id text not null,
  group_type text not null check (group_type in ('AI', 'Control')),
  round_number int not null check (round_number between 1 and 5),
  chosen_option text not null check (chosen_option in ('A', 'B', 'C', 'D')),
  ai_recommendation text null check (ai_recommendation in ('A', 'B', 'C', 'D')),
  follow_ai boolean not null,
  risk_level double precision not null,
  decision_time double precision not null,
  extreme_event boolean not null,
  created_at timestamptz not null default now(),
  unique (participant_id, round_number)
);

create table if not exists public.post_survey (
  id bigserial primary key,
  participant_id text not null unique,
  group_type text not null check (group_type in ('AI', 'Control')),
  trust_ai int not null check (trust_ai between 1 and 5),
  safer_follow int not null check (safer_follow between 1 and 5),
  more_professional int not null check (more_professional between 1 and 5),
  responsibility int not null check (responsibility between 1 and 5),
  created_at timestamptz not null default now()
);

-- RLS: keep it simple. For production, you likely want a controlled write policy.
alter table public.experiment_data enable row level security;
alter table public.post_survey enable row level security;

-- DEV POLICY (anonymous insert):
-- You can tighten later (e.g., via Edge Functions / server actions).
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'experiment_data' and policyname = 'anon_insert_experiment_data'
  ) then
    create policy anon_insert_experiment_data on public.experiment_data
      for insert to anon
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'experiment_data' and policyname = 'anon_update_experiment_data'
  ) then
    create policy anon_update_experiment_data on public.experiment_data
      for update to anon
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'post_survey' and policyname = 'anon_upsert_post_survey'
  ) then
    create policy anon_upsert_post_survey on public.post_survey
      for insert to anon
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'post_survey' and policyname = 'anon_update_post_survey'
  ) then
    create policy anon_update_post_survey on public.post_survey
      for update to anon
      using (true)
      with check (true);
  end if;
end $$;
