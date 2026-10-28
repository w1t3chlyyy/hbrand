-- Выполнить один раз в Supabase SQL Editor (вещи для страницы «Собрать образ»)
create table if not exists outfit_items (
  id bigint generated always as identity primary key,
  kind text not null,            -- tee | jeans | trousers | bracelet
  color text not null,           -- navy | red | white | black | gray | beige | green | plum | sky
  name text default '',
  price int default 0,
  image text default '',
  published boolean default true,
  sort int default 0,
  created_at timestamptz default now()
);
alter table outfit_items enable row level security;
create policy "read published outfit items" on outfit_items for select using (published);
