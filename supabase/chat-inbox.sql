-- Site chat conversations + messages for the public assistant and staff inbox.
-- Public writes go through Next.js APIs with the service role key.

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_token_hash text not null,
  status text not null default 'bot'
    check (status in ('bot', 'waiting', 'human', 'closed')),
  assignee_id uuid references public.team_members (id) on delete set null,
  visitor_name text not null default '',
  visitor_email text not null default '',
  visitor_phone text not null default '',
  page_path text not null default '/',
  handoff_reason text not null default '',
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chat_conversations_visitor_hash_idx
  on public.chat_conversations (visitor_token_hash, last_message_at desc);

create index if not exists chat_conversations_status_idx
  on public.chat_conversations (status, last_message_at desc);

create index if not exists chat_conversations_assignee_idx
  on public.chat_conversations (assignee_id, last_message_at desc);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'staff', 'system')),
  content text not null,
  staff_id uuid references public.team_members (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_conversation_idx
  on public.chat_messages (conversation_id, created_at);

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "Authenticated users can read chat conversations"
  on public.chat_conversations;

create policy "Authenticated users can read chat conversations"
  on public.chat_conversations
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read chat messages"
  on public.chat_messages;

create policy "Authenticated users can read chat messages"
  on public.chat_messages
  for select
  to authenticated
  using (true);

alter table public.chat_conversations replica identity full;
alter table public.chat_messages replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.chat_conversations;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.chat_messages;
exception
  when duplicate_object then null;
end $$;

notify pgrst, 'reload schema';
