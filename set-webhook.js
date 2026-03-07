const axios = require('axios');
const fs = require('fs');

// Simple env loader
const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2 && !line.startsWith('#')) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
});

const evolutionApi = axios.create({
    baseURL: env.EVOLUTION_API_URL,
    headers: {
        'apikey': env.EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
    }
});

async function run() {
    try {
        console.log('Fetching instances...');
        const { data: instances } = await evolutionApi.get('/instance/fetchInstances');

        const webhookUrl = `https://proafiliados-projeto-ww21.vercel.app/api/webhook?secret=${env.WEBHOOK_SECRET}`;
        console.log(`Setting Webhook URL: ${webhookUrl}`);

        for (const inst of instances) {
            const instanceName = inst.instance?.instanceName || inst.name || inst.instanceName;
            console.log(`Setting webhook for instance: ${instanceName}`);

            try {
                // Evolution API v2 uses POST /webhook/instance/{instancePath}
                const res = await evolutionApi.post(`/webhook/instance/${instanceName}`, {
                    webhook: {
                        enabled: true,
                        url: webhookUrl,
                        webhookByEvents: false,
                        webhookBase64: true,
                        events: [
                            "MESSAGES_UPSERT"
                        ]
                    }
                });
                console.log(`Success setting webhook:`, res.data);
            } catch (err) {
                console.log(`Fallback endpoint /webhook/set/${instanceName}`);
                // Try old v1 endpoint
                const res2 = await evolutionApi.post(`/webhook/set/${instanceName}`, {
                    webhook: {
                        enabled: true,
                        url: webhookUrl,
                        byEvents: false,
                        base64: true,
                        events: [
                            "MESSAGES_UPSERT"
                        ]
                    }
                });
                console.log(`Success setting webhook (v1):`, res2.data);
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) console.error(err.response.data);
    }
}

run();
