# 🚀 Free Tier Hosting Plan & Deployment Guide

This guide outlines how to host your entire stack (Frontend, Backend, and Database) for **FREE** using modern cloud providers.

## 🏗 Architecture Overview

| Component | Service Provider | Pricing Tier | Notes |
|-----------|------------------|--------------|-------|
| **Frontend** | **Vercel** | Free (Hobby) | Best performance, global CDN, auto-deployment from Git. |
| **Database** | **Supabase** | Free | 500MB storage, managed PostgreSQL. Perfect for persistent data. |
| **Backend** | **Render** | Free | 512MB RAM. **Note:** Spins down after inactivity (slow first request). |

---

## 📦 Phase 1: Database Setup (Supabase)

1.  Go to [Supabase.com](https://supabase.com) and create a free account.
2.  Create a **New Project**.
3.  Set a secure **Database Password** (Save this!).
4.  Once created, go to **Project Settings** -> **Database**.
5.  Copy the **Connection String** (URI Mode). It looks like:
    `postgresql://postgres:[YOUR-PASSWORD]@db.project.supabase.co:5432/postgres`

---

## 🛠 Phase 2: Backend Deployment (Evolution API)

*The backend requires a server to run WhatsApp instances. We will use Render.*

1.  **Fork/Clone the API Repo**: Ensure you have the [Evolution API Code](https://github.com/EvolutionAPI/evolution-api) available in your GitHub account.
2.  Go to [Render.com](https://render.com) and sign up.
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository for `evolution-api`.
5.  **Configure Service**:
    *   **Name**: `my-evolution-api` (or unique name)
    *   **Runtime**: `Docker`
    *   **Instance Type**: `Free`
6.  **Environment Variables** (Add these in the "Environment" tab):
    *   `SERVER_PORT`: `8080`
    *   `SERVER_URL`: `https://your-render-app-name.onrender.com`
    *   `AUTHENTICATION_API_KEY`: `your-secure-api-key-here` (Make one up, e.g., `evolution123`)
    *   `DATABASE_ENABLED`: `true`
    *   `DATABASE_PROVIDER`: `postgresql`
    *   `DATABASE_CONNECTION_URI`: *(Paste your Supabase connection string here)*
    *   `DATABASE_CLIENT_NAME`: `evolution_exchange`
    *   `RABBITMQ_ENABLED`: `false` (Disable for simple free setup)
    *   `SQS_ENABLED`: `false`
    *   `WEBSOCKET_ENABLED`: `false` (Free tier might struggle with WS, set true if needed)
7.  Click **Create Web Service**.
    *   *Warning*: The build might take a few minutes.
    *   *Note on Free Tier*: Render's free tier has **512MB RAM**. Heavy WhatsApp usage (many instances) might cause it to restart. For production, upgrading to the $7/mo Starter plan is highly recommended.

---

## 🌐 Phase 3: Frontend Deployment (Vercel)

1.  Push your current `evolution-bulk-sender` code to legitimate **GitHub Repository**.
2.  Go to [Vercel.com](https://vercel.com) and sign up.
3.  Click **Add New...** -> **Project**.
4.  Import your `evolution-bulk-sender` repository.
5.  **Configure Build**:
    *   **Framework Preset**: `Vite` (Should detect automatically).
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
6.  **Environment Variables**:
    *   Wait! You don't need build-time env vars because this app allows changing the API URL in the UI (Settings tab).
    *   No strictly required vars for build.
7.  Click **Deploy**.

## 🔗 Phase 4: Connecting Them

1.  Once Vercel finishes, you will get a URL (e.g., `https://evolution-bulk-sender.vercel.app`).
2.  Open your new Frontend URL.
3.  Go to the **Settings** tab in the sidebar.
4.  **API URL**: Enter your Render Backend URL (e.g., `https://my-evolution-api.onrender.com`).
    *   *Important*: Do not add a trailing slash `/`.
5.  **API Key**: Enter the `AUTHENTICATION_API_KEY` you set in Render step 6.
6.  Click **Save**.

**🎉 Done! You now have a fully hosted Bulk Sender system running for free.**

---

### ⚠️ Limitations of "Free Tier"
1.  **Cold Starts**: Render's free server will "sleep" after 15 minutes of inactivity. The first request will take 30-50 seconds to wake it up.
    *   *Fix*: Use a free uptime monitor (like UptimeRobot) to ping your Render URL every 5 minutes.
2.  **RAM Limits**: 512MB is tight for Puppeteer (the browser engine WhatsApp uses).
    *   If you see "Connection Closed" often, you may need to delete unused instances or upgrade hosting.
