# LoanWise AI — Deployment Guide

This document outlines deployment architectures and step-by-step procedures for hosting the **LoanWise AI** platform across production environments.

---

## Architecture Overview

LoanWise AI consists of three decoupled layers:
1. **Frontend**: Static Single-Page Application (SPA) built with React 19 + Vite (Deployable on **Vercel** / Netlify / Cloudflare Pages).
2. **Backend**: Node.js + Express REST API managing validation, authentication, and orchestration (Deployable on Render / Railway / DigitalOcean / AWS).
3. **ML Runtime**: Python 3.12 environment executing scikit-learn inference and report generation.
4. **Database**: MongoDB (Self-hosted or MongoDB Atlas).

---

## 1. Frontend Deployment on Vercel

The project includes pre-configured `vercel.json` files in both the project root and `client/` directories.

### Option A: Deploying from Git via Vercel Dashboard
1. Link your GitHub repository to Vercel.
2. In Project Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client` (or root if using root `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. In **Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend-service.com/api
   ```
4. Deploy. The `vercel.json` ensures all SPA routes (`/analyzer`, `/user/dashboard`, `/admin/dashboard`, etc.) resolve to `index.html` without 404 errors.

### Option B: Deploying via Vercel CLI
```bash
cd client
npx vercel
# Follow prompts to link project and deploy
```

---

## 2. Backend & ML Runtime Deployment (Render / Railway / DigitalOcean)

Because the Express backend communicates with Python via safe subprocess execution, both Node.js and Python with dependencies must exist in the runtime environment.

### Recommended Platform: Docker / Linux Container (Render or Railway)

Create a production `Dockerfile` in the root:

```dockerfile
FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ml/requirements.txt ./ml/
RUN pip3 install --no-cache-dir --break-system-packages -r ./ml/requirements.txt

COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

WORKDIR /app
COPY . .

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000
ENV PYTHON_PATH=python3

CMD ["node", "server/src/index.js"]
```

### Production Backend Environment Variables
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/loanwise_ai?retryWrites=true&w=majority
CORS_ORIGIN=https://your-frontend-app.vercel.app
PYTHON_PATH=python3
PREDICTION_TIMEOUT=30000
JWT_SECRET=your_production_secure_jwt_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@loanwise.ai
ADMIN_PASSWORD=YourStrongAdminPassword2026!
ADMIN_NAME=System Administrator
```

### Health Check Endpoint
- **URL**: `https://your-backend-service.com/api/health`
- **Method**: GET
- **Expected Status**: 200 OK

---

## 3. MongoDB Deployment (MongoDB Atlas)

1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user with readWrite permissions.
3. Add `0.0.0.0/0` (or your backend provider's IP range) to the Network Access IP Allowlist.
4. Copy the connection string and populate `MONGODB_URI` in the backend environment.
5. On the first startup, the server automatically initializes the first administrator account defined in `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
6. If MongoDB is temporarily unreachable, LoanWise AI gracefully reports service degradation without crashing the prediction or EMI computation engines.

---

## 4. Retraining & Continuous Deployment

Whenever an updated dataset is uploaded:
1. Replace `ml/data/loan_dataset.csv`.
2. Run `python3 ml/train_model.py`.
3. Run `python3 ml/evaluate_model.py`.
4. Deploy updated joblib artifacts alongside the backend container.
