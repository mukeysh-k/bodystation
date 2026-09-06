const fs = require("fs");
const path = require("path");

const envFile = fs.readFileSync(path.join(__dirname, "../.env"), "utf8");
envFile.split("\n").forEach((line) => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
    if (key && !key.startsWith("#")) process.env[key] = val;
  }
});

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: members } = await supabase.from("members").select("*");
  const { data: periods } = await supabase.from("membership_periods").select("*");
  const { data: status } = await supabase.from("member_current_status").select("*");

  console.log("=== MEMBERS ===");
  console.log(members);
  console.log("=== PERIODS ===");
  console.log(periods);
  console.log("=== STATUS VIEW ===");
  console.log(status);
}

check().then(() => process.exit(0)).catch(console.error);
