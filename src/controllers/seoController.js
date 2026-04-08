// ─────────────────────────────────────────
//  src/controllers/seoController.js
// ─────────────────────────────────────────
const sitemap = (req, res) => {
  const baseUrl = process.env.APP_URL || "https://anesupj.io";
  const pages = ["", "/features", "/pricing", "/about", "/contact"];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${baseUrl}${p}</loc><changefreq>weekly</changefreq><priority>${p === "" ? "1.0" : "0.8"}</priority></url>`).join("\n")}
</urlset>`;
  res.type("application/xml").send(xml);
};

module.exports = { sitemap };
