const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../config/supabase');

const audit = async () => {
    try {
        const tables = ['organizations', 'regions', 'stores', 'orders', 'issues'];
        for (const t of tables) {
            const { error } = await supabase.from(t).select('*').limit(0);
            console.log(`${t}: ${error ? 'MISSING' : 'OK'}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

audit();
