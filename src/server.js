// ─────────────────────────────────────────
//  src/server.js — Anesu PJEntry Point
// ─────────────────────────────────────────
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const path = require("path");
const cron = require("node-cron");

const logger = require("./utils/logger");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const rateLimiter = require("./middleware/rateLimiter");

// Route imports
const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");
const leadRoutes = require("./routes/leads");
const customerRoutes = require("./routes/customers");
const analyticsRoutes = require("./routes/analytics");
const webhookRoutes = require("./routes/webhooks");

// Cron jobs
const { sendAppointmentReminders } = require("./services/reminderService");

const app = express();
app.set("trust proxy", 1); // ← add this line

// ─── Security & Middleware ────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://www.googletagmanager.com",
          "https://cdn.jsdelivr.net",
          "'unsafe-inline'",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "https://www.google-analytics.com",
          "https://ynaenzqmykbrgvvtuybj.supabase.co",
          "https://cdn.jsdelivr.net",
        ],
        scriptSrcAttr: ["'unsafe-inline'"],
      },
    },
  }),
);
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://coaching-pj.vercel.app",
      "https://coaching-pj.vercel.app/",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use(compression());
app.use(
  morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Static Files & SEO ──────────────────
app.use(
  express.static(path.join(__dirname, "../public"), {
    maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
    etag: true,
  }),
);

// SEO: serve robots.txt
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(
    `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${process.env.APP_URL}/sitemap.xml`,
  );
});

// SEO: dynamic sitemap
app.get("/sitemap.xml", require("./controllers/seoController").sitemap);

// ─── Rate Limiting ────────────────────────
app.use("/api/", rateLimiter);

// ─── API Routes ───────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/webhooks", webhookRoutes);

// ─── Health Check ─────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    version: require("../package.json").version,
  });
});

// ─── SPA Fallback ─────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ─── Error Handling ───────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Cron Jobs ────────────────────────────
// Send appointment reminders every day at 8 AM
cron.schedule("0 8 * * *", async () => {
  logger.info("Running appointment reminder cron job");
  await sendAppointmentReminders();
});

// ─── Start Server ─────────────────────────
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {});
logger.info(`Coching PJ running on port ${PORT} [${process.env.NODE_ENV}]`);

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received — shutting down gracefully");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

module.exports = app;
