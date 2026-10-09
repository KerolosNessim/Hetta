-- Optional starter data. Run after migrations 0001 and 0002. Safe to run again.
-- Names, prices and sizes below are placeholders: edit them from /admin, or delete what you do not need.

-- ───────── main categories ─────────
-- The storefront draws an illustration for each of these slugs until you upload a category image.
insert into public.categories (name, slug, color, sort_order) values
  ('Stickers', 'stickers', '#0B6E6D', 1),
  ('Mugs', 'mugs', '#F25C05', 2),
  ('Notebooks', 'notebooks', '#FFB627', 3),
  ('IDs', 'id-cards', '#FFC6DD', 4),
  ('Coasters', 'coasters', '#FFF6E5', 5),
  ('Medals', 'medals', '#1B1B1B', 6),
  ('Pens', 'pens', '#0B6E6D', 7)
on conflict (slug) do nothing;

-- ───────── sub-categories ─────────
-- (name, slug, parent slug, sort order). A sub-category takes its parent's color.
insert into public.categories (name, slug, color, sort_order, parent_id, show_on_home)
select v.name, v.slug, p.color, v.sort_order, p.id, false
from (values
  ('كليات وطلبة',      'college',             'stickers',  1),
  ('إفيهات مصري',      'egyptian-memes',      'stickers',  2),
  ('كيوت ومينيمال',    'cute',                'stickers',  3),
  ('قهوة وشاي',        'coffee',              'stickers',  4),
  ('باكدجات',          'packs',               'stickers',  5),
  ('ماجات سيراميك',    'ceramic-mugs',        'mugs',      1),
  ('ماجات سحرية',      'magic-mugs',          'mugs',      2),
  ('ماجات سفر',        'travel-mugs',         'mugs',      3),
  ('نوت بوك سلك',      'spiral-notebooks',    'notebooks', 1),
  ('دفاتر هارد كفر',   'hardcover-notebooks', 'notebooks', 2),
  ('بلانرز ومفكرات',   'planners',            'notebooks', 3),
  ('حوامل كروت',       'card-holders',        'id-cards',  1),
  ('لانيارد',          'lanyards',            'id-cards',  2),
  ('كروت مطبوعة',      'printed-ids',         'id-cards',  3),
  ('كوستر خشب',        'wood-coasters',       'coasters',  1),
  ('كوستر سيراميك',    'ceramic-coasters',    'coasters',  2),
  ('كوستر فلين',       'cork-coasters',       'coasters',  3),
  ('ميداليات رياضية',  'sports-medals',       'medals',    1),
  ('ميداليات تخرج',    'graduation-medals',   'medals',    2),
  ('ميداليات تذكارية', 'souvenir-medals',     'medals',    3),
  ('أقلام جاف',        'ballpoint-pens',      'pens',      1),
  ('أقلام منقوشة',     'engraved-pens',       'pens',      2),
  ('أطقم أقلام',       'pen-sets',            'pens',      3)
) as v(name, slug, parent, sort_order)
join public.categories p on p.slug = v.parent
on conflict (slug) do update set parent_id = excluded.parent_id, show_on_home = false;

