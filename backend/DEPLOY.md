# Campus Hub — Railway Production Deployment Guide

## Prerequisites

- [Railway CLI](https://docs.railway.app/develop/cli) installed (optional but helpful)
- A Railway account with a new project created
- Neon Postgres database provisioned
- Upstash Redis instance created
- Cloudinary account (free tier sufficient)
- Brevo SMTP API key (free tier: 300 emails/day)
- Payment gateway account (Stripe/Razorpay/Cashfree)

---

## 1. Required Environment Variables

Set all of the following in Railway → Project → Variables. **Never commit values to version control.**

| Variable | Description |
|---|---|
| `SPRING_PROFILES_ACTIVE` | Must be set to `prod` to load `application-prod.properties` |
| `DATABASE_URL` | Full Neon JDBC URL including `?sslmode=require&options=endpoint%3D<endpoint-id>` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis RESP (rediss://) URL — from Upstash console → Details |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis AUTH token (if using REST API client) |
| `CLOUDINARY_URL` | Full Cloudinary URL: `cloudinary://<api_key>:<api_secret>@<cloud_name>` |
| `BREVO_API_KEY` | Brevo (Sendinblue) SMTP API key for transactional emails |
| `WEBHOOK_SECRET` | Payment webhook signing secret |
| `JWT_SECRET` | HS256 secret, min 256 bits — generate with: `openssl rand -hex 64` |
| `CORS_ALLOWED_ORIGIN` | Your frontend URL, e.g. `https://campushub.vercel.app` |

> [!IMPORTANT]
> `DATABASE_URL` must use the **connection pooler** endpoint from Neon, not the direct endpoint.
> The Neon pooler URL looks like: `jdbc:postgresql://<pooler-host>/neondb?sslmode=require&options=endpoint%3D<endpoint-id>`

---

## 2. Dockerfile (Auto-detected)

Railway will automatically detect the `Dockerfile` in the `backend/` directory.  

**No manual start command is needed** — the `ENTRYPOINT` in the Dockerfile launches the JAR with optimised JVM flags:

```
-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0
```

If you need to override the build context (e.g. your Railway root is the monorepo root), set:

- **Root Directory**: `backend`

---

## 3. Health Check Endpoint

Railway performs health checks using HTTP. Configure in Railway → Settings → Health Check:

| Setting | Value |
|---|---|
| **Path** | `/actuator/health` |
| **Port** | `8080` |
| **Timeout** | `30s` |

For Kubernetes-style liveness/readiness probes:
- **Liveness**: `GET /actuator/health/liveness`
- **Readiness**: `GET /actuator/health/readiness`

Both are exposed publicly (no auth required) as configured in `SecurityConfig`.

---

## 4. Custom Domain (CNAME)

1. In Railway → Project → Settings → **Networking**, click **Generate Domain** for a free `*.railway.app` subdomain, or click **Custom Domain**.
2. In your DNS provider, add a **CNAME** record:
   - **Name**: `api` (or your chosen subdomain)
   - **Value**: the Railway-generated target (e.g. `campushub-production.up.railway.app`)
3. Railway provisions TLS automatically within ~60 seconds.
4. Update `CORS_ALLOWED_ORIGIN` on the frontend to point to the new domain.

---

## 5. Viewing Logs

### Via Railway Dashboard
1. Open your project in [railway.app](https://railway.app)
2. Click on the **campushub-backend** service
3. Click the **Logs** tab in the top-right
4. Use the search box to filter by level (`WARN`, `ERROR`) or class name

### Via Railway CLI
```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Stream live logs
railway logs --tail
```

---

## 6. Deployment Steps

```bash
# Option A — Push to GitHub (Railway auto-deploys on main branch push)
git push origin main

# Option B — Manual deploy via CLI
railway up --service campushub-backend
```

---

## 7. Rollback

In Railway Dashboard → Deployments, click **Rollback** on any previous successful deployment to instantly revert.

---

## 8. Post-Deploy Verification Checklist

- [ ] `GET /actuator/health` returns `{"status":"UP"}`
- [ ] `GET /actuator/health/readiness` returns `{"status":"UP"}`  
- [ ] Flyway migrations ran cleanly (check logs for `Successfully applied N migrations`)
- [ ] `POST /api/v1/auth/register` creates a user
- [ ] Email verification email arrives in inbox
- [ ] `GET /api/gigs` returns data
- [ ] Admin endpoints return 401 for unauthenticated requests
- [ ] Response headers include `X-Frame-Options: DENY` and `Content-Security-Policy`

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `HikariPool` timeout | Neon connection limit exceeded | Verify `hikari.maximum-pool-size=5` and you're using the pooler URL |
| `FlywayException: checksum mismatch` | Migration file edited after apply | Never edit applied migrations — create a new version |
| `401 Unauthorized` on admin routes | JWT missing `ROLE_ADMIN` claim | Check user role in DB; use `PUT /api/admin/users/:id/verify` |
| Cold starts > 10s | JVM warmup | Normal for first request; Railway keeps container warm after first deploy |
| Redis connection refused | Wrong Upstash URL format | Use `rediss://` (TLS) URL, not REST URL, in `spring.data.redis.url` |
