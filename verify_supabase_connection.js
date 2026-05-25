
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load .env.local manually since require('dotenv').config() might default to .env
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('---------------------------------------------------');
console.log('Testing Supabase Connection');
console.log('URL:', supabaseUrl);
console.log('Reference ID:', supabaseUrl.split('.')[0].replace('https://', ''));
console.log('---------------------------------------------------');

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    // 1. Check Profiles
    console.log('\nChecking "profiles" table...');
    const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');

    if (profileError) {
        console.log('❌ Error fetching profiles:', profileError.message);
    } else {
        console.log(`✅ Profiles found: ${profiles.length}`);
        profiles.forEach(p => console.log(`   - ${p.email} (${p.full_name})`));
    }

    // 2. Create Dummy User
    const dummyEmail = `test_debug_${Date.now()}@example.com`;
    const dummyPass = 'TestUserPassword123!';
    console.log(`\nAttempting to create debug user: ${dummyEmail}...`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dummyEmail,
        password: dummyPass,
        options: {
            data: {
                full_name: "Debug User",
                bin_id: "DEBUG_BIN"
            }
        }
    });

    if (authError) {
        console.log('❌ Auth SignUp Error:', authError.message);
    } else {
        console.log('✅ Auth SignUp Successful!');
        console.log('   User ID:', authData.user?.id);
        console.log('   Is New User:', authData.user?.identities?.length > 0);

        if (authData.user) {
            console.log('\n!!! ACTION REQUIRED !!!');
            console.log('Go to your Supabase Dashboard > Authentication.');
            console.log(`Look for: ${dummyEmail}`);
            console.log('If you DO NOT see this user, you are definitely looking at the wrong project.');
        }
    }

}

test();
