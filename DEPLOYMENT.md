# פריסה לאינטרנט — Vercel + Render + Supabase

מדריך שלב-אחר-שלב לפריסת AI Outfit Picker עם הרשמה/התחברות אמיתית וארון דיגיטלי פר-משתמש.

הפרויקט כולל שלושה חלקים נפרדים שצריך להגדיר בנפרד:
1. **Supabase** — בסיס נתונים + אימות (חינמי)
2. **Render** — השרת (Express)
3. **Vercel** — האתר (React/Vite)

---

## שלב 0: דחיפה ל-GitHub

ה-repo כבר אותחל מקומית עם commit ראשוני. כדי לפרוס, Vercel ו-Render צריכים repo ב-GitHub:

1. ב-[github.com/new](https://github.com/new) ליצור repo ריק (בלי README/.gitignore — יש לנו כבר).
2. בטרמינל, מתיקיית הפרויקט:

```bash
cd "AI-Outfit-Picker"
git remote add origin <ה-URL שקיבלת מ-GitHub>
git push -u origin main
```

(אם מותקן לך `gh` CLI ומחובר: `gh repo create ai-outfit-picker --private --source=. --remote=origin && git push -u origin main` עושה את שניהם בפקודה אחת.)

---

## שלב 1: Supabase (אימות + בסיס נתונים)

1. כניסה ל-[supabase.com](https://supabase.com) → New Project (חינמי).
2. לאחר שהפרויקט עולה: **Project Settings → API** → להעתיק:
   - `Project URL`
   - `anon public` key
3. **SQL Editor → New query** → להדביק את התוכן של [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   זה יוצר את טבלת `wardrobe_items` עם Row Level Security כך שכל משתמש רואה רק את הפריטים שלו.
4. (מומלץ להדגמה בכיתה) **Authentication → Providers → Email** → לכבות "Confirm email" כדי שהרשמה תיתן גישה מיידית בלי לאשר מייל. אפשר גם להשאיר דלוק אם יש לך גישה לתיבת מייל לבדיקה.

---

## שלב 2: Render (השרת)

1. כניסה ל-[render.com](https://render.com) → **New → Web Service** → לחבר את ה-repo מ-GitHub.
2. הגדרות:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
3. **Environment** → להוסיף את המשתנים מ-[`server/.env.example`](server/.env.example):
   - `ANTHROPIC_API_KEY`
   - `PHOTOROOM_API_KEY`
   - `REPLICATE_API_TOKEN` (אופציונלי)
   - `OPENAI_API_KEY` (אופציונלי)
   - `CORS_ORIGIN` — תמלאי את זה **אחרי** שלב 3, עם כתובת ה-Vercel הסופית (למשל `https://ai-outfit-picker.vercel.app`)
   - **אין** צורך ב-`PORT` — Render מגדיר אותו אוטומטית.
4. **Create Web Service**. אחרי הפריסה תקבלי כתובת כמו `https://ai-outfit-picker.onrender.com` — זו `VITE_API_BASE_URL` לשלב הבא.

   ⚠️ בתוכנית החינמית Render "מרדים" את השרת אחרי חוסר פעילות — קריאה ראשונה אחרי שינה יכולה לקחת כ-30 שנייה.

---

## שלב 3: Vercel (האתר)

1. כניסה ל-[vercel.com](https://vercel.com) → **Add New → Project** → לחבר את אותו repo.
2. הגדרות:
   - **Root Directory:** `client`
   - Framework: Vercel מזהה Vite אוטומטית (Build: `npm run build`, Output: `dist`)
3. **Environment Variables** — להוסיף:
   - `VITE_MOCK_MODE` = `false`
   - `VITE_API_BASE_URL` = הכתובת מ-Render (שלב 2)
   - `VITE_SUPABASE_URL` = מ-Supabase (שלב 1)
   - `VITE_SUPABASE_ANON_KEY` = מ-Supabase (שלב 1)
4. **Deploy**. תקבלי כתובת כמו `https://ai-outfit-picker.vercel.app`.
5. חזרי לשלב 2 (Render) ועדכני את `CORS_ORIGIN` לכתובת הזו, כדי שהשרת יקבל בקשות רק מהאתר שלך.

---

## בדיקה שהכל עובד

1. לפתוח את כתובת ה-Vercel.
2. **הרשמה** עם אימייל+סיסמה → אם כיביתם "Confirm email" בשלב 1, מעבר אוטומטי לארון.
3. להעלות תמונת בגד → לאשר → לבדוק שהפריט מופיע בארון.
4. **התנתקות**, **הרשמה עם אימייל אחר** → לבדוק שהארון השני **ריק** (כל משתמש רואה רק את הפריטים שלו — אפשר גם לאשר את זה ישירות ב-Supabase: **Table Editor → wardrobe_items** ולראות שלכל שורה `user_id` אחר).

---

## הערות

- **בלי Supabase מוגדר**, האתר ממשיך לעבוד כמו קודם — בלי התחברות, עם ארון מקומי ב-localStorage (טוב לפיתוח/דמו מהיר בלי הגדרת חשבונות).
- מפתחות ה-API (Claude / Photoroom / Replicate / OpenAI) **נשארים בשרת בלבד** — הדפדפן לעולם לא מקבל אותם.
- כדי לעדכן קוד בעתיד: `git push` ל-GitHub → Render ו-Vercel פורסים מחדש אוטומטית.
