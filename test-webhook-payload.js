const axios = require('axios');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2 && !line.startsWith('#')) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
});

const WEBHOOK_URL = `http://localhost:3000/api/webhook?secret=${env.WEBHOOK_SECRET}`;

async function runTest() {
    console.log(`Sending simulated payload to ${WEBHOOK_URL}...`);
    // Find instance name from latest sessions? I don't know it, but I can use 'user_257e3bc9' which we saw earlier in the logs

    const payload = {
        event: 'messages.upsert',
        data: {
            instance: 'user_257e3bc9',
            pushName: 'Test User',
            key: {
                remoteJid: '12345678@g.us'
            },
            message: {
                extendedTextMessage: {
                    text: 'Olha que legal: https://shopee.com.br/teste'
                }
            }
        }
    };

    try {
        const res = await axios.post(WEBHOOK_URL, payload);
        console.log('Result (HTTP 200/OK):', res.data);
    } catch (err) {
        console.error('Error (HTTP Failed):');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

runTest();
