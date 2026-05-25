require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.from("r3bin_waste_logs").select("*").order("updated_at", { ascending: false }).limit(50);
    const out = { error, logs: data };

    const { data: reg } = await supabase.from("r3bin_registry").select("*");
    out.registry = reg;

    fs.writeFileSync("db_logs.json", JSON.stringify(out, null, 2));
}
run();
