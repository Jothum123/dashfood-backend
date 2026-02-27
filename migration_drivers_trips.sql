-- 1. Create drivers table
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id TEXT UNIQUE NOT NULL, -- e.g. 'PILOT-342'
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'offline', -- 'online', 'offline', 'busy'
    speed DOUBLE PRECISION DEFAULT 0,
    battery INTEGER DEFAULT 100,
    heading INTEGER DEFAULT 0,
    altitude DOUBLE PRECISION DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create trips table
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id TEXT UNIQUE NOT NULL, -- e.g. 'TRIP-ABC123'
    rider_id TEXT NOT NULL,
    initial_offer DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    final_price DECIMAL(10,2),
    status TEXT NOT NULL DEFAULT 'negotiating', -- 'negotiating', 'matched', 'cancelled', 'completed'
    negotiation_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- 4. Simple policies (Public read for simulation demo, Service Role write)
CREATE POLICY "Allow public read for drivers" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Allow service role write for drivers" ON public.drivers FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow public read for trips" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Allow service role write for trips" ON public.trips FOR ALL USING (auth.role() = 'service_role');

-- 5. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;

-- 6. Seed initial drivers
INSERT INTO public.drivers (external_id, name, latitude, longitude, status, battery, heading, altitude)
VALUES 
('PILOT-342', 'John Smith', 51.5074, -0.1278, 'online', 85, 180, 12),
('PILOT-882', 'Sarah Johnson', 51.5154, -0.1410, 'online', 92, 45, 8)
ON CONFLICT (external_id) DO NOTHING;
