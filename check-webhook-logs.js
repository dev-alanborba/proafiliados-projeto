const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Simple env loader
const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    line = line.replace('\r', '').trim();
    if (!line || line.startsWith('#')) return;
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
        }
        env[key] = value;
    }
});

console.log('Parsed env keys:', Object.keys(env));
console.log('SUPABASE_URL length:', env.NEXT_PUBLIC_SUPABASE_URL?.length);
console.log('SUPABASE_SERVICE_ROLE_KEY length:', env.SUPABASE_SERVICE_ROLE_KEY?.length);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkLogs() {
    console.log('Checking captured_links table...');
    const { data: links, error } = await supabase
        .from('captured_links')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching links:', error);
        return;
    }

    console.log(`Found ${links.length} recent captured links:`);
    console.log(JSON.stringify(links, null, 2));
}

checkLogs();
