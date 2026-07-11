create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  author text not null default 'Techyx360 Team',
  tags text[] not null default '{}',
  featured_image text not null,
  featured_image_alt text not null,
  meta_description text,
  meta_keywords text[] not null default '{}',
  read_time_mins integer not null default 5,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_at_idx
  on public.blog_posts (published_at desc);

create index if not exists blog_posts_status_idx
  on public.blog_posts (status);

alter table public.blog_posts enable row level security;

drop policy if exists "Authenticated users can read blog posts"
  on public.blog_posts;

create policy "Authenticated users can read blog posts"
  on public.blog_posts
  for select
  to authenticated
  using (true);

drop policy if exists "Public can read published blog posts"
  on public.blog_posts;

create policy "Public can read published blog posts"
  on public.blog_posts
  for select
  to anon
  using (status = 'published');

alter table public.blog_posts replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.blog_posts;
exception
  when duplicate_object then null;
end $$;
