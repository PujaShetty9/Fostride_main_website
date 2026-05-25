require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkRLS() {
    const { data, error } = await supabase.from('r3bin_waste_logs').select('*').limit(5);
    console.log("Anon query error:", error);
    console.log("Anon query data length:", data ? data.length : 0);
}
checkRLS();