-- ───────── products ─────────
-- One element per product: n name, s slug, c category slug (main or sub), k kind, b badge,
-- f featured, z sizes as [name, dimensions, price]. Products whose c is a main category sit directly under it.
do $$
declare
  item jsonb;
  sz jsonb;
  pid uuid;
  i int := 0;
  items jsonb := $json$[
    {"n":"ستيكر ذاكر بقى","s":"study-now","c":"college","b":"new","f":true,"z":[["صغير","5×5",15],["وسط","8×8",25],["كبير","12×12",40]]},
    {"n":"باكدج طالب هندسة","s":"engineering-pack","c":"college","k":"pack","b":"best_seller","f":true,"z":[["١٠ ستيكرات","",90],["٢٠ ستيكر","",160]]},
    {"n":"يلا بينا","s":"yalla-bina","c":"egyptian-memes","f":true,"z":[["صغير","5×5",15],["وسط","8×8",25]]},
    {"n":"عادي جداً","s":"3ady-gedan","c":"egyptian-memes","z":[["صغير","5×5",15],["وسط","8×8",25]]},
    {"n":"قلب كيوت","s":"cute-heart","c":"cute","z":[["صغير","4×4",12],["وسط","7×7",20]]},
    {"n":"قهوة الأول","s":"coffee-first","c":"coffee","f":true,"z":[["صغير","5×5",15],["وسط","8×8",25]]},
    {"n":"باكدج ١٠ حتت","s":"ten-pack","c":"packs","k":"pack","b":"sale","z":[["١٠ حتت","",120]]},
    {"n":"ستيكر مخصص بتصميمك","s":"custom-sticker","c":"stickers","z":[["صغير","5×5",20],["وسط","8×8",35],["كبير","12×12",55]]},

    {"n":"ماج الصباحية","s":"morning-mug","c":"ceramic-mugs","b":"best_seller","f":true,"z":[["١١ أونصة","",120],["١٥ أونصة","",150]]},
    {"n":"ماج كيوت","s":"cute-mug","c":"ceramic-mugs","z":[["١١ أونصة","",120]]},
    {"n":"ماج سحري بصورتك","s":"magic-photo-mug","c":"magic-mugs","b":"new","f":true,"z":[["١١ أونصة","",180]]},
    {"n":"ماج سحري أسود","s":"magic-black-mug","c":"magic-mugs","z":[["١١ أونصة","",170]]},
    {"n":"ترموس سفر","s":"travel-thermos","c":"travel-mugs","z":[["٣٥٠ مل","",220],["٥٠٠ مل","",270]]},
    {"n":"ماج مخصص باسمك","s":"custom-mug","c":"mugs","z":[["١١ أونصة","",130]]},

    {"n":"نوت بوك سلك مسطر","s":"spiral-lined","c":"spiral-notebooks","f":true,"z":[["A6","",45],["A5","",70]]},
    {"n":"نوت بوك سلك شبكي","s":"spiral-grid","c":"spiral-notebooks","z":[["A5","",70]]},
    {"n":"دفتر هارد كفر جلد","s":"hardcover-leather","c":"hardcover-notebooks","b":"best_seller","z":[["A5","",140],["B5","",180]]},
    {"n":"بلانر أسبوعي","s":"weekly-planner","c":"planners","b":"new","f":true,"z":[["A5","",110]]},
    {"n":"دفتر مخصص بغلافك","s":"custom-notebook","c":"notebooks","z":[["A5","",150]]},

    {"n":"حامل كارت شفاف","s":"clear-card-holder","c":"card-holders","z":[["عادي","",25]]},
    {"n":"حامل كارت جلد","s":"leather-card-holder","c":"card-holders","f":true,"z":[["عادي","",60]]},
    {"n":"لانيارد مطبوع","s":"printed-lanyard","c":"lanyards","b":"best_seller","z":[["عادي","",35],["عريض","",45]]},
    {"n":"كارت ID مطبوع بصورتك","s":"printed-id-card","c":"printed-ids","z":[["كارت","",50]]},
    {"n":"طقم ID كامل","s":"full-id-set","c":"id-cards","b":"sale","z":[["كارت + حامل + لانيارد","",110]]},

    {"n":"كوستر خشب دايرة","s":"round-wood-coaster","c":"wood-coasters","z":[["١٠ سم","",40]]},
    {"n":"طقم كوستر خشب ٤ قطع","s":"wood-coaster-set","c":"wood-coasters","f":true,"b":"new","z":[["٤ قطع","",140]]},
    {"n":"كوستر سيراميك مطبوع","s":"ceramic-coaster-print","c":"ceramic-coasters","z":[["١٠ سم","",55]]},
    {"n":"كوستر فلين","s":"cork-coaster","c":"cork-coasters","z":[["١٠ سم","",30]]},
    {"n":"كوستر مخصص","s":"custom-coaster","c":"coasters","z":[["١٠ سم","",60]]},

    {"n":"ميدالية ماراثون","s":"marathon-medal","c":"sports-medals","b":"best_seller","z":[["٥ سم","",60],["٧ سم","",85]]},
    {"n":"ميدالية بطولة كرة","s":"football-medal","c":"sports-medals","z":[["٥ سم","",60]]},
    {"n":"ميدالية تخرج","s":"graduation-medal","c":"graduation-medals","f":true,"z":[["٥ سم","",70],["٧ سم","",95]]},
    {"n":"ميدالية تذكارية بنقش","s":"engraved-souvenir-medal","c":"souvenir-medals","z":[["٥ سم","",65]]},
    {"n":"ميدالية مخصصة","s":"custom-medal","c":"medals","z":[["٥ سم","",75]]},

    {"n":"قلم جاف مطبوع","s":"printed-ballpoint","c":"ballpoint-pens","z":[["قلم","",15],["١٠ أقلام","",120]]},
    {"n":"قلم جاف معدن","s":"metal-ballpoint","c":"ballpoint-pens","f":true,"z":[["قلم","",35]]},
    {"n":"قلم منقوش بالاسم","s":"name-engraved-pen","c":"engraved-pens","b":"best_seller","z":[["قلم","",65]]},
    {"n":"طقم قلمين هدية","s":"gift-pen-set","c":"pen-sets","b":"new","z":[["طقم","",150]]},
    {"n":"قلم مخصص بلوجو","s":"custom-logo-pen","c":"pens","z":[["قلم","",25],["٥٠ قلم","",1000]]}
  ]$json$;
