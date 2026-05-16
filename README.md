# FinTrack 
Sistem Manajemen Keuangan

> Tugas Besar Pemrograman Berorientasi Objek  
> Aplikasi manajemen keuangan berbasis web (Spring Boot + React)

---

## 📁 Struktur Repository

```
fintrack/
├── backend/                  # Spring Boot REST API
│   ├── src/
│   │   └── main/java/com/fintrack/
│   │       ├── controller/   # REST Controllers
│   │       ├── service/      # Business Logic
│   │       ├── repository/   # JPA Repositories
│   │       ├── model/        # JPA Entities
│   │       ├── dto/          # Data Transfer Objects
│   │       ├── security/     # JWT & Filter
│   │       └── config/       # Spring Security Config
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── frontend/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/            # Halaman utama
│   │   ├── components/       # Komponen reusable
│   │   ├── hooks/            # Custom hooks (Auth)
│   │   ├── utils/            # API client & helpers
│   │   └── styles/           # CSS global
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── database/
│   └── fintrack_db.sql       # Schema + seed data
├── docs/
│   ├── laporan_akhir.pdf     # Laporan akhir
│   └── class_diagram.png     # Class diagram realisasi
└── README.md
```

---

## ⚙️ Prasyarat

| Software     | Versi Minimum |
|--------------|--------------|
| Java JDK     | 17           |
| Maven        | 3.8+         |
| MySQL        | 8.0+         |
| Node.js      | 18+          |
| npm          | 9+           |

---

## 🗄️ Konfigurasi Database

### 1. Buat Database & Import Schema

Buka terminal MySQL atau MySQL Workbench, lalu jalankan:

```sql
-- Import langsung dari file SQL
source /path/to/fintrack/database/fintrack_db.sql;
```

Atau via command line:

```bash
mysql -u root -p < database/fintrack_db.sql
```

Perintah ini akan otomatis:
- Membuat database `fintrack_db`
- Membuat seluruh tabel (users, wallets, transactions, categories, budgets)
- Mengisi data kategori default
- Membuat akun demo: `nathan@fintrack.com` / `demo1234`

---

## 🚀 Menjalankan Backend (Spring Boot)

### 1. Konfigurasi `application.properties`

Edit file `backend/src/main/resources/application.properties`:

```properties
# Sesuaikan dengan kredensial MySQL Anda
spring.datasource.url=jdbc:mysql://localhost:3306/fintrack_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# JWT secret (ubah di production)
jwt.secret=fintrack_jwt_secret_key_2024_secure_random_string_here_minimum_256_bits
jwt.expiration=86400000
```

### 2. Build & Jalankan

```bash
cd backend

# Build project
mvn clean package -DskipTests

# Jalankan aplikasi
mvn spring-boot:run
```

Backend akan berjalan di: `http://localhost:8080`

### Verifikasi Backend

```bash
curl http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nathan@fintrack.com","password":"demo1234"}'
```

---

## 🌐 Menjalankan Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di: `http://localhost:3000`

> **Catatan:** Vite sudah dikonfigurasi untuk mem-proxy request `/api` ke `localhost:8080`, sehingga tidak ada masalah CORS saat development.

---

## 🔑 Akun Demo

| Field    | Value                  |
|----------|------------------------|
| Email    | nathan@fintrack.com    |
| Password | demo1234               |

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint            | Deskripsi        | Auth |
|--------|---------------------|------------------|------|
| POST   | `/api/auth/register`| Registrasi akun  | ❌   |
| POST   | `/api/auth/login`   | Login & get token| ❌   |

### Transactions

| Method | Endpoint                   | Deskripsi              | Auth |
|--------|----------------------------|------------------------|------|
| GET    | `/api/transactions`        | Ambil semua transaksi  | ✅   |
| POST   | `/api/transactions`        | Buat transaksi baru    | ✅   |
| PUT    | `/api/transactions/{id}`   | Edit transaksi         | ✅   |
| DELETE | `/api/transactions/{id}`   | Hapus transaksi        | ✅   |

### Budgets

| Method | Endpoint          | Deskripsi        | Auth |
|--------|-------------------|------------------|------|
| GET    | `/api/budgets`    | Ambil semua budget | ✅  |
| POST   | `/api/budgets`    | Buat budget baru | ✅   |
| DELETE | `/api/budgets/{id}` | Hapus budget   | ✅   |

### Reports

| Method | Endpoint                 | Deskripsi              | Auth |
|--------|--------------------------|------------------------|------|
| GET    | `/api/reports/summary`   | Ringkasan keseluruhan  | ✅   |
| GET    | `/api/reports/monthly`   | Laporan per bulan      | ✅   |

### Categories

| Method | Endpoint              | Deskripsi                     | Auth |
|--------|-----------------------|-------------------------------|------|
| GET    | `/api/categories`     | Semua kategori                | ✅   |
| GET    | `/api/categories/income` | Kategori pemasukan         | ✅   |
| GET    | `/api/categories/expense`| Kategori pengeluaran       | ✅   |

> Semua endpoint yang membutuhkan Auth harus menyertakan header:
> `Authorization: Bearer <token>`

---

## 🏗️ Arsitektur Sistem

```
React Frontend (Port 3000)
        │
        │  HTTP/REST (JSON)
        ▼
Spring Boot Backend (Port 8080)
        │
        │  JPA/Hibernate
        ▼
    MySQL 8.x
  (fintrack_db)
```

### Layer Architecture Backend

```
Controller Layer   ─── Menerima HTTP request, validasi input
      │
Service Layer      ─── Business logic, aturan bisnis
      │
Repository Layer   ─── Query database via JPA
      │
Model/Entity Layer ─── Representasi tabel database
```

---

## 🔐 Business Rules

- Nominal transaksi harus positif (> 0)
- EXPENSE mengurangi saldo wallet, INCOME menambah saldo
- Budget warning muncul saat penggunaan ≥ 80%
- Budget hard limit aktif saat penggunaan ≥ 100%
- Setiap user hanya dapat mengakses data miliknya sendiri (isolasi data via JWT)
- Password di-hash menggunakan BCrypt

---

## 🛠️ Build Production

### Backend

```bash
cd backend
mvn clean package
java -jar target/fintrack-backend-1.0.0.jar
```

### Frontend

```bash
cd frontend
npm run build
# Output di folder dist/
```

---

## 👥 Tim Pengembang

| Nama     | NIM | Peran |
|----------|-----|-------|
| (Nama 1) | -   | Backend Developer |
| (Nama 2) | -   | Frontend Developer |
| (Nama 3) | -   | Database & Testing |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik — Tugas Besar Mata Kuliah Pemrograman Berorientasi Objek.
