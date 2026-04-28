-- Articles table
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null unique,
  description text,
  source text,
  published_date date not null,
  archived_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.articles enable row level security;

create policy "public read" on public.articles
  for select using (true);

create policy "service role write" on public.articles
  for all using (true);

create index if not exists articles_archived_date_idx on public.articles(archived_date);

-- Users table (synced from Google OAuth)
create table if not exists public.users (
  id text primary key,
  email text not null unique,
  name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users read own" on public.users
  for select using (auth.uid()::text = id);

create policy "service role write users" on public.users
  for all using (true);

-- Article views table
create table if not exists public.article_views (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.users(id) on delete cascade,
  article_date date not null,
  viewed_at timestamptz not null default now()
);

alter table public.article_views enable row level security;

create policy "users read own views" on public.article_views
  for select using (auth.uid()::text = user_id);

create policy "users insert own views" on public.article_views
  for insert with check (auth.uid()::text = user_id);

create index if not exists article_views_user_idx on public.article_views(user_id);
create index if not exists article_views_date_idx on public.article_views(article_date);
