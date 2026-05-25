
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or Key in .env.local');
    process.exit(1);
}

console.log('🔌 Connecting to:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSignup() {
    const email = `test_debug_${Date.now()}@example.com`;
    const password = 'Password@123!';

    console.log(`👤 Attempting to sign up user: ${email}`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Debug User',
                bin_id: 'Debug_Bin_001'
            }
        }
    });

    if (error) {
        console.error('❌ Signup Failed:', error.message);
        console.error('Details:', error);
    } else {
        console.log('✅ Signup Call Successful!');
        console.log('User ID:', data.user?.id);
        console.log('User Email:', data.user?.email);
        console.log('Identities:', data.user?.identities);

        if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
            console.warn('⚠️ User created but no identity returned. This often means the user exists but is unconfirmed OR email confirmation is required.');
        } else {
            console.log('🎉 Please check your Supabase Dashboard > Authentication > Users to see if this user appears.');
        }
    }
}

debugSignup();
