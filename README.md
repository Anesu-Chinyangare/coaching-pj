# Coaching PJ

A full-stack Customer Relationship Management (CRM) platform built specifically for coaching businesses. It provides a centralised system for managing client relationships, tracking sales leads through a visual pipeline, scheduling appointments, and analysing business performance through real-time analytics.

The platform is built with a Node.js/Express backend, a PostgreSQL database hosted on Supabase, and a lightweight single-page frontend delivered as a static HTML file. It is deployed on Vercel with automatic CI/CD through GitHub Actions.

## Key Features

- Secure authentication using Supabase JWT tokens
- Customer management with status tracking and revenue history
- Lead pipeline with 6 stages: New, Discovery, Qualified, Proposal, Won, Lost
- Appointment scheduling with type classification and duration tracking
- Real-time analytics dashboard with KPI cards and pipeline charts
- Revenue tracking grouped by month
- Google Analytics 4 integration with custom event tracking
- Delete functionality with confirmation dialogs for all record types
- Responsive design with mobile sidebar collapse

## Technology Stack

| Layer          | Technology            | Purpose                                      |
| -------------- | --------------------- | -------------------------------------------- |
| Runtime        | Node.js 25.9.0        | JavaScript server environment                |
| Framework      | Express.js            | HTTP server and API routing                  |
| Database       | Supabase (PostgreSQL) | Relational data storage                      |
| Authentication | Supabase Auth (JWT)   | Secure user login and token verification     |
| Frontend       | HTML/CSS/JS           | Single-page application in public/index.html |
| Email          | Nodemailer (SMTP)     | Appointment confirmation and reminder emails |
| Analytics      | Google Analytics 4    | User behaviour and event tracking            |
| Deployment     | Vercel                | Serverless hosting with auto-deploy          |
| CI/CD          | GitHub Actions        | Automated testing and deployment pipeline    |
| Testing        | Jest + Supertest      | Unit and integration testing                 |
| Security       | Helmet.js             | HTTP security headers and CSP                |
| Logging        | Winston               | Structured server-side logging               |

## System Architecture

The application follows a traditional MVC (Model-View-Controller) architecture adapted for a RESTful API backend with a decoupled frontend.

### Request Flow

Every user interaction follows this path:

1. User opens coaching-pj.vercel.app in their browser
2. Browser loads public/index.html — the entire frontend UI
3. User enters credentials; Supabase Auth verifies and returns a JWT token
4. Frontend stores the token in memory and includes it in every API request
5. Express server receives the request and runs the authenticate() middleware
6. Middleware verifies the JWT with Supabase Auth
7. If valid, the request passes to the appropriate controller
8. Controller queries the Supabase PostgreSQL database
9. Database returns data; controller formats and sends the JSON response
10. Frontend renders the data as HTML in the browser

### Frontend vs Backend

| Component       | Location               | Runs In           | Visible to Users    |
| --------------- | ---------------------- | ----------------- | ------------------- |
| index.html      | public/index.html      | User's browser    | Yes — the entire UI |
| server.js       | src/server.js          | Vercel serverless | No — server only    |
| Controllers     | src/controllers/       | Vercel serverless | No — server only    |
| Routes          | src/routes/            | Vercel serverless | No — server only    |
| Middleware      | src/middleware/        | Vercel serverless | No — server only    |
| Supabase config | src/config/supabase.js | Vercel serverless | No — server only    |

### Project File Structure

