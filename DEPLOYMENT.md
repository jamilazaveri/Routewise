# Routewise Free Cloud Deployment Guide

A step-by-step guide to deploying the complete Routewise full-stack application on 100% **FREE** tier cloud providers with **no credit card required**.

---

## 1. System Architecture

```text
+-----------------------------------------------------------------------------------+
|                                 USER BROWSER / PWA                                |
|                                                                                   |
|  [ Vercel CDN ]                                                                   |
|  - Static HTML5 / CSS3 / ES Modules / PWA Service Worker                          |
|  - Real-time Leaflet Map with CartoDB Positron / OSM tiles                       |
|  - Runtime config: js/config.js (auto-detects local vs production)                |
+-----------------------------------------------------------------------------------+
                                   |                 |
            GET/POST /api/*        |                 | GET /health (early ping)
                                   v                 v
+-----------------------------------------------------------------------------------+
|               JAVA SPRING BOOT BACKEND (Render Free Web Service)                   |
|                                                                                   |
|  - Port: $PORT (8080)                                                             |
|  - Multi-stage Docker image (eclipse-temurin:17-jre-alpine)                       |
|  - Low-memory JVM flags: -Xmx300m -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m      |
|  - Health endpoint: /health                                                       |
|  - Resilient retry client with fallback to local estimators                       |
+-----------------------------------------------------------------------------------+
               |                                                   |
               | JDBC with SSL (useSSL=true)                       | HTTP POST /plan-routes
               v                                                   v
+-----------------------------+     +-----------------------------------------------+
|      FREE CLOUD MYSQL       |     |        PYTHON FASTAPI MICROSERVICE            |
|  (TiDB Cloud Serverless or  |     |         (Render Free Web Service)             |
|       Aiven MySQL)          |     |                                               |
|                             |     | - Port: $PORT (8000)                          |
| - MySQL 8+ compatible       |     | - Slim Docker image (python:3.11-slim)        |
| - utf8mb4 character set     |     | - Health endpoint: /health                    |
| - 5GB free storage          |     | - 5 Route Styles Engine & OSRM Geometries     |
+-----------------------------+     +-----------------------------------------------+
```

---

## 2. Environment Variables Reference Table

### Java Spring Boot Backend (`routewise-backend-java` on Render)

| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `PORT` | Auto | Set automatically by Render | `8080` |
| `DB_URL` | **Yes** | Cloud MySQL JDBC URL (must include `useSSL=true`) | `jdbc:mysql://gateway01.us-east-1.prod.aws.tidbcloud.com:4000/routewise_db?useSSL=true&requireSSL=true&verifyServerCertificate=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` |
| `DB_USER` | **Yes** | Cloud MySQL database username | `xxxxxx.root` |
| `DB_PASSWORD` | **Yes** | Cloud MySQL database user password | `YourSecurePassword123!` |
| `PYTHON_SERVICE_URL` | **Yes** | Public HTTPS URL of the Python Render service | `https://routewise-service-python.onrender.com` |
| `ALLOWED_ORIGINS` | **Yes** | Deployed Vercel frontend URL(s) and dev origins | `https://your-routewise.vercel.app,http://localhost:3000` |

### Python FastAPI Microservice (`routewise-service-python` on Render)

| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `PORT` | Auto | Set automatically by Render | `8000` |
| `ALLOWED_ORIGINS` | Optional | Origins allowed to make direct calls | `*` or `https://your-routewise.vercel.app,http://localhost:3000` |

### Frontend (`frontend` on Vercel)

| Variable / File | Description |
| :--- | :--- |
| `frontend/js/config.js` | Sets `API_BASE_URL` and `PYTHON_SERVICE_URL`. When hosted on Vercel, it automatically uses your production Render Java backend URL (`https://routewise-backend-java.onrender.com`). |

---

## 3. Step-by-Step Manual Deployment Guide

Follow this sequence strictly: **Database -> Python -> Java -> Frontend**.

### Step 3.1: Push Code to GitHub

Open your terminal on your machine and push the `deploy` branch to your GitHub repository:

