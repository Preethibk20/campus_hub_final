# Campus Hub - Vercel Deployment Guide

This guide walks you through deploying the Campus Hub frontend to Vercel.

## Prerequisites

- A [Vercel](https://vercel.com) account
- Your backend API deployed (e.g., on Railway, Render, or AWS)
- GitHub repository with your Campus Hub code

## Step 1: Prepare Your Repository

1. Ensure your repository has the following structure:
   ```
   Campus_hub/
   ├── src/
   ├── public/
   ├── index.html
   ├── package.json
   ├── vite.config.ts
   ├── tsconfig.json
   ├── tailwind.config.js
   └── vercel.json          # Already included
   ```

2. The `vercel.json` file handles SPA routing:
   ```json
   {
     "routes": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

## Step 2: Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Select the `Campus_hub` folder as the root directory

## Step 3: Configure Build Settings

In the Vercel project configuration, set:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Build Command Explanation
- Vite builds the production bundle to the `dist/` folder
- Vercel serves the static files from this folder

## Step 4: Add Environment Variables

In the Vercel dashboard, go to **Settings → Environment Variables** and add:

### Required Variables

```
VITE_API_URL=https://your-backend-url.up.railway.app
```
Replace with your actual backend API URL (e.g., from Railway, Render, or AWS).

### Optional Variables

```
VITE_PAYMENT_KEY_ID=your_payment_key_id
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### Getting Your Backend URL (Railway Example)

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your backend project
3. Go to **Settings → Domains**
4. Copy the generated domain (e.g., `https://campus-hub-api.up.railway.app`)
5. Use this as your `VITE_API_URL`

## Step 5: Deploy

1. Click **"Deploy"**
2. Vercel will build your project (this takes 1-2 minutes)
3. Once complete, you'll get a production URL (e.g., `https://campus-hub.vercel.app`)

## Step 6: Verify Deployment

Test these features to ensure everything works:

- [ ] Landing page loads correctly
- [ ] Login/Register pages work
- [ ] API calls succeed (check browser Network tab)
- [ ] Images load from Cloudinary
- [ ] WebSocket connections work (chat)

## Troubleshooting

### Issue: API calls failing (404 or CORS errors)

**Solution:** 
1. Verify `VITE_API_URL` is correct
2. Ensure your backend has CORS enabled for your Vercel domain:
   ```java
   // Spring Boot example
   @CrossOrigin(origins = {"https://campus-hub.vercel.app", "http://localhost:5173"})
   ```

### Issue: Images not uploading

**Solution:**
1. Verify Cloudinary environment variables
2. Check Cloudinary upload preset settings (unsigned uploads enabled)

### Issue: WebSocket chat not working

**Solution:**
1. Ensure your backend supports WebSocket/SockJS
2. Check `VITE_WS_URL` is using `wss://` (secure) for production

## Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Update your backend's CORS config to allow the new domain

## Automatic Deployments

Vercel automatically deploys when you push to your main branch. To preview changes:

1. Create a Pull Request
2. Vercel generates a preview deployment
3. Test the preview URL before merging

## Production Checklist

Before launching to users:

- [ ] Backend deployed and running
- [ ] Environment variables configured
- [ ] CORS enabled for production domain
- [ ] Razorpay in Live mode (not Test mode)
- [ ] Cloudinary optimized for production
- [ ] SSL certificate active (Vercel provides this)
- [ ] 404 page working
- [ ] Error monitoring enabled (Sentry recommended)

## Support

For issues with:
- **Vercel deployment**: Check [Vercel Docs](https://vercel.com/docs)
- **Frontend bugs**: Open an issue in your project repository
- **Backend issues**: Check your Railway/Heroku/AWS logs

---

**Quick Deploy Command** (for CLI users):
```bash
npm i -g vercel
vercel --prod
```