```
coaching-pj/
├── api.http                         ← REST API test file (VS Code REST Client)
├── create-user.js                   ← User creation utility script
├── jest.config.js                   ← Jest testing framework configuration
├── package.json                     ← Project dependencies and scripts
├── README.md                        ← Project documentation
├── vercel.json                      ← Vercel deployment configuration
├── public/
│   └── index.html                   ← Entire frontend SPA (UI, CSS, JavaScript)
├── scripts/
│   ├── schema.sql                   ← Supabase database schema
│   └── seed.js                      ← Database seeding script with sample data
├── src/
│   ├── server.js                    ← Express app entry point & middleware setup
│   ├── config/
│   │   └── supabase.js              ← Supabase client configuration
│   ├── controllers/                 ← Business logic per resource
│   │   ├── analyticsController.js   ← Dashboard KPI and pipeline analytics
│   │   ├── appointmentController.js ← Appointment CRUD & reminders
│   │   ├── customerController.js    ← Customer CRUD & management
│   │   ├── leadController.js        ← Lead pipeline & conversion logic
│   │   └── seoController.js         ← SEO metadata and OG tags
│   ├── middleware/                  ← Cross-cutting concerns
│   │   ├── auth.js                  ← JWT token verification
│   │   ├── errorHandler.js          ← Centralised error responses
│   │   ├── rateLimiter.js           ← Request rate limiting (100 req/15min)
│   │   └── validate.js              ← Input validation rules
│   ├── routes/                      ← API endpoint definitions
│   │   ├── analytics.js             ← GET /api/analytics/dashboard, pipeline
│   │   ├── appointments.js          ← CRUD + reminder routes
│   │   ├── auth.js                  ← Login & logout routes
│   │   ├── customers.js             ← Customer CRUD routes
│   │   ├── leads.js                 ← Lead CRUD & pipeline routes
│   │   └── webhooks.js              ← Webhook handlers (Supabase events)
│   ├── services/                    ← Business logic helpers
│   │   ├── analyticsService.js      ← KPI calculations & aggregations
│   │   ├── emailService.js          ← Nodemailer SMTP configuration
│   │   └── reminderService.js       ← Appointment reminder scheduling
│   └── utils/
│       └── logger.js                ← Winston structured logging
└── tests/
    └── appointments.test.js         ← Jest integration tests
```

## Database Design

The database is hosted on Supabase (PostgreSQL). All tables use UUID primary keys generated by Supabase automatically. Row Level Security (RLS) was intentionally disabled to allow the service role key to manage all records server-side.

### Tables

| Table            | Purpose                    | Key Fields                                                                 |
| ---------------- | -------------------------- | -------------------------------------------------------------------------- |
| users            | Authenticated system users | id, email, name, role                                                      |
| customers        | CRM customer records       | id, first_name, last_name, email, company, status, total_spent, owner_id   |
| leads            | Sales pipeline leads       | id, first_name, last_name, stage, score, estimated_value, source, owner_id |
| appointments     | Scheduled meetings         | id, title, type, customer_id, scheduled_at, duration_min, status, owner_id |
| activities       | Audit log of actions       | id, entity_type, entity_id, user_id, action, metadata                      |
| analytics_events | Custom GA event log        | id, event_name, event_data, session_id, user_agent                         |

### Customer Status Values

- **active** — currently engaged client
- **vip** — high-value client
- **at_risk** — client showing signs of churn
- **inactive** — no recent engagement
- **churned** — lost client

### Lead Pipeline Stages

Leads move through 6 stages representing the sales journey:

| Stage       | Description                             |
| ----------- | --------------------------------------- |
| new         | Freshly added lead, no contact made yet |
| discovery   | Initial conversation underway           |
| qualified   | Lead confirmed as a genuine opportunity |
| proposal    | Formal proposal or quote sent           |
| closed_won  | Deal successfully closed                |
| closed_lost | Lead did not convert                    |

## API Reference

All API endpoints follow RESTful conventions. Every request (except authentication) requires a valid Supabase JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Authentication

| Method | Path             | Description                   | Auth Required |
| ------ | ---------------- | ----------------------------- | ------------- |
| POST   | /api/auth/login  | Login with email and password | No            |
| POST   | /api/auth/logout | Invalidate current session    | Yes           |

### Customers

| Method | Path               | Description                                                       |
| ------ | ------------------ | ----------------------------------------------------------------- |
| GET    | /api/customers     | List all customers (supports ?status=, ?search=, ?page=, ?limit=) |
| GET    | /api/customers/:id | Get single customer with appointments, leads and activity history |
| POST   | /api/customers     | Create a new customer record                                      |
| PATCH  | /api/customers/:id | Update customer fields                                            |
| DELETE | /api/customers/:id | Permanently delete a customer                                     |

