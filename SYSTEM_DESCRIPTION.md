# Bakı Şəhər Xidmətləri — Şikayət Portalı · Tam Sistem Təsviri

> Bu sənəd sistemin hazırda **edilənlərin tam** (dəqiq — kod əsasında) təsviridir:
> nə işləyir, kim istifadə edir, hansı səhifələr, hansı API, hansı texnologiya,
> həmçinin real istehsal mexanizmi üçün nə çatışmır.

---

## 1. Sistem nədir

"Şəhər Xidmətləri" — Bakı şəhəri üzrə **ətraf/şəhər infrastrukturu problemlərinin vahid rəqəmsal şikayət portalıdır.** Vətəndaş yol, işıqlandırma, təmizlik, su, kanalizasiya, yaşıllaşdırma və s. məsələni **xəritədə qeyd edir** (koordinat + ünvan + rayon), sistem ona **unikal nömrə (ticket)** verir və idarə işçiləri şikayəti görüb həll prosesini aparır; hər addım şikayətçiyə görünür.

Əsas prinsipi: **"Şəhərdə gördüyünüz hər məsələ — bir şikayətdən həllə."**

- Backend: **Spring Boot (Java 21) + PostgreSQL**, REST API.
- Frontend: **React 19 + TypeScript + Vite + Tailwind CSS v4**, SPA.
- Xəritə: **Leaflet (react-leaflet)**, açıq küçə/OSM tile-ları.
- Auth: **JWT (stateless)**, BCrypt parol.

---

## 2. Rollar və səlahiyyətlər

| Rol | Nədir | Nə edə bilər |
|---|---|---|
| `CITIZEN` (vətəndaş) | Adi istifadəçi | Şikayət verər, öz şikayətlərini görər/izləyər (status, xronologiya), şərh yazar, öz yerini xəritədə seçər |
| `FIELD_EMPLOYEE` (sahə əməkdaşı) | İdarənin "briqada"sı | Özünə təyin olunmuş şikayətlər paneli ("İşlər"), status dəyişər (PENDING→…→RESOLVED), şikayətə təyinat alar, staff xəritəsində bütün şikayət markerləri |
| `DEPARTMENT_MANAGER` (idarə rəisi) | İdarə meneceri | Field-ə yuxarıdakılar + şikayəti əməkdaşa **təyinat (assig)** edər |
| `ADMIN` (sistem inzibatçısı) | Superadmin | Hər şey + istifadəçiləri idarə edər (rol dəyişdirər), kateqoriyaları əlavə/silə/dəyişə bilər, şikayəti silər, istifadəçi adından (*on behalf*) şikayət açar |

- Staff = `DEPARTMENT_MANAGER`, `FIELD_EMPLOYEE`, `ADMIN` (vətəndaş deyil).
- `/api/complaints/map`, status dəyişmə, təyinat — yalnız staff.
- Şikayət silmə — yalnız `ADMIN`.

---

## 3. Səhifələr (frontend)

| Səhifə | Rota | Hədəf | Nə edir |
|---|---|---|---|
| Ana səhifə | `/` | hamı | Gözəl hero (Bakı panoraması fon + kollaj), "Yolda" status xətti, marquee (xidmət sahələri), kateqoriya kartları, CTA lent ("İlk şikayətinizi bu gün verin") |
| Qeydiyyat | `/register` | hamı | Ad/istifadəçi/sifrə/e-poçt ilə hesab |
| Daxil ol | `/login` | hamı | JWT login |
| Profil | `/profile` | daxil olmuş | Məlumat yeniləmə |
| Yeni şikayət | `/complaints/new` | daxil olmuş | Başlıq, təsvir, kateqoriya, prioritet, **şəkil yükləmə**, **xəritədə yer seçimi / cari yer düyməsi** |
| Şikayətlərim | `/complaints/mine` | vətəndaş | Öz şikayətləri, filtr (status), səhifələmə, stat kartları |
| Şikayət detalı | `/complaints/:id` | hamı (hüquqa əsasən) | Tam məlumat + **status xronologiyası**, şəkillər, şərhlər (staff üçün daxili/şifahi şərhlər), staff-ın status/assign əməliyyatları |
| Xəritəm | `/my-map` | vətəndaş | Öz şikayətlərinin markerləri |
| İşlər | `/work` | staff | Mənə təyin edilmiş işlər, filtr, stat kartları |
| İşlər xəritəsi | `/work/map` | staff | Bütün şikayət markerləri (akış üzrə) — *staff-only API* |
| Statistika | `/stats` | hamı | Recharts diaqramları ilə yekun göstəricilər |
| Kateqoriyalar | `/categories` | hamı | Sahələr və hər sahənin açıq şikayət sayı |
| Admin — istifadəçilər | `/admin/users` | admin | Cədvəl: ad, rol, aktivlik; rol dəyişmə |
| Admin — kateqoriyalar | `/admin/categories` | admin | CRUD kateqoriya |
| 404 | `*` | hamı | Gözəl səhifə tapılmadı |

