
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or Key in .env.local');
    process.exit(1);
}

// Extract Project ID
const projectId = supabaseUrl.split('//')[1].split('.')[0];

console.log('--------------------------------------------------');
console.log('🔍 PROJECT IDENTIFICATION');
console.log('--------------------------------------------------');
console.log('Your .env.local points to Project ID:', projectId);
console.log('URL:', supabaseUrl);
console.log('Please verify this matches the Project Reference ID in your Supabase Dashboard settings.');
console.log('--------------------------------------------------');

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSignup() {
    // Use a simpler, highly compliant email format
    const uniqueId = Date.now().toString().slice(-6);
    const email = `test.user.${uniqueId}@gmail.com`;
    // Strong password to satisfy default policies
    const password = 'TestUserPassword!123';

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
        console.error('Error Code:', error.code || 'N/A');
        console.error('Details:', JSON.stringify(error, null, 2));

        if (error.message.includes('weak_password')) {
            console.log('💡 Tip: Disable "Enforce strong passwords" in Authentication > Providers > Email for testing.');
        }
        if (error.message.includes('email_address_invalid')) {
            console.log('💡 Tip: Check if you have "Confirm email" enabled or domain restrictions.');
        }
    } else {
        console.log('✅ Signup Call Successful!');
        console.log('User ID:', data.user?.id);
        console.log('User Email:', data.user?.email);

        if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
            console.warn('⚠️ User object returned but identities empty. User might be unconfirmed.');
        } else {
            console.log('🎉 SUCCESS! A new user was created.');
            console.log('👉 GO TO SUPABASE DASHBOARD > AUTHENTICATION > USERS');
            console.log('👉 LOOK FOR:', email);
            console.log('If you DO NOT see this user, you are looking at the WRONG project dashboard.');
        }
    }
}

debugSignup();
