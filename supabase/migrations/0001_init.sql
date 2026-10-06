-- حتة — store schema
-- Run in Supabase: SQL Editor → paste → Run (or `supabase db push` with the CLI).

create extension if not exists "pgcrypto";

-- ───────────────────────── admins ─────────────────────────
-- Anyone in this table can edit the store from /admin.
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ───────────────────────── categories ─────────────────────────
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  color text not null default '#0B6E6D',
  image_url text,
  is_visible boolean not null default true,
  show_on_home boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ───────────────────────── products ─────────────────────────
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  kind text not null default 'single' check (kind in ('single', 'pack')),
  badge text check (badge in ('best_seller', 'new', 'sale')),
  finishes text[] not null default array['matte', 'gloss'],
  images text[] not null default '{}',
  is_published boolean not null default false,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);
create index products_published_idx on public.products (is_published, sort_order);

create table public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,
  dimensions text,
  price numeric(10, 2) not null check (price >= 0),
  is_available boolean not null default true,
  sort_order int not null default 0
);
create index product_sizes_product_idx on public.product_sizes (product_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ───────────────────────── banners ─────────────────────────
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  placement text not null default 'home_hero'
    check (placement in ('home_hero', 'home_middle', 'announcement', 'shop')),
  cta_label text,
  cta_target text not null default 'shop'
    check (cta_target in ('shop', 'category', 'product', 'whatsapp', 'url')),
  cta_value text, -- category slug, product slug or full URL depending on cta_target
  bg_color text not null default '#0B6E6D',
  image_desktop_url text,
  image_mobile_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ───────────────────────── settings (single row) ─────────────────────────
create table public.settings (
  id int primary key default 1 check (id = 1),
  whatsapp_number text not null default '', -- international format without +, e.g. 2010xxxxxxxx
  instagram_handle text,
  tiktok_handle text,
  shipping_note text,
  bulk_min_qty int
);
insert into public.settings (id) values (1) on conflict do nothing;

-- ───────────────────────── row level security ─────────────────────────
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_sizes enable row level security;
alter table public.banners enable row level security;
alter table public.settings enable row level security;

create policy "admins read own row" on public.admins
  for select using (user_id = auth.uid());

create policy "public reads visible categories" on public.categories
  for select using (is_visible or public.is_admin());
create policy "admins manage categories" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public reads published products" on public.products
  for select using (is_published or public.is_admin());
create policy "admins manage products" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public reads sizes of published products" on public.product_sizes
  for select using (
    public.is_admin()
    or exists (select 1 from public.products p where p.id = product_id and p.is_published)
  );
create policy "admins manage sizes" on public.product_sizes
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public reads live banners" on public.banners
  for select using (
    public.is_admin()
    or (is_active
        and (starts_at is null or starts_at <= now())
        and (ends_at is null or ends_at > now()))
  );
create policy "admins manage banners" on public.banners
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public reads settings" on public.settings
  for select using (true);
create policy "admins update settings" on public.settings
  for update using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── storage for product / banner images ─────────────────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public reads media" on storage.objects
  for select using (bucket_id = 'media');
create policy "admins upload media" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());
create policy "admins update media" on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());
create policy "admins delete media" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());
