# Şəhər Xidmətləri — Bakı şikayət portalı

Bakı şəhəri üzrə ətraf/şəhər infrastrukturu problemlərinin **vahid rəqəmsal şikayət portalı**:
vətəndaş xəritədə qeyd edir → sistem nömrə verir → idarə işçiləri həll prosesini aparır → şikayətçi real vaxtda izləyir.

> **"Şəhərdə gördüyünüz hər məsələ — bir şikayətdən həllə."**

## Xüsusiyyətlər

- Şikayət: kateqoriya, prioritet, **şəkil yükləmə**, **xəritədə yer / cari yer** (Leaflet)
- Status axını: `PENDING → UNDER_REVIEW → IN_PROGRESS → RESOLVED` (+ RƏDD/LƏĞV), qanuni keçid yoxlaması
- Şərhlər: açıq + **staff üçün daxili**; status xronologiyası
- Staff paneli: "İşlər" siyahısı, təyinat (assign), staff xəritəsi, status idarəsi
- Admin: istifadəçilər (rol dəyişmə), kateqoriya CRUD, "vətəndaş adından" şikayət
- Statistika səhifəsi (Recharts), rol-bazlı naviqasiya
- Editorial "qəşəng" dizayn sistemi (grain, serif tip, hairline, animasiyalar)

## Rollar

`CITIZEN` · `FIELD_EMPLOYEE` · `DEPARTMENT_MANAGER` · `ADMIN` (JWT auth)

## Texnologiyalar

- **Backend:** Java 21 · Spring Boot 4 · Spring Security (JWT) · Spring Data JPA · Flyway · PostgreSQL
- **Frontend:** React 19 · TypeScript · Vite · Tailwind CSS v4 · react-leaflet · recharts

## Lokal işə salma

1. PostgreSQL-i işə salın (məs.: Docker `city-db`, port 5432).
2. `cp .env.example .env` → **parol və JWT_SECRET-i doldurun** (`.env` repoya düşmür).
3. Backend: `./mvnw spring-boot:run` — sirlər lokalda `application-local.yml` (git-ignored) ilə də verilə bilər.
4. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev      # http://localhost:5173 (API-ya proxy edir)
   ```

## Production (Docker)

```bash
cp .env.example .env     # DB parolu, JWT_SECRET, CORS_ORIGINS=domeniniz
docker compose up -d --build
```

- `db` — PostgreSQL 16, `backend` — Spring Boot (şəkillər `uploads/` volume-unuzda), `frontend` — Nginx (statik SPA + `/api` və `/uploads` proxy).
- Backend `8080` daxili saxlanır; xaricə yalnız `80` (Nginx) açılır. HTTPS üçün Nginx + Let's Encrypt (və ya reverse-proxy) qoşun.

## Konfiqurasiya

`.env.example` bütün dəyişənləri izah edir. `application.yml` env-dən oxuyur: `DB_*`, `JWT_*`, `CORS_ORIGINS`, `UPLOAD_DIR`, `BOOTSTRAP_*`, `SEED_CATEGORIES`.

## Test

```bash
./mvnw test
```

## Ətraflı sistem təsviri

Funksiyalar, rollar, səhifələr, API siyahısı və real istehsal yol xəritəsi: [`SYSTEM_DESCRIPTION.md`](./SYSTEM_DESCRIPTION.md).