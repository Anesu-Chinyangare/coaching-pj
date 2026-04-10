// scripts/seed.js — populate DB with sample data
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function seed() {
  console.log(" Seeding Anesu PJ database...\n");
  await supabase
    .from("appointments")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("leads")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("customers")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  console.log(" Cleared existing data\n");

  // ── Customers ──────────────────────────────
  const { data: customers, error: ce } = await supabase
    .from("customers")
    .insert([
      {
        first_name: "Sarah",
        last_name: "Connor",
        email: "sarah@acme.co",
        phone: "+1-555-0101",
        company: "Acme Corp",
        status: "active",
        total_spent: 24500,
      },
      {
        first_name: "Marcus",
        last_name: "Webb",
        email: "m.webb@corp.io",
        phone: "+1-555-0102",
        company: "Corp.io",
        status: "active",
        total_spent: 18000,
      },
      {
        first_name: "Priya",
        last_name: "Patel",
        email: "ppatel@startup.in",
        phone: "+1-555-0103",
        company: "Startup.in",
        status: "vip",
        total_spent: 47000,
      },
      {
        first_name: "Lena",
        last_name: "Kim",
        email: "lenakim@ventures.co",
        phone: "+1-555-0104",
        company: "Ventures Co.",
        status: "at_risk",
        total_spent: 8200,
      },
      {
        first_name: "Robert",
        last_name: "Banks",
        email: "rbanks@bankco.com",
        phone: "+1-555-0105",
        company: "BankCo",
        status: "churned",
        total_spent: 3100,
      },
    ])
    .select();
  if (ce) {
    console.error("Customers error:", ce.message);
    process.exit(1);
  }
  console.log(` Inserted ${customers.length} customers`);

  // ── Leads ──────────────────────────────────
  const { data: leads, error: le } = await supabase
    .from("leads")
    .insert([
      {
        first_name: "Rachel",
        last_name: "Jones",
        email: "rachel@bizcorp.com",
        source: "referral",
        stage: "proposal",
        score: 92,
        estimated_value: 12000,
      },
      {
        first_name: "Tom",
        last_name: "Nakamura",
        email: "tom@designfirm.jp",
        source: "website",
        stage: "qualified",
        score: 88,
        estimated_value: 8500,
      },
      {
        first_name: "Anna",
        last_name: "Müller",
        email: "anna@eurocorp.de",
        source: "linkedin",
        stage: "discovery",
        score: 74,
        estimated_value: 15000,
      },
      {
        first_name: "Brian",
        last_name: "Foster",
        email: "bfoster@retail.us",
        source: "cold_outreach",
        stage: "new",
        score: 68,
        estimated_value: 6000,
      },
      {
        first_name: "Claire",
        last_name: "Laurent",
        email: "claurent@ventures.fr",
        source: "event",
        stage: "new",
        score: 51,
        estimated_value: 20000,
      },
    ])
    .select();
  if (le) {
    console.error("Leads error:", le.message);
    process.exit(1);
  }
  console.log(`Inserted ${leads.length} leads`);

  // ── Appointments ───────────────────────────
  const now = new Date();
  const d = (offsetHours) =>
    new Date(now.getTime() + offsetHours * 3600000).toISOString();

  const { data: appts, error: ae } = await supabase
    .from("appointments")
    .insert([
      {
        customer_id: customers[0].id,
        title: "Initial Consultation",
        type: "consultation",
        status: "confirmed",
        scheduled_at: d(1),
        duration_min: 60,
      },
      {
        customer_id: customers[1].id,
        title: "Follow-up Review",
        type: "follow_up",
        status: "completed",
        scheduled_at: d(-2),
        duration_min: 30,
      },
      {
        customer_id: customers[2].id,
        title: "Strategy Session",
        type: "strategy",
        status: "scheduled",
        scheduled_at: d(5),
        duration_min: 90,
      },
      {
        customer_id: customers[3].id,
        title: "Proposal Review",
        type: "proposal",
        status: "confirmed",
        scheduled_at: d(8),
        duration_min: 60,
      },
      {
        customer_id: customers[4].id,
        title: "Demo Call",
        type: "demo",
        status: "no_show",
        scheduled_at: d(-24),
        duration_min: 45,
      },
    ])
    .select();
  if (ae) {
    console.error("Appointments error:", ae.message);
    process.exit(1);
  }
  console.log(` Inserted ${appts.length} appointments`);

  console.log("\n Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