```bash
git push -u origin deploy
```

---

### Step 3.2: Create Free Cloud MySQL Database (TiDB Cloud Serverless)
*(Takes ~2 minutes, 100% Free, No Credit Card Required)*

1. Go to [https://tidbcloud.com/](https://tidbcloud.com/) and click **Sign Up** (or Continue with GitHub / Google).
2. Click **Create Cluster** and select **Serverless (Free)**.
3. Choose your closest region (e.g. `US East (N. Virginia)` or `Singapore`) and click **Create**.
4. In the Security dialog, copy the **Root Password** generated for you.
5. In the cluster overview, click **Connect**:
   - Choose **Connect with**: `General` or `JDBC`.
   - Note the **Host**, **Port** (usually `4000`), **User**, and **Database** name.
6. Open the **SQL Editor** tab in TiDB Cloud:
   - Paste the contents of `database/schema.sql` and click **Run**.
   - Paste the contents of `database/seed.sql` and click **Run**.
7. Form your `DB_URL` JDBC connection string:
   ```text
   jdbc:mysql://<HOST>:4000/routewise_db?useSSL=true&requireSSL=true&verifyServerCertificate=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   ```

*(Alternative: You can also use [Aiven Free MySQL](https://aiven.io/mysql) if preferred).*

---

### Step 3.3: Deploy Python Microservice on Render
*(Takes ~3 minutes, Free Web Service)*

1. Go to [https://dashboard.render.com/](https://dashboard.render.com/) and sign in with GitHub.
2. Click **New +** -> **Web Service**.
3. Choose **Build and deploy from a Git repository** -> click **Next**.
4. Select your `Routewise` repository.
5. Configure the service:
   - **Name**: `routewise-service-python`
   - **Region**: Same or nearest region to your database (e.g., `Oregon (US West)`)
   - **Branch**: `deploy`
   - **Root Directory**: `service-python`
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`
6. Scroll down to **Environment Variables**:
   - Key: `PORT` | Value: `8000`
   - Key: `ALLOWED_ORIGINS` | Value: `*`
7. Click **Create Web Service**.
8. Wait ~2-3 minutes until the build logs show `Application startup complete` and the status turns **Live**.
9. Copy your Python service URL (e.g., `https://routewise-service-python.onrender.com`).
10. Test it by opening `https://routewise-service-python.onrender.com/health` in your browser. It will return:
    ```json
    {"status":"UP","service":"routewise-python-microservice","version":"1.0.0"}
    ```

---

### Step 3.4: Deploy Java Backend on Render
*(Takes ~4 minutes, Free Web Service)*

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Select your `Routewise` repository.
3. Configure the service:
   - **Name**: `routewise-backend-java`
   - **Region**: Same region as Python service
   - **Branch**: `deploy`
   - **Root Directory**: `backend-java`
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:
   - `PORT`: `8080`
   - `DB_URL`: *[Your TiDB JDBC string from Step 3.2]*
   - `DB_USER`: *[Your TiDB username from Step 3.2]*
   - `DB_PASSWORD`: *[Your TiDB password from Step 3.2]*
   - `PYTHON_SERVICE_URL`: *[Your Python service URL from Step 3.3]*
   - `ALLOWED_ORIGINS`: `*` *(you will update this with your exact Vercel URL in Step 3.6)*
5. Click **Create Web Service**.
6. Wait ~3-4 minutes while Maven builds the JAR inside the multi-stage Docker container.
7. Once status is **Live**, copy your Java service URL (e.g., `https://routewise-backend-java.onrender.com`).
8. Test it by opening `https://routewise-backend-java.onrender.com/health` in your browser. It will return:
    ```json
    {"status":"UP","service":"routewise-backend-java"}
    ```

---

### Step 3.5: Deploy Frontend on Vercel
*(Takes ~1 minute, Free)*

1. Go to [https://vercel.com/](https://vercel.com/) and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your `Routewise` GitHub repository.
4. In the Project Configuration:
   - **Project Name**: `routewise`
   - **Framework Preset**: `Other`
   - **Root Directory**: Click `Edit` and select `frontend` (or leave as root; both have `vercel.json` configured)
   - **Build and Output Settings**: Leave default (No build command needed for static PWA)
5. Under `frontend/js/config.js`:
   - If your Java URL differs from `https://routewise-backend-java.onrender.com`, update `DEFAULT_PROD_JAVA_URL` in `frontend/js/config.js` with your actual Render URL and push to `deploy`.
6. Click **Deploy**.
7. In ~30 seconds, your site is live! You will receive your production URL (e.g. `https://routewise-app.vercel.app`).

---

### Step 3.6: Final CORS Security Lock
1. Return to your Render Dashboard -> select `routewise-backend-java`.
2. Go to **Environment** -> find `ALLOWED_ORIGINS`.
3. Update its value to your Vercel URL:
   ```text
   https://your-routewise.vercel.app,http://localhost:3000
   ```
4. Click **Save Changes** (Render will automatically redeploy in 30 seconds).

---

## 4. Post-Deployment Verification Checklist

- [ ] **Open the Vercel URL**: The cinematic scenic hero loads smoothly with SVG clouds and floating particles.
- [ ] **Cold Start Tolerance**: If the Render services are sleeping, the UI gracefully displays *"Waking up the servers, this takes up to a minute on the free tier..."* and automatically retries.
- [ ] **Generate a Trip**:
  1. Pick `Pondicherry` or `Chennai`.
  2. Set days, travellers, and budget.
  3. Click **Generate Journey Plan**.
  4. Confirm the animated progress ring, budget count-up, and confetti trigger.
- [ ] **Interactive Routes Map**:
  1. Switch to **Routes & Map** tab.
  2. Check that the Leaflet map displays CartoDB Positron / OSM pastel tiles.
  3. Toggle through all 5 route styles (**Fastest**, **Shortest**, **Cheapest**, **Scenic**, **Easiest**) and confirm distance and costs update dynamically.
- [ ] **Bookings Checklist**:
  1. Switch to **Bookings** tab.
  2. Test the segmented status control (`Not booked` -> `Booked`).
  3. Click **Save** on a card: verify the spinner micro-animation, checkmark, and toast.
  4. Click **Copy Summary**: verify the button morphs to green "Copied!" with check icon.
  5. Click **WhatsApp Share**: verify prefilled WhatsApp message opens.
- [ ] **Mobile & PWA Installation**:
  1. Open the URL in Safari (iOS) or Chrome (Android).
  2. Tap **Install App** (or *Add to Home Screen*).
  3. Confirm the standalone offline PWA launches cleanly from your home screen.

---

## 5. Troubleshooting Common Issues

### 1. `CORS Error: No 'Access-Control-Allow-Origin' header is present`
- **Cause**: The Java backend has not whitelisted your Vercel domain.
- **Fix**: In Render Dashboard -> `routewise-backend-java` -> **Environment**, ensure `ALLOWED_ORIGINS` includes your exact Vercel URL (e.g., `https://routewise-app.vercel.app`). Do not add a trailing slash.

### 2. `Database Connection Refused / Communications link failure`
- **Cause**: Cloud MySQL requires SSL encryption or the port/host is wrong.
- **Fix**: Ensure your `DB_URL` contains `?useSSL=true&requireSSL=true&verifyServerCertificate=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`. In TiDB Cloud, ensure port is `4000` (not `3306`).

### 3. `HTTP 502 / 503 Bad Gateway on First Request`
- **Cause**: Render Free Tier services spin down after 15 minutes of inactivity. When a request arrives, the container boots up (takes ~30-50 seconds).
- **Fix**: Routewise automatically shows a friendly waking up screen and retries for up to 60 seconds with offline fallbacks. The frontend also pings `/health` on page load to wake up both services early.

### 4. `Blank Map / Tiles Not Loading`
- **Cause**: Content-Security-Policy or Leaflet height issue.
- **Fix**: Routewise uses HTTPS CartoDB Positron tiles and calls `map.invalidateSize()` whenever tabs switch. Check network tab to verify `basemaps.cartocdn.com` is reachable.
