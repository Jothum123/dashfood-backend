const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../config/supabase');

const seed = async () => {
    console.log("🌱 Starting Safe Seeding Process...");

    try {
        // 1. Organization
        const slug = 'dashfood-group';
        let { data: org } = await supabase.from('organizations').select('*').eq('slug', slug).maybeSingle();

        if (!org) {
            console.log("  Creating Organization...");
            const { data: newOrg, error: orgErr } = await supabase
                .from('organizations')
                .insert({ name: 'DashFood Group', slug: slug })
                .select().single();
            if (orgErr) throw orgErr;
            org = newOrg;
        }
        console.log("✅ Organization Ready:", org.name);

        // 2. Region
        const regionName = 'London Central';
        let { data: region } = await supabase.from('regions').select('*').eq('name', regionName).eq('organization_id', org.id).maybeSingle();

        if (!region) {
            console.log("  Creating Region...");
            const { data: newRegion, error: regionErr } = await supabase
                .from('regions')
                .insert({ organization_id: org.id, name: regionName })
                .select().single();
            if (regionErr) throw regionErr;
            region = newRegion;
        }
        console.log("✅ Region Ready:", region.name);

        // 3. Store
        const storeName = 'DashDrive London HQ';
        let { data: store } = await supabase.from('stores').select('*').eq('name', storeName).eq('organization_id', org.id).maybeSingle();

        if (!store) {
            console.log("  Creating Store...");
            const { data: newStore, error: storeErr } = await supabase
                .from('stores')
                .insert({
                    organization_id: org.id,
                    region_id: region.id,
                    name: storeName,
                    address: '123 Tech Lane, London',
                    is_active: true,
                    sla_breach_minutes: 30
                })
                .select().single();
            if (storeErr) throw storeErr;
            store = newStore;
        }
        console.log("✅ Store Ready:", store.name);

        // 4. Orders (Append only for now)
        const orders = [
            {
                store_id: store.id,
                tenant_id: org.id,
                customer_name: 'Justin Chithu',
                total_amount: 45.50,
                status: 'completed',
                created_at: new Date(Date.now() - 3600000).toISOString(),
                accepted_at: new Date(Date.now() - 3500000).toISOString(),
                ready_at: new Date(Date.now() - 3000000).toISOString(),
                completed_at: new Date(Date.now() - 2500000).toISOString()
            },
            {
                store_id: store.id,
                tenant_id: org.id,
                customer_name: 'Alice Smith',
                total_amount: 22.00,
                status: 'in_progress',
                created_at: new Date(Date.now() - 600000).toISOString()
            },
            {
                store_id: store.id,
                tenant_id: org.id,
                customer_name: 'Bob Jones',
                total_amount: 15.75,
                status: 'new',
                created_at: new Date().toISOString()
            }
        ];

        const { data: createdOrders, error: orderErr } = await supabase
            .from('orders')
            .insert(orders)
            .select();

        if (orderErr) throw orderErr;
        console.log(`✅ ${createdOrders.length} Orders Created.`);

        console.log("🚀 Seeding Complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding Failed:", err.message);
        process.exit(1);
    }
};

seed();