### Leads

| Method | Path                   | Description                                              |
| ------ | ---------------------- | -------------------------------------------------------- |
| GET    | /api/leads             | List all leads (supports ?stage=, ?source=, ?min_score=) |
| GET    | /api/leads/:id         | Get single lead record                                   |
| POST   | /api/leads             | Create a new lead                                        |
| PATCH  | /api/leads/:id         | Update lead / change pipeline stage                      |
| POST   | /api/leads/:id/convert | Convert a won lead into a customer record                |
| DELETE | /api/leads/:id         | Delete a lead                                            |

### Appointments

| Method | Path                         | Description                                                   |
| ------ | ---------------------------- | ------------------------------------------------------------- |
| GET    | /api/appointments            | List appointments (supports ?status=, ?date_from=, ?date_to=) |
| GET    | /api/appointments/:id        | Get single appointment                                        |
| POST   | /api/appointments            | Create appointment                                            |
| PATCH  | /api/appointments/:id        | Update appointment details or status                          |
| DELETE | /api/appointments/:id        | Delete appointment                                            |
| POST   | /api/appointments/:id/remind | Send reminder email to customer                               |

### Analytics

| Method | Path                     | Description                                                               |
| ------ | ------------------------ | ------------------------------------------------------------------------- |
| GET    | /api/analytics/dashboard | KPI stats: total_customers, active_leads, pipeline_value, conversion_rate |
| GET    | /api/analytics/pipeline  | Pipeline value broken down by stage                                       |
| POST   | /api/analytics/track     | Log a custom frontend analytics event (no auth required)                  |

## Frontend Application

The entire frontend lives in a single file: [public/index.html](public/index.html). It is a Single-Page Application (SPA) that dynamically renders content without any page reloads. All UI transitions, data fetching, and state management are handled in vanilla JavaScript.

### Dashboard Sections

| Section               | What It Shows                                                      | Data Source                                       |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| KPI Cards (top row)   | Total Revenue, Customer Count, Active Leads, Upcoming Appointments | Customers + Leads + Appointments tables           |
| Revenue / Month Chart | Bar chart of monthly revenue based on customer creation date       | customers.total_spent grouped by created_at month |
| Customer Status Donut | Visual breakdown of customers by status                            | Customers table                                   |
| Upcoming Appointments | Next 5 scheduled/confirmed appointments                            | Appointments with status = scheduled or confirmed |
| Top Leads             | Top 5 leads by score with visual score bar                         | Leads sorted by score descending                  |

### Pages

| Page         | Features                                                                           |
| ------------ | ---------------------------------------------------------------------------------- |
| Dashboard    | KPI cards, revenue chart, customer donut, upcoming appointments, top leads         |
| Customers    | Sortable table with name, company, email, status badge, total spent, delete button |
| Leads        | Kanban pipeline board by stage + full leads table with score bars                  |
| Appointments | Table with title, customer name, type, status, date/time, duration, delete         |
| Analytics    | 4 KPI cards + pipeline value bar chart by stage                                    |

### Key JavaScript Functions

| Function                       | Purpose                                                                |
| ------------------------------ | ---------------------------------------------------------------------- |
| doLogin()                      | Authenticates user via Supabase, stores JWT token in memory            |
| apiFetch(path, options)        | Wrapper for all API calls — automatically attaches the auth token      |
| navigate(page, el)             | Switches between pages, fires GA page_view event                       |
| loadDashboard()                | Fetches all three data sets in parallel, renders all dashboard widgets |
| loadCustomers()                | Fetches and renders the customers table                                |
| loadLeads()                    | Fetches leads, renders both the pipeline board and the table           |
| loadAppointments()             | Fetches and renders the appointments table                             |
| loadAnalytics()                | Calls both analytics endpoints, renders KPI cards and pipeline chart   |
| confirmDelete(type, id, label) | Opens confirmation dialog before any delete operation                  |
| executeDelete()                | Sends DELETE request, reloads the relevant table on success            |
| handleSearch(query)            | Client-side search filter on already-loaded customer or lead data      |

