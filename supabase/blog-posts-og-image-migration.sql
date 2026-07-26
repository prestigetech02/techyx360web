-- Dedicated lightweight Open Graph image for social previews (WhatsApp, etc.)
alter table public.blog_posts
  add column if not exists og_image text;
