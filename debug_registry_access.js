
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Create a client with the ANON key (simulating the frontend)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAnonRead() {
    console.log('Testing anon read on r3bin_registry...');
    const binIdToFind = 'Bin_001';

    const { data, error } = await supabase
        .from('r3bin_registry')
        .select('bin_id')
        .eq('bin_id', binIdToFind)
        .single();

    if (error) {
        console.error('❌ Error (likely RLS blocking):', error.message);
        console.error('Details:', error);
    } else if (data) {
        console.log('✅ Success! Found bin:', data);
    } else {
        console.log('❌ No error, but no data found. Check your bin ID case.');
    }
}

testAnonRead();
