
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

// Load .env.local manually
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('---------------------------------------------------');
    console.log('CHECKING PUBLIC PROFILES TABLE');
    console.log('---------------------------------------------------');

    const { data, error } = await supabase.from('profiles').select('*');

    if (error) {
        console.error('❌ Error fetching profiles:', error.message);
    } else {
        console.log(`✅ Profiles found in DB: ${data.length}`);
        if (data.length > 0) {
            console.log('List of users in public.profiles:');
            data.forEach(p => console.log(` - ${p.email} (ID: ${p.id})`));
        } else {
            console.log('⚠️  The profiles table is EMPTY.');
            console.log('Possible reasons:');
            console.log('1. No users have signed up yet.');
            console.log('2. Users signed up, but the trigger to create a profile failed.');
            console.log('3. You signed up in a DIFFERENT project.');
        }
    }
    console.log('---------------------------------------------------');
}

check();
