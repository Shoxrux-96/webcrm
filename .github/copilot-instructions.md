# **webcrm** uchun Copilot ko'rsatmalari

Bu ikki qismli monorepo: FastAPI/PostgreSQL backend va React/TypeScript/Vite frontend. Hozirgacha asosiy ishlar skelet yaratish bo'lib, UI holati mahalliy ravishda soxta ma'lumotlar bilan ishlaydi, lekin oddiy CRUD API mavjud. Quyidagi eslatmalar AI agentiga tezda ishga tushishda yordam beradi.

---

## Yuqori darajadagi arxitektura

1. **Backend** (`backend/`)
   * `app/main.py` ichida FastAPI ilovasi mavjud va `app/routes/*.py` dan routerlar qo'shilgan.
   * Har bir resurs (kurslar, talabalar, o'qituvchilar va hokazo) uchun `models` klassi, mos keluvchi Pydantic `schemas` juftligi (`Create` + `Response` va `orm_mode`) va GET/POST/PUT/DELETE endpointlari bor.
   * SQLAlchemy sinxron `SessionLocal` bilan ishlatiladi. `app/database.py` da dvigatel va FastAPI bog'lanish (dependency) `get_db()` mavjud.
   * Ma'lumotlar bazasi URL’i `DATABASE_URL` atrof‑muhit o'zgaruvchisidan olinadi; standart lokal Postgresga yo'naltirilgan. Docker compose `postgres:15` ishlatadi va `DATABASE_URL` ni `postgresql://postgres:1234@db:5432/webcrm` ga o'rnatadi.
   * Migratsiyalar `backend/migrations` ostida Alembic bilan boshqariladi. `alembic.ini` ichida konteynerlar uchun `db` hosti bilan bir xil bog'lanish qatori bor.
   * `backend/dockerfile` talablar ro'yxatini o'rnatadi va `uvicorn app.main:app --host 0.0.0.0 --port 8000` buyrug'ini ishga tushiradi.

2. **Frontend** (`frontend/`)
   * Vite + React + TypeScript + Tailwind ishlatilgan.  `npm run dev` rivojlanish serverini 3000 portda ishga tushiradi (Docker'da 80 ga xaritalangan).
   * Bitta global kontekst `TeacherContext` ilova holatini (o'qituvchilar, talabalar, kurslar va boshqalar) va ularni o'zgartirish funktsiyalarini saqlaydi. Ko'p sahifalar `useTeachers()` dan foydalanib, backendga qo'ng'irmasdan shu holat bilan ishlaydi. Soxta ma'lumotlar `src/data.ts` da (hozirda bo'sh massivlar).
   * `src/api/api.ts` da oddiy fetch mijoz bor; hozirda faqat `http://127.0.0.1:8000` ga kurs CRUD amallarini bajaradi.
   * Marshrutlash `react-router-dom` orqali amalga oshiriladi. Ikkita layout komponenti (`AdminLayout` va `PublicLayout`) autentifikatsiyalangan admin va umumiy sahifalarni o'rab oladi. Admin autentifikatsiyasi juda sodda: `localStorage.isOwner === 'true'`.
   * UI komponentlari va sahifalar mos ravishda `src/components` va `src/pages` ichida joylashgan; ularning ko'pi hozircha skelet bo'lib, haqiqiy logika kutmoqda.
   * Type ta'riflari `src/types.ts` da va backend modellari bilan taxminan mos keladi. Yangi frontend kodi qo'shilganda ularni ishlating.

3. **Konteynerlarni boshqarish**
   * `docker-compose.yml` uchta servis quradi: `db` (Postgres), `backend` va `frontend`. Workspace ildizidan `docker-compose up --build` buyrug'i bilan butun stakni ko'taring.
   * Ma'lumotlar bazasi holati `postgres_data` hajmi orqali saqlanadi.
   * Skemadagi o'zgarishlarni qo'llash uchun `docker-compose exec backend alembic upgrade head` dan foydalaning (yoki mahalliyda shu buyruqni ishlating).

---

## Dasturchi ish oqimlari

* **Backend**
  * Mahalliy rivojlanish uchun `cd backend && pip install -r requirements.txt` va keyin `uvicorn app.main:app --reload` ishlating.
  * Migratsiyalar: `cd backend && alembic revision --autogenerate -m "message"` va `alembic upgrade head`. `alembic.ini` va `env.py` `app.models` dan modellarga import qiladi.
  * Testlar – hozircha yo'q; har bir router yoki model qarshisida Pytest modulini qo'shing.

* **Frontend**
  * `npm install` so‘ng `npm run dev` yoki konteynerni ishlating. `npm run lint` – bu `tsc --noEmit` ni ishga tushiradi va tip tekshirish bajaradi.
  * Ishlab chiqarish uchun `npm run build`. Dockerfile faqat `npm run dev` ni ishga tushiradi.
  * Muhit o'zgaruvchilari: `GEMINI_API_KEY` READMEda eslatilgan, lekin kodda ishlatilmaydi.
  * Backendga murojaat qilish uchun `src/api/api.ts` ichidagi `API_URL` ni yangilang yoki kontekst yo‘riqchilarga fetch ulanmasi yozing.

* **Komponentlararo ishlar**
  * Backendga yangi model qo‘shilganda `models.py` ni yangilang, mos `schemas` yarating, router yozing va keyin Alembic migratsiyasini avtomatik yarating.
  * Yangi turi `src/types.ts` da ham aks ettiring va agar frontend uni mahalliy boshqarishi kerak bo‘lsa, `TeacherContext` ga kengaytma kiriting.

---

## Loyihaga xos konventsiyalar

* CRUD endpointlari har doim `*Response` sxemasi bilan `response_model` dan foydalanadi.
* Yangilash endpointlari kirish uchun xuddi shu `*Create` sxemasidan foydalanadi; maydonlar qaytib olingan instansiyaga qo'lda ko'chiriladi.
* Qidiruvlar uchun `db.query(models.X).get(id)` ishlatiladi (yangi versiyalarda SQLAlchemy `.get` ni `Session.get` ga ko'chirish haqida ogohlantiradi).
* Frontendda holatni o'zgartirish `setSomething(prev => ...)` uslubiga amal qiladi va IDlar `Date.now().toString()` yoki oddiy qo'shma bilan yaratiladi.
* Admin login soxta – localStorage ga `'true'` yozish yetarli.

---

## Integratsiya nuqtalari va tashqi bog'lanishlar

* Backend PostgreSQL ga tayanadi. Boshqa hech qanday tashqi xizmatlar yo'q.
* Frontend ko'plab UI kutubxonalarni (lucide-react ikonalar, react-quill, recharts va boshqalar) oladi, hatto hali ishlatilmasa ham.
* Rivojlanish uchun CORS keng ochiq (`allow_origins=["*"]`); ishlab chiqarishda frontend domeni bilan cheklash kerak.

---

## AI agentlari uchun maslahatlar

* O'zgartirish kiritishdan oldin monoreponing ikkala tomonini ham tekshiring – ma'lumot maydoni to'rtta joyga qo'shilishi kerak bo'lishi mumkin.
* `TeacherContext` mijoz tarafidagi holat uchun yagona haqiqat manbai; uni o'zgartirish ko'plab komponentlarga ta'sir qiladi.
* Ko'plab joylarda joy egasi komponentlar mavjud; yangi UI yaratishda `admin/Teachers.tsx` kabi mavjud sahifalarga qarang.
* Backend routerlari maqsadli tarzda sodda; loyiha kattalashmaguncha og'ir abstraktsiyalarni kiritmaslikka harakat qiling.
* Hozircha testlar yo'qligi sababli o'zgartirishlar bilan ehtiyot bo'ling va yangi mantiq kiritilganda test qo'shishni o'ylab ko'ring.

---

> Ushbu ko'rsatmalarni ko'rib chiqqandan so'ng, agar qaysi bo'limlar noaniq bo'lsa yoki kod bazasining ma'lum bir qismi haqida qo'shimcha ma'lumot kerak bo'lsa, iltimos xabar bering.