# Anesu PJ

Appointment booking, lead tracking & customer management platform built with Node.js, Express, and Supabase.

---

## Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Runtime    | Node.js 18+                               |
| Framework  | Express.js                                |
| Database   | Supabase (PostgreSQL)                     |
| Auth       | Supabase Auth (JWT)                       |
| Email      | Nodemailer (SMTP)                         |
| Analytics  | Google Analytics 4 (Measurement Protocol) |
| Deployment | Vercel                                    |
| CI/CD      | GitHub Actions                            |
| Testing    | Jest + Supertest                          |

---

## Project Structure

```
anesu-pj/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions CI/CD pipeline
├── .vscode/
│   ├── extensions.json        # Recommended VS Code extensions
│   ├── launch.json            # Debug configurations
│   └── settings.json          # Editor settings
├── public/                    # Static frontend files
│   ├── index.html
│   ├── css/
│   └── js/
├── scripts/
│   ├── schema.sql             # Supabase DB schema
│   └── seed.js                # Sample data seeder
├── src/
│   ├── config/
│   │   └── supabase.js        # Supabase client
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── appointmentController.js
│   │   ├── customerController.js
│   │   ├── leadController.js
│   │   └── seoController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validate.js
│   ├── routes/
│   │   ├── analytics.js
│   │   ├── appointments.js
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── leads.js
│   │   └── webhooks.js
│   ├── services/
│   │   ├── analyticsService.js  # GA4 Measurement Protocol
│   │   ├── emailService.js      # Nodemailer templates
│   │   └── reminderService.js   # Cron reminder job
│   ├── utils/
│   │   └── logger.js            # Winston logger
│   └── server.js                # Express app entry point
├── tests/
│   └── appointments.test.js
├── .env.example
├── .eslintrc.json
├── .gitignore
├── api.http                    # REST Client test file
├── jest.config.js
├── package.json
└── vercel.json
```

---

## Part 1 — Setting Up Node.js in VS Code

### Step 1: Install Node.js

1. Go to **https://nodejs.org**
2. Download the **LTS version** (18.x or 20.x recommended)
3. Run the installer — accept all defaults
4. Verify installation — open a terminal and run:
   ```bash
   node --version    # Should show v18.x.x or v20.x.x
   npm --version     # Should show 9.x.x or 10.x.x
   ```

### Step 2: Install VS Code

1. Go to **https://code.visualstudio.com**
2. Download and install for your OS (Windows / macOS / Linux)
3. Open VS Code

### Step 3: Install the Node.js Extension Pack in VS Code

Open VS Code, then press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS) to open Extensions. Search for and install:

| Extension                                         | Purpose                           |
| ------------------------------------------------- | --------------------------------- |
| **ESLint** (dbaeumer.vscode-eslint)               | Real-time linting                 |
| **Prettier** (esbenp.prettier-vscode)             | Auto-formatting                   |
| **DotENV** (mikestead.dotenv)                     | .env syntax highlighting          |
| **REST Client** (humao.rest-client)               | Test API endpoints inside VS Code |
| **GitLens** (eamodio.gitlens)                     | Enhanced Git integration          |
| **Thunder Client** (rangav.vscode-thunder-client) | Postman-like API testing          |

Or install all at once — open the Command Palette (`Ctrl+Shift+P`) and run:

```
Extensions: Show Recommended Extensions
```

(The `.vscode/extensions.json` in this project auto-suggests them all.)

### Step 4: Configure VS Code for Node.js

Press `Ctrl+Shift+P` → **"Open User Settings (JSON)"** and add:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "javascript.suggest.autoImports": true,
  "files.autoSave": "onFocusChange"
}
```

### Step 5: Open the Integrated Terminal

Press `` Ctrl+` `` (backtick) to open the integrated terminal. All `npm` and `node` commands run here — no need to switch apps.

### Step 6: Run and Debug Node.js in VS Code

This project includes pre-configured debug launchers in `.vscode/launch.json`. To use them:

1. Press `F5` or click the **Run & Debug** icon in the left sidebar
2. Select a configuration from the dropdown:
   - **▶ Run Server** — starts the Express server with nodemon (auto-restart on save)
   - **🧪 Run Tests** — runs Jest with coverage
   - **🌱 Run Seed Script** — populates the database with sample data
3. Set breakpoints by clicking the gutter (left of line numbers) — execution will pause there

---

## Part 2 — Project Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/your-username/nexus-crm.git
cd nexus-crm
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure environment variables

```bash
cp .env.example .env
```

Open `.env` in VS Code and fill in your values (see section below).

### Step 4: Set up Supabase

1. Go to **https://supabase.com** → New Project
2. Give it a name (e.g. `nexus-crm`) and set a database password
3. Once created, go to **Project Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
4. Run the schema in Supabase SQL Editor:
   - Go to **SQL Editor** in the Supabase dashboard
   - Click **New Query**
   - Copy and paste the contents of `scripts/schema.sql`
   - Click **Run**

### Step 5: Seed the database (optional)

```bash
npm run seed
```

### Step 6: Start the development server

```bash
npm run dev
```

The server starts at **http://localhost:3000**

---

## Part 3 — Environment Variables

Fill these into your `.env` file:

```env
# Server
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Supabase (from Project Settings → API)
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Email — use Gmail App Password or any SMTP provider
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-gmail-app-password

# Google Analytics 4
GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_API_SECRET=your-ga-api-secret

# JWT
JWT_SECRET=change-this-to-a-long-random-string
```

### Getting a Gmail App Password

1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to **App Passwords** → Generate password for "Mail"
4. Use that 16-character password as `SMTP_PASS`

### Getting Google Analytics credentials

