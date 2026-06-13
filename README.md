# FinTrack – SW2025

FinTrack je informacioni sistem za upravljanje ličnim finansijama razvijen u okviru predmeta **Softversko inženjerstvo** na Elektronskom fakultetu Univerziteta u Nišu.

Projekat omogućava korisnicima da prate svoje prihode, rashode i transfere, organizuju transakcije po kategorijama i analiziraju svoje finansijske navike kroz pregled statistike i izveštaja.

## ✨ Glavne funkcionalnosti

### 👤 Upravljanje korisnicima

* Registracija korisnika
* Prijava i odjava sa sistema
* JWT autentifikacija i autorizacija
* Administratorske privilegije

### 💰 Upravljanje transakcijama

* Evidencija prihoda
* Evidencija rashoda
* Evidencija transfera između računa
* Pregled svih transakcija
* Izmena i brisanje transakcija
* Filtriranje i pretraga podataka

### 📂 Kategorije

* Kreiranje kategorija transakcija
* Izmena i brisanje kategorija
* Organizacija transakcija po kategorijama

### 📊 Statistika i analiza

* Pregled finansijskih podataka
* Statistika po kategorijama
* Analiza prihoda i rashoda
* Vizuelni prikaz podataka

## 🏗 Arhitektura sistema

Sistem je razvijen kao višeslojna web aplikacija:

```text
React + Vite (Frontend)
        ↓
ASP.NET Core Web API (.NET 8)
        ↓
Entity Framework Core
        ↓
Relaciona baza podataka
```

## 📂 Struktura repozitorijuma

```text
SW2025
│
├── front/                 # React frontend aplikacija
├── back/
│   └── FinTrack/          # ASP.NET Core Web API
│
├── Dokumentacija/
│   ├── Vizija sistema
│   ├── Specifikacija zahteva
│   ├── Arhitekturni projekat
│   ├── Plan testiranja
│   └── Korisničko uputstvo
│
└── README.md
```

## 🛠 Korišćene tehnologije

### Frontend

* React
* Vite
* JavaScript
* Axios
* React Router
* Recharts

### Backend

* ASP.NET Core 8
* Entity Framework Core
* JWT Authentication
* REST API

### Alati

* Visual Studio
* Visual Studio Code
* Git
* GitHub

## ▶️ Pokretanje projekta

### Backend

Pokrenuti API:

```bash
cd back/FinTrack
dotnet restore
dotnet run
```

Backend će biti dostupan na adresi definisanoj u konfiguraciji projekta.

### Frontend

Pokrenuti React aplikaciju:

```bash
cd front
npm install
npm run dev
```

Frontend će biti dostupan na:

```text
http://localhost:5173
```

## 📑 Dokumentacija

U okviru projekta izrađena je kompletna projektna dokumentacija koja obuhvata:

* Viziju sistema,
* Specifikaciju zahteva,
* Arhitekturni projekat,
* Plan testiranja,
* Korisničko uputstvo.

## 👥 Tim

Ovaj projekat je realizovan kao timski rad u okviru predmeta **Softversko inženjerstvo**.

### Članovi tima

* Petar Nikolić
* Aleksa Nešić
* Nikola Tančić

Elektronski fakultet Univerziteta u Nišu

---

**FinTrack** je razvijen sa ciljem da korisnicima omogući jednostavno upravljanje ličnim finansijama, bolji uvid u potrošačke navike i efikasnije planiranje budžeta kroz moderno web okruženje.
