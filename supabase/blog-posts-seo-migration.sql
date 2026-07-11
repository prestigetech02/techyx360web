-- Add SEO fields to blog posts (run on existing Supabase projects)
alter table public.blog_posts
  add column if not exists meta_description text,
  add column if not exists meta_keywords text[] not null default '{}';