## Security Implementation

### Authentication

Authentication is handled entirely by Supabase Auth. When a user logs in, Supabase validates their credentials and returns a signed JWT token. Every subsequent API request from the browser includes this token in the Authorization header. The server's authenticate() middleware verifies the token with Supabase on every protected route before allowing access.

### Security Headers (Helmet.js)

Helmet.js sets the following HTTP security headers on every response:

| Header                        | Purpose                                                                   |
| ----------------------------- | ------------------------------------------------------------------------- |
| Content-Security-Policy (CSP) | Restricts which scripts, styles, fonts, and connections are allowed       |
| X-Frame-Options               | Prevents the app from being embedded in iframes (clickjacking protection) |
| X-Content-Type-Options        | Prevents MIME type sniffing                                               |
| Referrer-Policy               | Controls what referrer information is sent with requests                  |
| Strict-Transport-Security     | Enforces HTTPS connections                                                |

### Rate Limiting

The express-rate-limit middleware limits all /api/ routes to 100 requests per 15-minute window per IP address. The /health endpoint is excluded. On Vercel, the trust proxy setting is enabled to correctly identify client IP addresses behind the proxy layer.

### Input Validation

All POST and PATCH routes run through express-validator middleware before reaching the controller. Invalid requests return a 422 Unprocessable Content response with field-level error details. The appointment route validates that customer_id is a valid UUID, scheduled_at is ISO 8601 format, and type is one of the allowed values.

### Environment Variables

All sensitive credentials are stored as environment variables — never in code. The following variables are required:

| Variable                  | Where Set     | Purpose                              |
| ------------------------- | ------------- | ------------------------------------ |
| SUPABASE_URL              | Vercel + .env | Supabase project endpoint URL        |
| SUPABASE_ANON_KEY         | Vercel + .env | Public key for browser-side auth     |
| SUPABASE_SERVICE_ROLE_KEY | Vercel only   | Server-side key that bypasses RLS    |
| CORS_ORIGIN               | Vercel + .env | Allowed frontend origin for CORS     |
| NODE_ENV                  | Vercel + .env | Environment (production/development) |

## Analytics & Tracking

### Google Analytics 4 Setup

Google Analytics 4 is integrated via the gtag.js library loaded in the HTML head. The Measurement ID is G-VQ0X3XKHBQ. The GA stream is configured to receive traffic from https://coaching-pj.vercel.app.

### What Is Tracked

| Event               | When It Fires                  | Type                                    |
| ------------------- | ------------------------------ | --------------------------------------- |
| page_view (auto)    | On initial app load            | Automatic                               |
| page_view (SPA)     | Every sidebar navigation click | Custom — fires in navigate()            |
| login               | On successful sign in          | Custom                                  |
| customer_created    | When a new customer is saved   | Custom                                  |
| lead_created        | When a new lead is saved       | Custom                                  |
| appointment_created | When an appointment is booked  | Custom                                  |
| record_deleted      | When any record is deleted     | Custom — includes record_type parameter |

### Where to View Data in GA

- Reports > Realtime — active users right now
- Reports > Engagement > Pages and Screens — most visited pages
- Reports > Engagement > Events — custom event counts
- Reports > Acquisition — traffic sources
- Reports > Retention — returning vs new users

### Current GA Results

Since deployment in April 2026 the platform has recorded:

- 11 active users
- 9 new users
- 158 total events
- 2 minutes 49 seconds average engagement time per session
- Most visited page: Customers (16 views)

## Deployment & DevOps

### Vercel Deployment

The application is deployed on Vercel at https://coaching-pj.vercel.app. The vercel.json configuration routes all traffic through src/server.js as a serverless function. Every push to the main branch on GitHub triggers an automatic production deployment.

### CI/CD Pipeline (GitHub Actions)

The .github/workflows/ci-cd.yml pipeline runs on every push and pull request:

1. ESLint runs to check code quality
2. Jest tests run on Node.js 18 and 20
3. npm audit checks for security vulnerabilities
4. If all checks pass, Vercel deploys to production automatically

