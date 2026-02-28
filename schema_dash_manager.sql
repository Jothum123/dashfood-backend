-- DASHDRIVE ENTERPRISE MERCHANT SCHEMA (REPLICA OF UBER EATS MANAGER)
-- Enables Multi-tenant Hierarchy: Organization -> Region -> Store

-- 0. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Top-level Brands)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Regions (Geographic Clusters)
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Stores (Physical Locations)
-- We check if table exists. If not, create it. If yes, add columns.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stores') THEN
        CREATE TABLE stores (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
            region_id UUID REFERENCES regions(id),
            name TEXT NOT NULL,
            address TEXT,
            timezone TEXT DEFAULT 'UTC',
            acceptance_mode TEXT DEFAULT 'manual' CHECK (acceptance_mode IN ('manual', 'auto')),
            is_active BOOLEAN DEFAULT TRUE,
            sla_breach_minutes INTEGER DEFAULT 30,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- Add columns if they don't exist
        ALTER TABLE stores ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);
        ALTER TABLE stores ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
        ALTER TABLE stores ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
        ALTER TABLE stores ADD COLUMN IF NOT EXISTS acceptance_mode TEXT DEFAULT 'manual' CHECK (acceptance_mode IN ('manual', 'auto'));
        ALTER TABLE stores ADD COLUMN IF NOT EXISTS sla_breach_minutes INTEGER DEFAULT 30;
    END IF;
END $$;

-- 4. RBAC Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL, -- Owner, Admin, Manager, Staff, Analyst
    permissions JSONB DEFAULT '{}'
);

-- 5. Users
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id UUID REFERENCES organizations(id),
            store_id UUID REFERENCES stores(id),
            role_id UUID REFERENCES roles(id),
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            push_token TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES organizations(id);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;
    END IF;
END $$;

-- 6. Orders
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
        CREATE TABLE orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
            tenant_id UUID REFERENCES organizations(id),
            customer_name TEXT,
            total_amount DECIMAL(10,2),
            status TEXT DEFAULT 'new',
            items JSONB DEFAULT '[]',
            accepted_at TIMESTAMP WITH TIME ZONE,
            ready_at TIMESTAMP WITH TIME ZONE,
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- 7. Menu Management (CMS)
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rank INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Reports & Issues
CREATE TABLE IF NOT EXISTS reports_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id),
    organization_id UUID REFERENCES organizations(id),
    report_type TEXT NOT NULL,
    data JSONB NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved')),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Indices
CREATE INDEX IF NOT EXISTS idx_stores_org ON stores(organization_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(tenant_id);
