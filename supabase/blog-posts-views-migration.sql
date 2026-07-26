-- Page view counter for blog posts (admin dashboard + public tracking)
alter table public.blog_posts
  add column if not exists view_count integer not null default 0;

create or replace function public.increment_blog_post_views(post_slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  update public.blog_posts
  set view_count = view_count + 1
  where slug = post_slug
    and status = 'published'
  returning view_count into new_count;

  return coalesce(new_count, 0);
end;
$$;

revoke all on function public.increment_blog_post_views(text) from public;
grant execute on function public.increment_blog_post_views(text) to anon, authenticated, service_role;
