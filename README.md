# BookLender — Frontend

Next.js 14 frontend for the Bücher-Ausleihe app.

## Prerequisites

- Node.js 18+
- C# ASP.NET Core backend running on `localhost:5068`
- MS SQL Server running (via Docker)

## Install

```bash
npm install
```

## Start Dev Server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Backend Connection

`next.config.mjs` proxies all `/api/*` requests to the C# backend:

```
Frontend (localhost:3000) → /api/* → Backend (localhost:5068/api/*)
```

No extra config needed. Just make sure backend is running on port `5068`.

## Start Backend (Docker DB)

```bash
docker-compose up -d
```

Starts MS SQL Server on `localhost:1433`.

Then start C# API in Rider — it connects to the Docker DB.



## Pages

| Route      | Description           |
|------------|-----------------------|
| `/`        | Login                 |
| `/catalog` | Browse & borrow books |
| `/loans`   | My active loans       |
