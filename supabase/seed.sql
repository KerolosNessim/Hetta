-- Optional starter categories. Products and prices are added from /admin.
insert into public.categories (name, slug, color, sort_order) values
  ('كليات وطلبة', 'college', '#0B6E6D', 1),
  ('إفيهات مصري', 'egyptian-memes', '#FFB627', 2),
  ('كيوت ومينيمال', 'cute', '#FFC6DD', 3),
  ('قهوة وشاي', 'coffee', '#F25C05', 4),
  ('باكدجات', 'packs', '#1B1B1B', 5)
on conflict (slug) do nothing;

-- Make yourself admin: create a user under Authentication → Users first, then run
-- (replace the email):
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'you@example.com';
