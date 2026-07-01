# AI Outfit Picker

AI Outfit Picker הוא אתר חכם לניהול ארון בגדים דיגיטלי.

המשתמש יכול להעלות תמונה של פריט לבוש, לעבד אותה, לזהות את מאפייני הבגד בעזרת AI, לשמור את הפריט בארון הדיגיטלי ולקבל הצעות לשילובי לבוש.

הפרויקט הוגש כאבן דרך עצמאית מתוך פרויקט גדול יותר, במסגרת תהליך פיתוח מסודר עם עוזר קוד.

## תכונות עיקריות

- העלאת תמונת בגד
- הסרת רקע והצגת הפריט על רקע לבן
- זיהוי סוג הבגד בעזרת AI
- זיהוי צבע, קטגוריה, סגנון ועונה
- שמירת פריטים בארון דיגיטלי
- הצגת פריטי הארון
- חיפוש וסינון פריטים
- יצירת הצעת לבוש
- הצגת Outfit Board
- טיפול במצבי טעינה ושגיאות

## טכנולוגיות

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express

### שירותים חיצוניים

- Claude Vision לניתוח וזיהוי פריטי לבוש
- Photoroom להסרת רקע ועיבוד תמונה
- Supabase לשמירת נתונים
- Vercel לאחסון ה-Frontend
- Render לאחסון ה-Backend

## מבנה הפרויקט

```text
ai-outfit-picker-course-project/
├── client/
├── server/
├── supabase/
├── PRD.md
├── tasks.md
├── README.md
└── .gitignore
```

## דרישות מוקדמות

לפני הפעלת הפרויקט יש להתקין:

- Node.js
- npm
- חשבון Anthropic עם API Key
- חשבון Photoroom עם API Key
- פרויקט Supabase

## התקנת ה-Frontend

עברו לתיקיית ה-Frontend:

```bash
cd client
```

התקינו את החבילות:

```bash
npm install
```

הפעילו את האתר:

```bash
npm run dev
```

לאחר ההפעלה האתר יהיה זמין בדרך כלל בכתובת:

```text
http://localhost:5173
```

## התקנת ה-Backend

פתחו Terminal נוסף ועברו לתיקיית השרת:

```bash
cd server
```

התקינו את החבילות:

```bash
npm install
```

הפעילו את השרת:

```bash
npm start
```

אם הפקודה אינה מוגדרת, ניתן להפעיל באמצעות:

```bash
node server.js
```

## משתני סביבה

אין להעלות מפתחות API ל-GitHub.

יש ליצור קובץ `.env` בתוך תיקיית `server` לפי המבנה של:

```text
server/.env.example
```

דוגמה:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
PHOTOROOM_API_KEY=your_photoroom_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=4000
```

אם קיימים משתני סביבה גם בצד ה-Frontend, יש ליצור קובץ:

```text
client/.env
```

לפי המבנה של:

```text
client/.env.example
```

## מקור הנתונים

המערכת משתמשת בכמה מקורות נתונים:

1. תמונות שהמשתמש מעלה.
2. תמונות מעובדות שמתקבלות מ-Photoroom.
3. מידע על הבגד שמתקבל מ-Claude Vision.
4. נתוני פריטי הלבוש שנשמרים ב-Supabase.

## זרימת הנתונים

1. המשתמש מעלה תמונת בגד.
2. ה-Frontend שולח את התמונה ל-Backend.
3. ה-Backend שולח את התמונה ל-Photoroom.
4. מתקבלת תמונת בגד מעובדת על רקע לבן.
5. התמונה נשלחת ל-Claude Vision.
6. Claude מחזיר את מאפייני הבגד.
7. הנתונים מוצגים למשתמש.
8. המשתמש יכול לשמור את הפריט בארון.
9. הפריטים השמורים משמשים ליצירת הצעות לבוש.

## מגבלות ובאגים ידועים

- איכות הזיהוי תלויה באיכות התמונה שהמשתמש מעלה.
- שירותי API חיצוניים עלולים להיות איטיים או לא זמינים.
- ייתכנו מגבלות שימוש לפי מכסת ה-API.
- טעינת השרת ב-Render עלולה לקחת זמן לאחר תקופה ללא שימוש.
- זיהוי הצבע או סוג הבגד אינו תמיד מדויק במאה אחוז.
- המערכת אינה כוללת מדידה וירטואלית של הבגד על המשתמש.

## אבטחה

- קובצי `.env` אינם נשמרים ב-Git.
- מפתחות API אינם מופיעים בקוד.
- קובצי `.env.example` מכילים רק שמות של משתנים לדוגמה.
- תיקיות `node_modules` ו-`dist` אינן מועלות ל-GitHub.

## מסמכי הפרויקט

- [PRD.md](./PRD.md) – מסמך אפיון המוצר
- [tasks.md](./tasks.md) – תוכנית העבודה והמשימות

## ניהול גרסאות

הפרויקט מנוהל באמצעות Git ו-GitHub.

כל שינוי משמעותי מתבצע ב-commit נפרד עם הודעה המתארת את המשימה שבוצעה.

דוגמאות:

```text
docs: add product requirements document
docs: add milestone development task plan
docs: update setup, API and project documentation
TASK-18: add wardrobe text search
TASK-22: add item deletion
```

## Definition of Done

הפרויקט נחשב מוכן כאשר:

- ניתן להעלות תמונה.
- התמונה עוברת עיבוד.
- הבגד מזוהה באמצעות AI.
- ניתן לשמור את הפריט.
- ניתן להציג את הארון.
- ניתן ליצור הצעת לבוש.
- אין מפתחות API ב-GitHub.
- קיימים PRD, tasks ו-README.
- ניתן להריץ את הפרויקט לפי ההוראות במסמך זה.