begin
  for item in select * from jsonb_array_elements(items) loop
    i := i + 1;
    pid := null;
    insert into public.products (name, slug, description, category_id, kind, badge, is_published, is_featured, sort_order)
    select item->>'n', item->>'s', 'منتج تجريبي — عدّل الوصف والسعر والصور من لوحة التحكم.',
           c.id, coalesce(item->>'k', 'single'), item->>'b', true, coalesce((item->>'f')::boolean, false), i
    from public.categories c where c.slug = item->>'c'
    on conflict (slug) do nothing
    returning id into pid;

    if pid is not null then
      for sz in select * from jsonb_array_elements(item->'z') loop
        insert into public.product_sizes (product_id, name, dimensions, price, sort_order)
        values (pid, sz->>0, nullif(sz->>1, ''), (sz->>2)::numeric,
                (select count(*) from public.product_sizes where product_id = pid));
      end loop;
    end if;
  end loop;
end $$;


-- ───────── sample reviews ─────────
-- PLACEHOLDER TEXT written for layout only. Replace with real customer reviews from /admin/reviews
-- (or unpublish them) before launch. Only inserted while the reviews table is empty.
insert into public.reviews (author_name, author_label, product_label, rating, body, sort_order)
select v.* from (values
  ('منى سمير',    'طالبة هندسة — القاهرة',  'باكدج ستيكرات',   5, 'الستيكرات جت زي الصورة بالظبط، والألوان مولعة. لزقتها على اللابتوب ومن شهر ولسه زي ما هي.', 1),
  ('أحمد خالد',   'الإسكندرية',             'ماج سحري بصورته', 5, 'جبت الماج هدية لصحبي وفضل يبصله خمس دقايق قبل ما يصدق إن الصورة بتظهر لوحدها. التغليف كمان كان محترم.', 2),
  ('نورهان علي',  'طالبة طب — طنطا',        'نوت بوك سلك',     4, 'الورق ممتاز والقلم مبيشربش. التوصيل اتأخر يوم بس حتة ردّوا عليا بسرعة وعوّضوني.', 3),
  ('كريم عادل',   'مدرب — الجيزة',          'ميداليات تخرج',   5, 'طلبت ٣٠ ميدالية لدفعة التخرج، واتسلموا في الميعاد والنقش واضح. هطلب منهم تاني السنة الجاية.', 4),
  ('سارة محمود',  'المنصورة',               'طقم كوستر خشب',   5, 'الكوستر شكله أحلى من الصور، والرسمة اتطبعت نظيفة. بقت أول حاجة الناس بتسأل عنها لما تيجي البيت.', 5),
  ('عمر يوسف',    'مسؤول فعاليات — القاهرة','لانيارد وكروت ID', 5, 'عملنا لانيارد وكروت لمؤتمر فيه ٢٠٠ شخص. التصميم اتعدّل معانا على الواتساب لحد ما عجبنا، وكله وصل قبل المؤتمر بيومين.', 6)
) as v(author_name, author_label, product_label, rating, body, sort_order)
where not exists (select 1 from public.reviews);

-- Make yourself admin: create a user under Authentication → Users first, then run
-- (replace the email):
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'you@example.com';
