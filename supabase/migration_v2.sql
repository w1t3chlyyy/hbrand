-- Выполнить один раз в Supabase SQL Editor (после migration_outfit.sql)
create table if not exists outfit_looks (
  id bigint generated always as identity primary key,
  title text default 'Образ',
  price int default 0,
  image text default '',
  published boolean default true,
  sort int default 0,
  created_at timestamptz default now()
);
alter table outfit_looks enable row level security;
create policy "read published looks" on outfit_looks for select using (published);

insert into settings values ('site', '{"homeHero":"","newHero":"","builderHero":""}') on conflict (key) do nothing;
