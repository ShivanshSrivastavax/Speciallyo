# 💖 Speciallyo (LoveLink) — Interactive Proposal Web Application

> Create personalized, playful, and romantic proposal pages that make them smile, laugh, and say **YES!**

🌐 **Live Website**: [https://speciallyo.web.app](https://speciallyo.web.app)
🐙 **GitHub Repository**: [https://github.com/ShivanshSrivastavax/Speciallyo](https://github.com/ShivanshSrivastavax/Speciallyo)
🐘 **Database**: Neon Serverless PostgreSQL (`royal-poetry-03626180`)

---

## ✨ Features

- **🪄 Playful "No" Button Physics**:
  - **The Evader**: The "No" button playfully flees the cursor and finger taps in panic.
  - **Shrinking No**: Shrinks with each click attempt until it vanishes.
  - **Growing Yes**: The "Yes" button grows bigger with each hover until it covers the screen.
  - **Teleportation**: Jumps between random screen quadrants.
- **💌 Romantic Visuals & Micro-Interactions**:
  - Realistic opening letter / envelope animation.
  - Floating ambient hearts and sparkle effects.
  - Curated reaction GIFs (cute bears, hugging cats, peach & goma, anime love).
  - Confetti explosion and celebratory chimes upon clicking "YES".
- **🎵 Spotify & Secret Love Letter**:
  - Embedded Spotify songs/playlists.
  - Handwritten-style secret note revealed upon acceptance.
- **📊 Creator Dashboard & Analytics**:
  - Real-time response tracker with exact acceptance timestamps.
  - Visitor device and browser logs.
  - Instant shareable links with custom slugs (`/p/:slug`).
  - High-resolution QR Code generator with instant PNG download.
- **🔐 Secure Authentication**:
  - JWT-based authentication with bcrypt password hashing and Zod input validation.
  - SQLite default (with PostgreSQL Docker support).

---

## 🚀 Quick Start

### 1. Backend Server Setup
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```
The server runs on **`http://localhost:5000`**.

### 2. Frontend Client Setup
```bash
cd client
npm install
npm run dev
```
The client runs on **`http://localhost:5173`**.

---

## 🗄️ Database & Environment Variables

### Server (`server/.env`)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-jwt-key"
CLIENT_URL="http://localhost:5173"
SERVER_URL="http://localhost:5000"
PORT=5000
```

### Optional PostgreSQL Docker
If you wish to use PostgreSQL instead of SQLite:
```bash
docker-compose up -d
```
Update `server/prisma/schema.prisma` datasource to `postgresql` and set `DATABASE_URL="postgresql://root:password@localhost:5432/lovelink?schema=public"`.

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/me` | Fetch authenticated user |
| `GET` | `/api/proposals` | List user's proposals with response counts |
| `POST` | `/api/proposals` | Create a new customized proposal |
| `GET` | `/api/proposals/:id` | Get proposal details & analytics |
| `PUT` | `/api/proposals/:id` | Update proposal parameters |
| `DELETE` | `/api/proposals/:id` | Delete proposal |
| `GET` | `/api/proposals/:id/responses` | Fetch responses and visitor logs |
| `GET` | `/api/public/proposals/:slug` | Public proposal page data |
| `POST` | `/api/public/proposals/:slug/respond` | Submit recipient acceptance |
| `POST` | `/api/public/proposals/:slug/visit` | Track visitor view |

---

## 🎨 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons, QRCode.react, Zustand, Axios.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, SQLite / PostgreSQL, Zod, JWT, Bcrypt.
