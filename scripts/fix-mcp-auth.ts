import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!key) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
    process.exit(1);
}

const configPath = path.join(process.cwd(), '.gemini/settings.json');
if (!fs.existsSync(configPath)) {
    console.error('Error: .gemini/settings.json not found');
    process.exit(1);
}

try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    if (config.mcpServers && config.mcpServers.supabase) {
        // Update or add the headers
        config.mcpServers.supabase.headers = {
            "Authorization": `Bearer ${key}`
        };
        
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log('Successfully updated .gemini/settings.json with Supabase Auth Header.');
    } else {
        console.error('Error: "supabase" entry not found in mcpServers config.');
    }
} catch (error) {
    console.error('Error processing settings file:', error);
}
