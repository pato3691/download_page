# Download & Upload System

Komplexný systém na upload/download súborov s administráciou, emailovými notifikáciami a hromadným odosielaním emailov.

## Vlastnosti

### 👥 Používateľská strana
- **Download s registráciou**: Email, IP, čas a typ súboru sa zaznamenávajú
- **60-sekundový odpočet**: Čas na preskúmanie podmienok
- **Emailová potvrdenka**: Automatické odoslanie potvrdenia po downloade
- **Podpora zložiek**: Možnosť stahovania zložiek s hierarchiou
- **Krásne UI**: Tailwind CSS s gradientmi a animáciami

### 🔧 Administrácia
- **SMTP Konfigurácia**: Nastavenie vlastného SMTP servera
- **Štatistika**: Prehľad downloadov, emailov a trendov
- **Správa súborov**: Upload, delete a organizácia súborov
- **Hromadný email**: Odosielanie emailov viacerým príjemcom naraz
- **Logy emailov**: Sledovanie stavu odoslaných emailov

## Technológie

- **Frontend**: Next.js 16+, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Databáza**: SQLite s better-sqlite3
- **Email**: Nodemailer
- **Ikony**: Lucide React

## Inštalácia

```bash
# Klonovanie
git clone <repo-url>
cd my_download_page

# Inštalácia dependency
npm install

# Inicializácia databázy
curl http://localhost:3000/api/init-db

# Spustenie dev servera
npm run dev
```

## Nastavenie

### 1. Inicializácia databázy
Po prvom spustení navaštívte:
```
http://localhost:3000/api/init-db
```

### 2. SMTP Konfigurácia
1. Prejdite na `/` a kliknite na **Settings** (ikona ozubeného kolesa)
2. Zadajte heslo: `admin123`
3. Prejdite na tab **SMTP**
4. Vyplňte SMTP údaje vášho providera:
   - **Host**: `smtp.gmail.com` (pre Gmail)
   - **Port**: `587` (TLS) alebo `465` (SSL)
   - **Email**: Vaša emailová adresa
   - **Heslo**: Vaše heslo alebo app password
   - **From Email**: Email odosielateľa

### 3. Upload Súborov
1. V Admin Paneli prejdite na tab **Súbory**
2. Tu budú viditeľné všetky súbory v `/public/uploads`

## API Endpoints

### Downloads
- `POST /api/downloads` - Registrácia downloadovaného súboru
- `GET /api/downloads?email=...` - Zoznam downloadov pre email

### SMTP Config
- `GET /api/smtp-config` - Načítanie SMTP konfigu
- `POST /api/smtp-config` - Uloženie SMTP konfigu

### Files
- `GET /api/files` - Zoznam súborov
- `DELETE /api/files` - Zmazanie súboru

### Admin
- `GET /api/admin/stats` - Štatistika
- `POST /api/admin/send-bulk-email` - Hromadný email

## Heslo do administrácie

**Demo heslo**: `admin123`

⚠️ **V produkcii zmeniť na silné heslo v kóde!**

## Priradený formulár

### Download Modal

```typescript
interface DownloadRequest {
  email: string;        // Emailová adresa
  fileName: string;     // Meno súboru
  filePath: string;     // Cesta k súboru
}
```

### Hromadný Email

```typescript
interface BulkEmailRequest {
  recipients: string[];  // Pole emailov
  subject: string;       // Predmet
  message: string;       // HTML správa
}
```

## Databázové tabuľky

### smtp_config
- Uloženie SMTP nastavení

### downloads
- Email, súbor, IP, čas, useragent

### email_logs
- Históriu odoslaných emailov

### uploaded_files
- Zoznam uploadnutých súborov a zložiek

## Produkcia

### Príprava
```bash
# Build
npm run build

# Test build
npm start
```

### Environment premenné
Vytvorte `.env.local`:
```
# Niečo budúce features
```

## Troubleshooting

### Email nejde
1. Skontrolujte SMTP nastavenia
2. Povoľte menej bezpečné aplikácie (Gmail)
3. Skontrolujte logy v Admin > Štatistika

### Databáza not found
```bash
curl http://localhost:3000/api/init-db
```

### Port 3000 je obsadený
```bash
PORT=3001 npm run dev
```

## Licencia

MIT

## Autor

Vytvorené s ❤️ pre správu downloadov
