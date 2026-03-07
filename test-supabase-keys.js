const fs = require('fs');
const https = require('https');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    line = line.replace('\r', '').trim();
    if (!line || line.startsWith('#')) return;
    const idx = line.indexOf('=');
    if (idx > 0) {
        env[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
    }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== SUPABASE KEY DIAGNOSTIC ===');
console.log('URL:', SUPABASE_URL);
console.log('ANON_KEY:', ANON_KEY?.substring(0, 20) + '... (length: ' + ANON_KEY?.length + ')');
console.log('SERVICE_KEY:', SERVICE_KEY?.substring(0, 20) + '... (length: ' + SERVICE_KEY?.length + ')');
console.log('');

function testKey(label, key) {
    return new Promise((resolve) => {
        const url = new URL(SUPABASE_URL + '/rest/v1/sessions?select=id,instance_name&limit=3');
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'apikey': key,
                'Authorization': 'Bearer ' + key,
                'Content-Type': 'application/json'
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.log(`[${label}] Status: ${res.statusCode}`);
                console.log(`[${label}] Response: ${data.substring(0, 500)}`);
                console.log('');
                resolve();
            });
        });
        req.on('error', (e) => {
            console.error(`[${label}] Error: ${e.message}`);
            resolve();
        });
        req.end();
    });
}

async function run() {
    await testKey('ANON_KEY', ANON_KEY);
    await testKey('SERVICE_ROLE_KEY', SERVICE_KEY);
}

run();
