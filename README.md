# FinTrack

A full-stack personal finance management app for tracking income, expenses and transfers, with categorized transactions and visual spending statistics.

![.NET](https://img.shields.io/badge/.NET_8-512BD4?style=flat&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=flat&logo=csharp&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=flat&logo=microsoftsqlserver&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

> Team project developed for the *Software Engineering* course at the Faculty of Electronic Engineering, University of Niš.

## Screenshots

| Dashboard | Transactions |
|-----------|--------------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Transactions](docs/screenshots/transactions.png) |

## Features

- **Authentication** – user registration and login secured with JWT, role-based access with admin privileges
- **Transactions** – record income, expenses and transfers between accounts; edit, delete, filter and search
- **Categories** – create and manage custom categories to organize transactions
- **Statistics** – income vs. expense analysis and per-category breakdowns with interactive charts

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, Vite, JavaScript, React Router, Axios, Recharts |
| Backend | ASP.NET Core 8 Web API, Entity Framework Core, JWT Authentication |
| Database | Microsoft SQL Server (LocalDB) |
| Tools | Visual Studio, VS Code, Git, GitHub |

## Architecture

The application follows a client–server architecture with a RESTful API:

```text
React + Vite (SPA)
        │  HTTP / JSON
        ▼
ASP.NET Core Web API (.NET 8)
        │
        ▼
Entity Framework Core (Code First, migrations)
        │
        ▼
SQL Server
```

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) 18 or newer
- SQL Server LocalDB (installed with Visual Studio)
- EF Core CLI: `dotnet tool install --global dotnet-ef`

### 1. Clone the repository

```bash
git clone https://github.com/petarNi/fintrack.git
cd fintrack
```

### 2. Run the backend

```bash
cd Aplikacija/back/FinTrack
dotnet restore
dotnet ef database update
dotnet run
```

The API runs at `https://localhost:7112`.

### 3. Run the frontend

```bash
cd Aplikacija/front
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Project Structure

```text
fintrack/
├── Aplikacija/
│   ├── back/FinTrack/     # ASP.NET Core Web API (Controllers, Models, Data, Migrations)
│   └── front/             # React + Vite client
├── Dokumentacija/         # Project documentation (in Serbian)
└── README.md
```

## Documentation

Full project documentation (in Serbian) is available in [`Dokumentacija/`](Dokumentacija/) and includes the system vision, requirements specification, architecture design, test plan and user manual.

## Team

- **Petar Nikolić** – [@petarNi](https://github.com/petarNi)
- Aleksa Nešić
- Nikola Tančić
