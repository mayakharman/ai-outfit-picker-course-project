# AI Outfit Picker

פרויקט גמר בקורס יישומי בינה מלאכותית בעולם העסקי — מערכת שמזהה בגדים בתמונה (ולא אקססוריז), בונה ארון דיגיטלי, ומציעה לוקים מותאמים אישית.

## מבנה הפרויקט

```
AI-Outfit-Picker/
├── client/   React + Vite — האתר עצמו
└── server/   Express — proxy קטן ל-Claude (זיהוי בגדים) ול-OpenAI Images (תמונות מוצר), נדרש רק במצב "אמיתי"
```

## הרצה מהירה (מצב דמו, בלי מפתחות API)

```bash
cd client
npm install
npm run dev
```

האתר ירוץ בכתובת `http://localhost:5173`. כברירת מחדל `VITE_MOCK_MODE=true` — הזיהוי עובד על נתוני דמו קבועים, ובמקום תמונות מוצר מוצגים placeholders ברורים, כך שאפשר להציג את כל הזרימה בלי אינטרנט ובלי מפתחות API.

## הרצה במצב אמיתי (Claude + OpenAI Images)

1. בקובץ `client/.env` (העתיקי מ-`client/.env.example`) קבעי `VITE_MOCK_MODE=false`.
2. בקובץ `server/.env` (העתיקי מ-`server/.env.example`) הכניסי:
   - `ANTHROPIC_API_KEY` — מפתח מ-[console.anthropic.com](https://console.anthropic.com), לזיהוי הבגדים בתמונה
   - `OPENAI_API_KEY` — מפתח מ-[platform.openai.com](https://platform.openai.com), ליצירת תמונות המוצר (Claude לא יוצר תמונות, צריך ספק נפרד). אם לא מגדירים מפתח כאן — האתר ממשיך לעבוד ומציג placeholder במקום תמונת המוצר, לא קורס.
3. הרצת השרת:
   ```bash
   cd server
   npm install
   npm start
   ```
4. הרצת הלקוח (בטרמינל נפרד):
   ```bash
   cd client
   npm run dev
   ```

## זרימת המערכת

העלאת תמונה (נשארת ללא שינוי) → זיהוי בגדים בלבד (Claude vision) → **יצירת תמונת מוצר חדשה ונקייה לכל פריט** מתוך התיאור שזוהה (לא חיתוך מהתמונה המקורית!) → ארון דיגיטלי → בחירת מזג אוויר/אירוע/סגנון → המלצת לוק (מנוע חוקים + הסבר מ-Claude) → קולאז' של הפריטים + אפשרות ליצירת תמונת לוק מאוחדת אחת.

ראו את התוכנית המלאה (אפיון, מסכים, החלטות טכניות) בשיחה שבה נבנה הפרויקט.
