-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).
-- Creates the wardrobe table and locks it down so each user can only
-- ever see/modify their own rows (Row Level Security).

create table if not exists wardrobe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text,
  type text,
  category text,
  color text,
  style text,
  season text,
  source_image text,
  product_image_url text,
  needs_manual_fix boolean default false,
  is_placeholder boolean default false,
  error text,
  duplicate_of uuid,
  created_at timestamptz default now()
);

alter table wardrobe_items enable row level security;

create policy "Users can view their own wardrobe items"
  on wardrobe_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own wardrobe items"
  on wardrobe_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own wardrobe items"
  on wardrobe_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own wardrobe items"
  on wardrobe_items for delete
  using (auth.uid() = user_id);

create index if not exists wardrobe_items_user_id_idx on wardrobe_items (user_id);
