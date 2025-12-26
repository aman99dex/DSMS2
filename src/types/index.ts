// ============ COORDINATES & GEOMETRY ============
export interface Coordinate {
    lat: number;
    lng: number;
}

export interface GeoJSONPoint {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
}

export interface GeoJSONLineString {
    type: 'LineString';
    coordinates: [number, number][];
}

export interface GeoJSONPolygon {
    type: 'Polygon';
    coordinates: [number, number][][];
}

// ============ SENSORS & PATTERNS ============
export type SensorType = 'RGB' | 'THERMAL' | 'LIDAR' | 'MULTISPECTRAL';

export type SurveyPattern = 'SNAKE' | 'CROSSHATCH' | 'PERIMETER' | 'SPIRAL';

export interface DataCollectionConfig {
    sensors: SensorType[];
    captureFrequency: number; // photos per second
    terrainFollow: boolean;
    groundResolution_cm: number; // desired GSD
}

// ============ DRONE ============
export type DroneStatus = 'IDLE' | 'FLYING' | 'RETURNING' | 'CHARGING' | 'OFFLINE' | 'MAINTENANCE';

export interface DroneCapabilities {
    maxPayload_kg: number;
    supportedSensors: SensorType[];
    hasRTK: boolean;
    hasObstacleAvoidance: boolean;
}

export interface Drone {
    id: string;
    name: string;
    model: string;
    position: Coordinate;
    battery: number; // 0-100
    signal: number; // 0-100
    status: DroneStatus;
    max_range_km: number;
    speed_kmh: number;
    current_mission_id: string | null;
    owner_id: string;
    created_at: string;
    // New fields
    totalFlightHours: number;
    totalMissions: number;
    lastMaintenanceDate: string | null;
    capabilities?: DroneCapabilities;
}

// ============ MISSION ============
export type MissionStatus = 'DRAFT' | 'READY' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'ABORTED';

export interface MissionConfig {
    altitude_m: number; // 20-120
    overlap_percent: number; // 30-90
    camera_fov_deg: number; // default 84
    speed_kmh: number;
    // New fields
    pattern: SurveyPattern;
    sensors: SensorType[];
    captureFrequency: number; // photos per second
    terrainFollow: boolean;
    sidelap_percent: number; // side overlap for crosshatch
}

export interface Mission {
    id: string;
    name: string;
    status: MissionStatus;
    polygon: GeoJSONPolygon;
    flight_path: GeoJSONLineString | null;
    waypoints: [number, number][]; // [lng, lat][]
    config: MissionConfig;
    assigned_drone_id: string | null;
    estimated_duration_min: number;
    estimated_distance_km: number;
    progress: number; // 0-100
    owner_id: string;
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
    // New fields
    area_sq_km: number;
    estimated_photos: number;
    actual_photos: number;
    coverage_percent: number;
}

// ============ NO-FLY ZONES ============
export interface NoFlyZone {
    id: string;
    name: string;
    polygon: GeoJSONPolygon;
    severity: 'WARNING' | 'RESTRICTED' | 'PROHIBITED';
    active: boolean;
}

// ============ VALIDATION ============
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    code: 'NFZ_INTERSECTION' | 'RANGE_EXCEEDED' | 'LOW_BATTERY' | 'NO_DRONE';
    message: string;
    details?: unknown;
}

export interface ValidationWarning {
    code: 'LOW_BATTERY_WARNING' | 'WEATHER_ADVISORY';
    message: string;
}

// ============ SIMULATION ============
export interface SimulationState {
    isRunning: boolean;
    isPaused: boolean;
    speed: number; // 1, 2, 5, 10
    currentWaypointIndex: number;
    progress: number; // 0-1
    dronePosition: [number, number];
    droneBearing: number;
    trailCoordinates: [number, number][];
    elapsedTime: number; // seconds
    // New fields
    distanceCovered_km: number;
    distanceRemaining_km: number;
    eta_seconds: number;
    photosCaptures: number;
}

// ============ UI STATE ============
export type ViewTab = 'map' | 'analytics';

export interface DrawState {
    isDrawing: boolean;
    drawnPolygon: GeoJSONPolygon | null;
}

// ============ ORGANIZATION STATISTICS ============
export interface OrgStatistics {
    totalDrones: number;
    activeDrones: number;
    totalMissions: number;
    completedMissions: number;
    abortedMissions: number;
    totalFlightHours: number;
    totalDistanceKm: number;
    totalAreaCoveredSqKm: number;
    totalPhotos: number;
    averageMissionDuration: number;
    successRate: number; // 0-100
    lastUpdated: string;
}

// ============ HISTORICAL DATA ============
export interface MissionSummary {
    id: string;
    name: string;
    date: string;
    droneName: string;
    duration_min: number;
    distance_km: number;
    area_sq_km: number;
    photos: number;
    status: MissionStatus;
}

export interface FleetUtilization {
    droneId: string;
    droneName: string;
    missionsCompleted: number;
    flightHours: number;
    utilizationPercent: number;
}
