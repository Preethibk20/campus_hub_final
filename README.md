# Campus Hub — Skill Exchange Marketplace

A peer-to-peer platform where college students post and hire each other for skill-based gigs (tutoring, design, coding, etc.), with escrow payments via Razorpay and real-time chat.

---

## Local Development Quickstart

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Docker Desktop | Latest | https://www.docker.com/products/docker-desktop |
| Java (Temurin) | 21 LTS | https://adoptium.net |
| Node.js | 20 LTS | https://nodejs.org |
| IntelliJ IDEA | Community | https://www.jetbrains.com/idea/download |
| VS Code | Latest | https://code.visualstudio.com |

---

### Step 1 — Start local services

From the project root, spin up Postgres, Redis, MinIO, and Mailpit:

```bash
docker compose up -d
```

Verify all four containers are healthy:

```bash
docker compose ps
```

---

### Step 2 — Configure and run the backend

1. Copy the example config and fill in your values:

```bash
cp backend/src/main/resources/application-local.properties.example \
   backend/src/main/resources/application-local.properties
```

2. Open the `backend/` folder in IntelliJ and run `CampusHubApplication` with the `local` Spring profile active:

```
-Dspring.profiles.active=local
```

Or from the terminal:

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Flyway migrations run automatically on startup.

---

### Step 3 — Configure and run the frontend

1. Copy the env example and fill in your values:

```bash
cp .env.example .env.local
```

See [`.env.example`](.env.example) for all required keys.

2. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

---

### Local Service URLs

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:5173 | Vite dev server |
| API | http://localhost:8080 | Spring Boot |
| Mailpit UI | http://localhost:8025 | Catches all outbound email |
| MinIO Console | http://localhost:9001 | user: `minioadmin` / pass: `minioadmin` |
| MinIO API | http://localhost:9000 | S3-compatible endpoint |
| Postgres | localhost:5432 | DB: `campushub`, user: `dev` |
| Redis | localhost:6379 | No auth in local mode |

---

### Stopping services

```bash
docker compose down
```

To also wipe persisted data (Postgres + MinIO volumes):

```bash
docker compose down -v
```
