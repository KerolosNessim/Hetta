# حتة — متجر الاستيكرات

React + Vite + Tailwind + shadcn/ui + Supabase. الطلبات بتتبعت على الواتساب، والأقسام والمنتجات والبانرات بتتدار من الداشبورد.

## تشغيل سريع (من غير Supabase)

```bash
npm install
npm run dev
```

افتح http://localhost:5173. المتجر هيشتغل ببيانات تجريبية لحد ما توصّل Supabase.

## توصيل Supabase

1. اعمل مشروع جديد على [supabase.com](https://supabase.com).
2. من **SQL Editor** شغّل `supabase/migrations/0001_init.sql`، وبعده (اختياري) `supabase/seed.sql` عشان الأقسام الأولى.
3. انسخ `.env.example` لـ `.env` وحط فيه القيم من **Project Settings → API**:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
4. من **Authentication → Users** اعمل يوزر بإيميل وباسورد، وبعدين اعمله أدمن من SQL Editor:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```
5. شغّل `npm run dev` تاني، وادخل على `/admin`.
6. أول حاجة في الداشبورد: **الإعدادات ← رقم الواتساب**. من غيره زرار الطلب مش هيشتغل.

## الصفحات

| المسار                | الصفحة                                                             |
| --------------------- | ------------------------------------------------------------------ |
| `/`                   | الرئيسية: البانر، الأقسام، الأكثر طلباً، صمم بنفسك، الشركات        |
| `/shop`               | المتجر: فلتر بالقسم (`?cat=`)، النوع (`?kind=pack`)، البحث (`?q=`) |
| `/p/:slug`            | صفحة المنتج: المقاس، الخامة، الكمية                                |
| السلة                 | درج جانبي، بيجمع بيانات التوصيل ويفتح الواتساب برسالة الأوردر      |
| `/admin/products`     | المنتجات: نشر، مميز، تعديل، حذف                                    |
| `/admin/products/new` | إضافة منتج: صور، مقاسات وأسعار، خامات، قسم، شارة                   |
| `/admin/categories`   | الأقسام: ترتيب، إظهار، الظهور في الرئيسية                          |
| `/admin/banners`      | البانرات: المكان، النص، الزرار، الصور، تاريخ البداية والنهاية      |
| `/admin/settings`     | رقم الواتساب، السوشيال، ملاحظة الشحن                               |

## الأمان

كل الجداول عليها Row Level Security: الزوار بيشوفوا المنتجات المنشورة والأقسام الظاهرة والبانرات الشغالة بس، والكتابة متاحة لليوزرز اللي في جدول `admins` بس. الصور بتترفع على bucket اسمه `media`.

## الهيكل

```
src/
  components/ui/       مكونات shadcn (Button, Input, Switch, Sheet, Table…)
  components/store/    هيدر وفوتر المتجر، كارت المنتج، السلة
  components/admin/    لاي أوت الداشبورد ورفع الصور
  pages/store/         الرئيسية، المتجر، المنتج
  pages/admin/         صفحات الداشبورد
  lib/api.ts           كل القراءة والكتابة من Supabase
  lib/whatsapp.ts      رسالة الأوردر ولينكات wa.me
  index.css            ألوان وخطوط هوية حتة (متربطة بمتغيرات shadcn)
supabase/
  migrations/0001_init.sql
  seed.sql
```

## النشر

`npm run build` بيطلع فولدر `dist`. ارفعه على Vercel أو Netlify، وضيف متغيرات `.env` في إعدادات المشروع هناك. ولازم توجّه كل المسارات لـ `index.html` (على Vercel ده بيحصل لوحده مع Vite، وعلى Netlify ضيف `_redirects` فيه `/* /index.html 200`).
