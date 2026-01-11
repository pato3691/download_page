# Download & Upload System

Moderný systém na bezpečné sťahovanie a nahrávanie súborov s emailovou registráciou, administračným panelom a hromadným odosielaním emailov.

## Funkcionality

### 🎯 Hlavné Funkcionality
- **Download súborov** s 60 sekundovým odpočtom
- **Emailová registrácia** - všetky downloady sa zaznamenávajú
- **Priečinková štruktúra** - podpora na priechodenie priečinkami
- **Správa súborov** - upload, delete, organizácia
- **Admin panel** - kompletná kontrola systému

### 📊 Administrácia
- **Štatistika** - celkové downloady, jedinečné emaily, podrobnosti
- **SMTP Konfigurácia** - nastavenie vlastného email servera
- **Hromadný email** - odoslanie správ skupinám recipientov
- **Správa súborov** - mazanie a organizácia

### 📧 Email Systém
- Automatické potvrdzovacie emaily
- Hromadné odosielanie
- Zaznamenávanie všetkých emailov v databáze
- Podpora vlastného SMTP servera

### 🗄️ Databáza
- SQLite s automatickými tabuľkami
- Záznamy: downloads, emails, SMTP config, logy
- IP adresa, User Agent, čas stiahnutia

## Technológie

- **Frontend**: Next.js 16, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Databáza**: SQLite (better-sqlite3)
- **Email**: Nodemailer
- **Ikony**: Lucide React
- **Validácia**: Zod

## Inštalácia a Spustenie

### Požiadavky
- Node.js 18+
- npm

### Kroky

1. **Inštalácia dependencií**
```bash
npm install
```

2. **Inicializácia databázy**
- Databáza sa automaticky vytvorí pri prvom spustení
- Alebo navštívite: `http://localhost:3000/api/init-db`

3. **Spustenie dev servera**
```bash
npm run dev
```

4. **Otvoriť v prehliadači**
```
http://localhost:3000
```

## Konfigurácia

### Admin Heslo
Default admin heslo: `admin123`

**ZMENIŤ V PRODUKCII!** Editujte súbor `src/components/AdminPanel.tsx` a zmeňte heslo.

### SMTP Server Setup
1. Navštívite Admin panel (kliknite na ikonu nastavení)
2. Prejdite na záložku "SMTP"
3. Zadajte:
   - SMTP Host (napr. smtp.gmail.com)
   - Port (napr. 587 alebo 465)
   - Email užívateľa
   - Heslo
   - Email odosielateľa

## Používanie

### Sťahovanie súborov
1. Kliknite na súbor v zozname
2. Počkajte 60 sekúnd
3. Vyplňte emailovú adresu
4. Zaškrtnite súhlas s podmienkami
5. Kliknite "Stiahnuť"
6. Dostanete potvrdzovací email

### Administrácia

#### Štatistika
- Celkový počet downloadov
- Počet jedinečných emailov
- Posledné downloady a emaily

#### Hromadný Email
- Vložte emaily (jeden na riadok)
- Napíšte predmet a správu (HTML)
- Kliknite "Odoslať Emaily"

#### Správa Súborov
- Prehliadajte nahraté súbory
- Mažte súbory
- Navigujte v priečinkoch

## Štruktúra Projektu

```
my_download_page/
├── src/
│   ├── app/
│   │   ├── api/              # API Routes
│   │   │   ├── init-db/      # DB inicializácia
│   │   │   ├── downloads/    # Download management
│   │   │   ├── smtp-config/  # SMTP settings
│   │   │   ├── files/        # File management
│   │   │   └── admin/        # Admin endpoints
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Hlavná stránka
│   │   └── globals.css       # Global styles
│   ├── components/           # React komponenty
│   │   ├── AdminPanel.tsx    # Admin rozhranie
│   │   ├── DownloadModal.tsx # Modal na stiahnutie
│   │   ├── FileList.tsx      # Zoznam súborov
│   │   └── admin/            # Admin komponenty
│   └── lib/                  # Utility funkcie
│       ├── db.ts            # Databázové funkcie
│       ├── email.ts         # Email funkcie
│       └── file-manager.ts  # Správa súborov
├── public/
│   └── uploads/             # Nahrané súbory
├── data/
│   └── app.db              # SQLite databáza
├── package.json
└── README.md
```

## API Endpoints

### Databáza
- `GET /api/init-db` - Inicializácia databázy

### Downloads
- `GET /api/downloads?email=...` - Zoznam downloadov pre email
- `POST /api/downloads` - Registrácia nového downloadu

### SMTP Config
- `GET /api/smtp-config` - Získať SMTP nastavenia
- `POST /api/smtp-config` - Uložiť SMTP nastavenia

### Súbory
- `GET /api/files` - Zoznam súborov
- `DELETE /api/files` - Zmazať súbor

### Admin
- `GET /api/admin/stats` - Štatistika a logy
- `POST /api/admin/send-bulk-email` - Hromadný email

## Build pre Produkciu

```bash
npm run build
npm start
```

## Bezpečnosť

### Nápravy
- ✅ HTTPS v produkcii (nastavit na serveri)
- ✅ Validácia email adresy
- ✅ Záznamy IP adres
- ✅ Heslo chrané v DB
- ⚠️ **Zmeniť default heslo**
- ⚠️ **Implementovať autentifikáciu pre admin**
- ⚠️ **CORS politika podľa potreby**

## Budúce Vylepšenia

- [ ] Autentifikácia s JWT
- [ ] Role-based access control
- [ ] Šifrovanie hesiel
- [ ] Rate limiting
- [ ] File upload formulár
- [ ] Stahovanie celých priečinkov ZIP-om
- [ ] Notifikácie v reálnom čase
- [ ] Analytics a reporty

## Licencia

MIT

## Podpora

V prípade problémov alebo otázok, kontaktujte administrátora.