. Go to **https://analytics.google.com** → Admin 2. Create a Property → Web stream 3. Copy the **Measurement ID** (G-XXXXXXXXXX) 4. Go to **Admin → Data Streams → your stream → Measurement Protocol API secrets** 5. Create a secret and copy its value
1

---

## Part 4 — API Reference

### Authentication

All API routes (except `/api/analytics/track` and `/api/auth/*`) require:

```
Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN
```

### Endpoints

#### Appointments

| Method | Path                           | Description                                                    |
| ------ | ------------------------------ | -------------------------------------------------------------- |
| GET    | `/api/appointments`            | List appointments (filter by `status`, `date_from`, `date_to`) |
| GET    | `/api/appointments/:id`        | Get single appointment with customer                           |
| POST   | `/api/appointments`            | Create appointment + send confirmation email                   |
| PATCH  | `/api/appointments/:id`        | Update appointment                                             |
| DELETE | `/api/appointments/:id`        | Delete appointment                                             |
| POST   | `/api/appointments/:id/remind` | Send reminder email                                            |

#### Leads

| Method | Path                     | Description                                           |
| ------ | ------------------------ | ----------------------------------------------------- |
| GET    | `/api/leads`             | List leads (filter by `stage`, `source`, `min_score`) |
| POST   | `/api/leads`             | Create lead                                           |
| PATCH  | `/api/leads/:id`         | Update lead / change stage                            |
| POST   | `/api/leads/:id/convert` | Convert lead to customer                              |
| DELETE | `/api/leads/:id`         | Delete lead                                           |

#### Customers

| Method | Path                 | Description                                    |
| ------ | -------------------- | ---------------------------------------------- |
| GET    | `/api/customers`     | List customers (filter by `status`, `search`)  |
| GET    | `/api/customers/:id` | Get customer + appointments + activity history |
| POST   | `/api/customers`     | Create customer                                |
| PATCH  | `/api/customers/:id` | Update customer                                |
| DELETE | `/api/customers/:id` | Delete customer                                |

#### Analytics

| Method | Path                       | Description                    |
| ------ | -------------------------- | ------------------------------ |
| GET    | `/api/analytics/dashboard` | KPI stats for dashboard        |
| GET    | `/api/analytics/pipeline`  | Pipeline value by stage        |
| GET    | `/api/analytics/revenue`   | Revenue by month               |
| POST   | `/api/analytics/track`     | Track frontend event (no auth) |

---

## Part 5 — Testing API endpoints in VS Code

Open `api.http` in VS Code (requires REST Client extension):

1. Replace `YOUR_SUPABASE_JWT_TOKEN_HERE` with a real token
2. Replace UUID placeholders with real IDs from your database
3. Click **"Send Request"** above any request block

---

## Part 6 — Deploying to Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Link your project

```bash
vercel link
```

### Step 4: Add environment variables to Vercel

```bash
vercel env add SUPABASE_URL`
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add JWT_SECRET
vercel env add SMTP_HOST
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add GA_MEASUREMENT_ID
vercel env add GA_API_SECRET
vercel env add NODE_ENV   # set to: production
```

Or set them in the Vercel dashboard under **Project → Settings → Environment Variables**.

### Step 5: Deploy

```bash
vercel --prod
```

Your app is live at `https://anesu-pj.vercel.app` (or your custom domain).

---

## Part 7 — GitHub & CI/CD Setup

### Step 1: Create a GitHub repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/nexus-crm.git
git push -u origin main
```

### Step 2: Add GitHub Secrets

Go to your repo → **Settings → Secrets and Variables → Actions** and add:

| Secret                      | Value                                            |
| --------------------------- | ------------------------------------------------ |
| `VERCEL_TOKEN`              | From vercel.com → Account Settings → Tokens      |
| `SUPABASE_URL`              | Your Supabase project URL                        |
| `SUPABASE_ANON_KEY`         | Supabase anon key                                |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key                        |
| `CODECOV_TOKEN`             | From codecov.io (optional, for coverage reports) |

### Step 3: CI/CD pipeline runs automatically

Every push to `main` will:

1. Run ESLint
2. Run Jest tests on Node 18 & 20
3. Run `npm audit` security check
4. Deploy to Vercel production if all checks pass

Pull requests get a preview deployment automatically.

---

## Part 8 — SEO Configuration

The app includes built-in SEO features:

- **`/robots.txt`** — auto-generated, blocks `/api/` from crawlers
- **`/sitemap.xml`** — dynamic XML sitemap with all public pages
- **Helmet.js** — sets security headers (`X-Frame-Options`, `X-Content-Type-Options`, CSP)
- **Compression** — gzip compression for all responses
- **Static file caching** — 1-day cache headers on assets in production

To add Open Graph meta tags for the frontend, edit `public/index.html`:

```html
<meta property="og:title" content="Nexus CRM" />
<meta
  property="og:description"
  content="Appointment booking and customer management"
/>
<meta property="og:image" content="https://nexuscrm.io/og-image.png" />
<meta property="og:url" content="https://nexuscrm.io" />
<meta name="twitter:card" content="summary_large_image" />
```

---

## Part 9 — Available npm Scripts

```bash
npm run dev       # Start with nodemon (auto-restart on file save)
npm start         # Start production server
npm test          # Run Jest tests with coverage
npm run lint      # Run ESLint
npm run seed      # Populate database with sample data
```

---

## Part 10 — Cron Jobs

The reminder service runs automatically inside the server process:

| Schedule             | Job                                                      |
| -------------------- | -------------------------------------------------------- |
| Every day at 8:00 AM | Send email reminders for appointments scheduled tomorrow |

On Vercel (serverless), use **Vercel Cron Jobs** instead. Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

Then add a `GET /api/cron/reminders` route that calls `sendAppointmentReminders()`.

---

## License

MIT