### Environment Configuration

Five environment variables are configured in Vercel under Project Settings > Environment Variables, all set to All Environments (Production, Preview, Development):

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- CORS_ORIGIN
- NODE_ENV

### Local Development Setup

1. Clone the repository: `git clone https://github.com/Anesu-Chinyangare/coaching-pj.git`
2. Install dependencies: `npm install`
3. Copy environment file: `cp .env.example .env`
4. Fill in your Supabase credentials in `.env`
5. Start the development server: `npm run dev`
6. Open http://localhost:3000

## Testing

The project includes a Jest + Supertest test suite. Tests can be run locally or are triggered automatically by the GitHub Actions CI/CD pipeline.

```bash
npm test          # Run all tests with coverage
npm run lint      # Run ESLint code quality checks
```

### Manual API Testing

The api.http file in the project root can be used with the VS Code REST Client extension to manually test all API endpoints. Replace the placeholder JWT token with a real token from the Supabase dashboard and run any request with a single click.

### Available npm Scripts

| Command      | Description                                           |
| ------------ | ----------------------------------------------------- |
| npm run dev  | Start server with nodemon (auto-restart on file save) |
| npm start    | Start production server                               |
| npm test     | Run Jest tests with coverage report                   |
| npm run lint | Run ESLint on all source files                        |
| npm run seed | Populate database with sample data                    |

## Challenges Faced

### Challenge 1: Invalid Database Joins Crashing All API Routes

All three controllers (customers, leads, appointments) used Supabase relational joins like `.select('*, owner:users(id, name)')` which required foreign key relationships that did not exist in the database schema. This caused every GET and POST request to return a 500 error.

**Solution:** Removed all relational joins from the controllers and replaced them with simple `.select('*')` queries, fetching only the data directly available in each table.

### Challenge 2: Supabase Foreign Key Constraint Blocking Record Creation

Creating customers returned a 500 error with the message "insert or update on table customers violates foreign key constraint customers_owner_id_fkey". The owner_id field required a matching record in the users table but that table was empty even though the Supabase Auth user existed.

**Solution:** Inserted the authenticated user's UUID manually into the users table via the Supabase SQL Editor, linking the Auth user to the application's users table.

### Challenge 3: Content Security Policy Blocking Google Analytics

Google Analytics was integrated but showed zero data in the Realtime dashboard even though the tracking tag was correctly installed. The browser console showed "Refused to connect because it violates the document's Content Security Policy."

**Solution:** Updated the connectSrc directive in the Helmet.js CSP configuration in src/server.js to explicitly allow:

- https://analytics.google.com
- https://www.googletagmanager.com
- https://region1.google-analytics.com

## Project Summary

Coaching PJ is a production-ready CRM platform that demonstrates a complete full-stack web application architecture. It integrates authentication, a RESTful API, a relational database, serverless deployment, CI/CD automation, and third-party analytics into a single cohesive system.

### What Was Built

| Feature                  | Status   | Notes                                        |
| ------------------------ | -------- | -------------------------------------------- |
| User authentication      | Complete | Supabase JWT with middleware verification    |
| Customer CRUD            | Complete | Create, read, update, delete with validation |
| Lead pipeline            | Complete | 6-stage Kanban board with value tracking     |
| Appointment booking      | Complete | With customer dropdown and ISO date handling |
| Analytics dashboard      | Complete | Real-time KPIs and pipeline chart            |
| Revenue chart            | Complete | Monthly grouping from real database data     |
| Delete with confirmation | Complete | Dialog-based with toast notifications        |
| Google Analytics         | Complete | Page views + 5 custom events                 |
| Vercel deployment        | Complete | Auto-deploy on push to main                  |
| GitHub CI/CD             | Complete | Lint, test, deploy pipeline                  |
| Security headers         | Complete | Helmet.js with full CSP configuration        |
| Rate limiting            | Complete | 100 req/15min per IP                         |

### Live Application

The application is live and accessible at:

**URL:** https://coaching-pj.vercel.app

**GitHub Repository:** https://github.com/Anesu-Chinyangare/coaching-pj