Naviqasiya **rola görə filtrdən** keçir (staff yalnız öz menyusunu, admin admin hissəsini görür).

---

## 4. Şikayət axını (status mexanizmi)

İşgüzar ssenari:

```
Vətəndaş şikayət verir
   └─> PENDING            (nömrə alındı — CS-<il>-<say>)
        └─> UNDER_REVIEW  (mütəxəssis baxır / qəbul edir)
            └─> IN_PROGRESS (briqada işləyir — təyinat bu ətrafda)
                └─> RESOLVED → CLOSED (terminal; həll olundu)
                 └ ─ REJECTED / CANCELLED (terminal; rədd edildi / ləğv edildi)
```

**Qanuni status keçidləri** (`Complaint.allowedTransitions()`):

- `PENDING` → `UNDER_REVIEW`, `RESOLVED`, `REJECTED`, `CANCELLED`
- `UNDER_REVIEW` → `IN_PROGRESS`, `RESOLVED`, `REJECTED`
- `IN_PROGRESS` → `RESOLVED`, `UNDER_REVIEW`
- `RESOLVED`, `REJECTED`, `CANCELLED` → `PENDING`, `UNDER_REVIEW` (yenidən açıla bilər)

**Keçid yoxlanışı qanunla apara bilər** — səhv keçiddə backend `InvalidStateTransitionException` (409/406) qaytarır. Keçid audit üçün məntiqsən.

Hər şikayətdə: `referenceCode` (CS-ill-№), başlıq, təsvir, **imageUrl** (şəkil), koordinatlar, rayon, ünvan, prioritet (LOW/NORMAL/HIGH/URGENT), status, `resolutionNote` (həll qeydi), `resolvedAt`, timestamps, sahibi, kateqoriya, **assignedTo** (təyin edilmiş əməkdaş). Şərhlər: açıq (hər kəsə) və **daxili** (yalnız staff).

---

## 5. REST API (backend)

**Auth** (`/api/auth`): `POST /register`, `POST /login`.

**Faillər** (`/api/files`): `POST /image` — multipart şəkil yükləyir, URL qaytarır; image/jpeg, png, webp, gif; max ölçü limitli; təsadüfi adla `uploads/`-ə yazır, `/uploads/**` üzrə verilir.

**İstifadəçilər** (`/api/users`): `GET /me`, `GET /{id}`, `PUT /{id}`, `GET` (admin), `GET /by-role/{role}`.

**Kateqoriyalar** (`/api/categories`): `GET`, `GET /{id}`, `POST` (admin), `PUT /{id}` (admin), `DELETE /{id}` (admin).

**Şikayətlər** (`/api/complaints`):
- `POST` (şikayət yarat)
- `POST /on-behalf/{ownerId}` (admin — vətəndaş adından)
- `GET /{id}` (`?comments=`), `GET /reference/{code}`
- `GET` — **ziyafət axtarışı**: status, priority, categoryId, userId, assignedToId, district, referenceCode, text, createdFrom/To + səhifələmə (max size 100)
- `GET /mine` (özüm), `GET /assigned-to-me` (staff), `GET /map` (staff; marker limit 500)
- `PUT /{id}` (yenilə), `PATCH /{id}/status` (staff), `PATCH /{id}/assign` (staff), `POST /{id}/comments`, `DELETE /{id}` (admin)

**Statistika** (`/api/stats`): `GET /summary` — Recharts-ə ötürülən yekun qrupları.

Arxitektura: `Controller → Service → Repository` (Spring Data JPA), `ComplaintSpecification` axtarış üçün, `ComplaintMapper` DTO çevirmə, `GlobalExceptionHandler` vahid xəta formatı (`{status, error, message, path}`), Flyway migrasiyaları (`V1`, `V2`).

---

## 6. Texnoloji paylama

