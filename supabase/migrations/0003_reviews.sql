-- Customer reviews shown on the home page, managed from /admin/reviews.
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_label text, -- e.g. "طالبة هندسة — القاهرة"
  product_label text, -- what they bought, e.g. "ماج سحري"
  rating int not null default 5 check (rating between 1 and 5),
  body text not null,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index reviews_published_idx on public.reviews (is_published, sort_order);

alter table public.reviews enable row level security;

create policy "public reads published reviews" on public.reviews
  for select using (is_published or public.is_admin());
create policy "admins manage reviews" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());
