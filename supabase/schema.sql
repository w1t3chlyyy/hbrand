create table if not exists products (
  id bigint generated always as identity primary key,
  title text not null,
  category text default 'Футболки',
  price int default 0,
  description text default '',
  image text default '',
  video text default '',
  published boolean default false,
  is_new boolean default false,
  sort int default 0,
  created_at timestamptz default now()
);
create table if not exists settings (key text primary key, value jsonb not null);
create table if not exists leads (
  id bigint generated always as identity primary key,
  name text, phone text, note text,
  source text default 'site',
  done boolean default false,
  created_at timestamptz default now()
);
create table if not exists bot_state (chat_id bigint primary key, state jsonb);

alter table products enable row level security;
alter table settings enable row level security;
alter table leads enable row level security;
alter table bot_state enable row level security;

-- сайт (anon) только читает опубликованное; всё остальное — через service_role в API/боте
create policy "read published products" on products for select using (published);
create policy "read settings" on settings for select using (true);

insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
create policy "read media" on storage.objects for select using (bucket_id = 'media');

insert into settings values ('novelty',
 '{"active":true,"title":"Fireside","subtitle":"COLLECTION","text":"Новая партия уже в наличии.","image":""}')
on conflict (key) do nothing;