- **Java 21 · Spring Boot 4.x** · Spring Web, Security (JWT), Data JPA, Validation, Flyway (PostgreSQL).
- **PostgreSQL** loki (Docker `city-db`, port 5432) — real dev konfiq `application-local.yml` (git-ignored), `.env.example` kök qovluqda.
- **React 19 · TypeScript · Vite** (dev port 5173; `/api` və `/uploads` → `localhost:8080` proxy) · Tailwind v4 (`@tailwindcss/vite`).
- Axios (interceptor: JWT-ni başlığa qoyur), react-router-dom 6/7, react-leaflet, recharts. Lint: oxlint.

---

## 7. Dizayn sistemi (UI/UX)

"Editorial + sənətkarlıq" üslubu — "AI kimi görünməyən", **qəşəng** görünüş:

- **Şriftlər**: Cormorant Garamond (başlıqlar, `.display`) + Karla (bədən); baza 17px.
- **Palitra**: `paper` (krem fon `#f4f2ec`), `ink` (tünd `#221d16`), terracotta `brand`, emerald/amber/rose status rəngləri.
- **Detallar**: kağız taxıl (grain) örtüyü, hairline ayırıcılar, boru alt çizgili linklər, scroll-reveal animasiyalar, rəqəm sayğacları, marquee lent, pill düymələr.
- **Hero**: Bakı (Alov Qüllələri) panoraması arxa-fon + krem örtüyü, sağda foto kollajı (gün + gecə), üzən "Canlı" və "24/7" çipləri.
- **Current location**: "Mənim yerim" düyməsi ilə pulsasiya edən mavi marker + dəqiqlik ±m popup (Leaflet).

---

## 8. Layihə quruluşu

```
city-service/
├─ src/main/java/...         # Spring Boot backend (entity, service, controller, security)
├─ src/main/resources/db/migration/  # Flyway SQL
├─ src/test/java/...         # JUnit + IntegrationTest, JwtServiceTest, ...
├─ frontend/src/
│  ├─ components/  ui.tsx (design kitabxanası), Layout.tsx, map.tsx, ComplaintCard...
│  ├─ pages/       HomePage, NewComplaintPage, ComplaintDetailPage, StatisticsPage, ...
│  ├─ context/AuthContext.tsx, hooks/useFetch.ts, hooks/useCurrentLocation.ts
│  ├─ lib/         api.ts (axios), types.ts, format.ts
│  └─ index.css    dizayn tokenləri və effektləri
├─ .env.example              # nümunə konfiq
└─ uploads/                  # yüklənən şəkillər (backend tərəfi)
```

**İşə salma:**
1. PostgreSQL konyanutin: Docker-də `city-db` (port 5432) + `application-local.yml` (sirlər SİZİN gizlinləriniz).
2. Backend: `./mvnw spring-boot:run` (və ya test: `./mvnw test`).
3. Frontend: `cd frontend && npm install && npm run dev` (yoxdursa `npm run build` Tip-kompilyasiyanı da edir).

---

## 9. Testlər

- `CityServiceApplicationTests`, `IntegrationTest` (REST contract), `JwtServiceTest`, `SearchCriteriaTest`, `ComplaintStatusTest` (status keçid məntiqi) — `src/test`.

---

## 10. Real istehsala qədər çatışmayanlar (bundan sonrası üçün yol xəritəsi)

Artıq mövcud: JWT auth, toplu API, status keçidi məntiqi, şəkil yükləmə/ərizə ekranı, staff təyinatı, staff xəritəsi, statistika, admin panelləri, current-location xəritəsi.

İstehsal mexanizmi üçün **növbəti işlər**:
1. **Qurum kataloqu**: kateqoriya × rayon → məsul idarə (avtomatik istiqamətləndirmə; indi təyinatı əl üsulu edilir).
2. **SLA**: hər kateqoriyaya müddət (saat) + arxa planda CRON/ölçər → gecikmə zamanı **avtomatik eskasiya**.
3. **Nəzarət (verification)**: RESOLVED-ə nəzarət şöbəsi qarışı + **şikayətçinin "Həll oldu ✓" təsdiqi / razı deyilsə reopen** (hazırda reopen termini var, amma həllcinin təsdiq axını yoxdur).
4. **SMS/e-poçt/WhatsApp bildirişləri** hər status dəyişikliyində.
5. **myGov / e-KİMİ / SMS-OTP doğrulama** (yalan şikayətin qarşısı).
6. **Uploads-ın verilənlər bazası yoxlaması + şəkil "əvvəl/sonra" proof**.
7. **Prod deploy**: Docker Compose (app+db+frontend), TLS, backup politikası, CI/CD, monitorinq, audit loqları. Çoxdillilik (AZ/RU/EN).