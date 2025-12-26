-- ============================================
-- DSMS Cyberpunk - PostgreSQL + PostGIS Schema
-- ============================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============ DRONES TABLE ============
CREATE TABLE drones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  position GEOMETRY(POINT, 4326) DEFAULT ST_SetSRID(ST_MakePoint(0, 0), 4326),
  battery INTEGER NOT NULL DEFAULT 100 CHECK (battery >= 0 AND battery <= 100),
  signal INTEGER NOT NULL DEFAULT 100 CHECK (signal >= 0 AND signal <= 100),
  status TEXT NOT NULL DEFAULT 'IDLE' CHECK (status IN ('IDLE', 'FLYING', 'RETURNING', 'CHARGING', 'OFFLINE')),
  max_range_km DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  speed_kmh DECIMAL(5,2) NOT NULL DEFAULT 40.00,
  current_mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for owner queries
CREATE INDEX idx_drones_owner_id ON drones(owner_id);

-- RLS for drones
ALTER TABLE drones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own drones"
  ON drones FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own drones"
  ON drones FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own drones"
  ON drones FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own drones"
  ON drones FOR DELETE
  USING (auth.uid() = owner_id);


-- ============ MISSIONS TABLE ============
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'READY', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ABORTED')),
  
  -- Geospatial columns with PostGIS
  polygon GEOMETRY(POLYGON, 4326),
  flight_path GEOMETRY(LINESTRING, 4326),
  
  -- Configuration
  altitude_m INTEGER NOT NULL DEFAULT 50 CHECK (altitude_m >= 20 AND altitude_m <= 120),
  overlap_percent INTEGER NOT NULL DEFAULT 70 CHECK (overlap_percent >= 30 AND overlap_percent <= 90),
  camera_fov_deg INTEGER NOT NULL DEFAULT 84,
  speed_kmh DECIMAL(5,2) NOT NULL DEFAULT 40.00,
  
  -- Mission data
  assigned_drone_id UUID REFERENCES drones(id) ON DELETE SET NULL,
  estimated_duration_min INTEGER,
  estimated_distance_km DECIMAL(8,2),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spatial index for flight paths
CREATE INDEX idx_missions_polygon ON missions USING GIST (polygon);
CREATE INDEX idx_missions_flight_path ON missions USING GIST (flight_path);
CREATE INDEX idx_missions_owner_id ON missions(owner_id);
CREATE INDEX idx_missions_status ON missions(status);

-- RLS for missions
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own missions"
  ON missions FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own missions"
  ON missions FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own missions"
  ON missions FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own missions"
  ON missions FOR DELETE
  USING (auth.uid() = owner_id);


-- ============ NO-FLY ZONES TABLE ============
CREATE TABLE nfz_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  polygon GEOMETRY(POLYGON, 4326) NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('WARNING', 'RESTRICTED', 'PROHIBITED')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spatial index for NFZ queries
CREATE INDEX idx_nfz_polygon ON nfz_zones USING GIST (polygon);

-- NFZ zones are public read
ALTER TABLE nfz_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view NFZ zones"
  ON nfz_zones FOR SELECT
  USING (true);


-- ============ HELPER FUNCTIONS ============

-- Function to check if a path intersects any active NFZ
CREATE OR REPLACE FUNCTION check_nfz_intersection(path GEOMETRY)
RETURNS TABLE(zone_id UUID, zone_name TEXT, severity TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nfz.id,
    nfz.name,
    nfz.severity
  FROM nfz_zones nfz
  WHERE nfz.active = true
    AND ST_Intersects(nfz.polygon, path);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_drones_updated_at
  BEFORE UPDATE ON drones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON missions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============ SAMPLE DATA ============

-- Insert sample NFZ zones (San Francisco area)
INSERT INTO nfz_zones (name, polygon, severity, active) VALUES
(
  'SFO Airport Zone',
  ST_SetSRID(ST_GeomFromText('POLYGON((-122.42 37.78, -122.41 37.78, -122.41 37.77, -122.42 37.77, -122.42 37.78))'), 4326),
  'PROHIBITED',
  true
),
(
  'Government Building',
  ST_SetSRID(ST_GeomFromText('POLYGON((-122.415 37.775, -122.413 37.775, -122.413 37.773, -122.415 37.773, -122.415 37.775))'), 4326),
  'RESTRICTED',
  true
);
