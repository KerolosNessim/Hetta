-- Sub-categories: a category with a parent_id is a sub-category (one level deep).
-- Products can point at either a main category or a sub-category.
alter table public.categories
  add column parent_id uuid references public.categories (id) on delete cascade;

create index categories_parent_idx on public.categories (parent_id);

alter table public.categories
  add constraint categories_not_own_parent check (parent_id is null or parent_id <> id);
