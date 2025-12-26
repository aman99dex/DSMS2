/**
 * Zustand Stores for DSMS Cyberpunk
 */

import { create } from 'zustand';
import type {
    Drone,
    Mission,
    SimulationState,
    MissionConfig,
    OrgStatistics,
    MissionSummary,
    SurveyPattern,
    SensorType
} from '@/types';
import type { Position } from 'geojson';

// ============ DRONE STORE ============

interface DroneState {
    drones: Drone[];
    selectedDroneId: string | null;
    setDrones: (drones: Drone[]) => void;
    selectDrone: (id: string | null) => void;
    updateDrone: (id: string, updates: Partial<Drone>) => void;
    getDroneById: (id: string) => Drone | undefined;
    getAvailableDrones: () => Drone[];
    getActiveDrones: () => Drone[];
}

// Mock drones for demo
const mockDrones: Drone[] = [
    {
        id: 'drone-1',
        name: 'PHANTOM-X1',
        model: 'DJI M300 RTK',
        position: { lat: 37.7749, lng: -122.4194 },
        battery: 94,
        signal: 98,
        status: 'IDLE',
        max_range_km: 15,
        speed_kmh: 50,
        current_mission_id: null,
        owner_id: 'user-1',
        created_at: new Date().toISOString(),
        totalFlightHours: 127.5,
        totalMissions: 48,
        lastMaintenanceDate: '2024-12-01',
        capabilities: {
            maxPayload_kg: 2.7,
            supportedSensors: ['RGB', 'THERMAL', 'LIDAR'],
            hasRTK: true,
            hasObstacleAvoidance: true
        }
    },
    {
        id: 'drone-2',
        name: 'SPECTER-7',
        model: 'DJI Mavic 3E',
        position: { lat: 37.7755, lng: -122.4180 },
        battery: 78,
        signal: 95,
        status: 'IDLE',
        max_range_km: 12,
        speed_kmh: 45,
        current_mission_id: null,
        owner_id: 'user-1',
        created_at: new Date().toISOString(),
        totalFlightHours: 89.2,
        totalMissions: 35,
        lastMaintenanceDate: '2024-11-15',
        capabilities: {
            maxPayload_kg: 0.9,
            supportedSensors: ['RGB', 'MULTISPECTRAL'],
            hasRTK: true,
            hasObstacleAvoidance: true
        }
    },
    {
        id: 'drone-3',
        name: 'GHOST-3',
        model: 'Autel EVO II Pro',
        position: { lat: 37.7742, lng: -122.4200 },
        battery: 18,
        signal: 82,
        status: 'CHARGING',
        max_range_km: 10,
        speed_kmh: 40,
        current_mission_id: null,
        owner_id: 'user-1',
        created_at: new Date().toISOString(),
        totalFlightHours: 65.8,
        totalMissions: 22,
        lastMaintenanceDate: '2024-10-28',
        capabilities: {
            maxPayload_kg: 0.5,
            supportedSensors: ['RGB', 'THERMAL'],
            hasRTK: false,
            hasObstacleAvoidance: true
        }
    },
    {
        id: 'drone-4',
        name: 'WRAITH-9',
        model: 'Skydio X2',
        position: { lat: 37.7760, lng: -122.4210 },
        battery: 62,
        signal: 88,
        status: 'IDLE',
        max_range_km: 8,
        speed_kmh: 35,
        current_mission_id: null,
        owner_id: 'user-1',
        created_at: new Date().toISOString(),
        totalFlightHours: 42.3,
        totalMissions: 15,
        lastMaintenanceDate: '2024-12-10',
        capabilities: {
            maxPayload_kg: 0.3,
            supportedSensors: ['RGB'],
            hasRTK: false,
            hasObstacleAvoidance: true
        }
    },
    {
        id: 'drone-5',
        name: 'REAPER-2',
        model: 'DJI Matrice 30T',
        position: { lat: 37.7738, lng: -122.4188 },
        battery: 100,
        signal: 100,
        status: 'IDLE',
        max_range_km: 20,
        speed_kmh: 55,
        current_mission_id: null,
        owner_id: 'user-1',
        created_at: new Date().toISOString(),
        totalFlightHours: 215.7,
        totalMissions: 82,
        lastMaintenanceDate: '2024-12-20',
        capabilities: {
            maxPayload_kg: 3.0,
            supportedSensors: ['RGB', 'THERMAL', 'LIDAR', 'MULTISPECTRAL'],
            hasRTK: true,
            hasObstacleAvoidance: true
        }
    },
];

export const useDroneStore = create<DroneState>((set, get) => ({
    drones: mockDrones,
    selectedDroneId: null,

    setDrones: (drones) => set({ drones }),

    selectDrone: (id) => set({ selectedDroneId: id }),

    updateDrone: (id, updates) =>
        set((state) => ({
            drones: state.drones.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),

    getDroneById: (id) => get().drones.find((d) => d.id === id),

    getAvailableDrones: () =>
        get().drones.filter((d) => d.status === 'IDLE' && d.battery > 20),

    getActiveDrones: () =>
        get().drones.filter((d) => d.status === 'FLYING'),
}));

// ============ MISSION STORE ============

interface MissionState {
    missions: Mission[];
    currentMission: Mission | null;
    drawnPolygon: Position[] | null;
    generatedPath: Position[] | null;
    missionConfig: MissionConfig;

    setDrawnPolygon: (polygon: Position[] | null) => void;
    setGeneratedPath: (path: Position[] | null) => void;
    setMissionConfig: (config: Partial<MissionConfig>) => void;
    createMission: (mission: Omit<Mission, 'id' | 'created_at'>) => string;
    updateMission: (id: string, updates: Partial<Mission>) => void;
    setCurrentMission: (mission: Mission | null) => void;
    clearCurrentMission: () => void;
    setPattern: (pattern: SurveyPattern) => void;
    setSensors: (sensors: SensorType[]) => void;
}

const defaultConfig: MissionConfig = {
    altitude_m: 50,
    overlap_percent: 70,
    camera_fov_deg: 84,
    speed_kmh: 40,
    pattern: 'SNAKE',
    sensors: ['RGB'],
    captureFrequency: 2,
    terrainFollow: false,
    sidelap_percent: 65,
};

// Mock historical missions
const mockMissions: Mission[] = [
    {
        id: 'mission-hist-1',
        name: 'Downtown Survey Alpha',
        status: 'COMPLETED',
        polygon: { type: 'Polygon', coordinates: [] },
        flight_path: null,
        waypoints: [],
        config: defaultConfig,
        assigned_drone_id: 'drone-1',
        estimated_duration_min: 25,
        estimated_distance_km: 4.2,
        progress: 100,
        owner_id: 'user-1',
        created_at: '2024-12-20T10:30:00Z',
        started_at: '2024-12-20T10:35:00Z',
        completed_at: '2024-12-20T11:02:00Z',
        area_sq_km: 0.85,
        estimated_photos: 420,
        actual_photos: 418,
        coverage_percent: 98.5,
    },
    {
        id: 'mission-hist-2',
        name: 'Industrial Zone Mapping',
        status: 'COMPLETED',
        polygon: { type: 'Polygon', coordinates: [] },
        flight_path: null,
        waypoints: [],
        config: { ...defaultConfig, pattern: 'CROSSHATCH' },
        assigned_drone_id: 'drone-2',
        estimated_duration_min: 35,
        estimated_distance_km: 6.8,
        progress: 100,
        owner_id: 'user-1',
        created_at: '2024-12-19T14:00:00Z',
        started_at: '2024-12-19T14:10:00Z',
        completed_at: '2024-12-19T14:48:00Z',
        area_sq_km: 1.2,
        estimated_photos: 680,
        actual_photos: 675,
        coverage_percent: 99.2,
    },
    {
        id: 'mission-hist-3',
        name: 'Coastal Perimeter Scan',
        status: 'COMPLETED',
        polygon: { type: 'Polygon', coordinates: [] },
        flight_path: null,
        waypoints: [],
        config: { ...defaultConfig, pattern: 'PERIMETER' },
        assigned_drone_id: 'drone-5',
        estimated_duration_min: 18,
        estimated_distance_km: 3.1,
        progress: 100,
        owner_id: 'user-1',
        created_at: '2024-12-18T09:00:00Z',
        started_at: '2024-12-18T09:05:00Z',
        completed_at: '2024-12-18T09:24:00Z',
        area_sq_km: 0.45,
        estimated_photos: 180,
        actual_photos: 182,
        coverage_percent: 100,
    },
    {
        id: 'mission-hist-4',
        name: 'Agricultural Field Beta',
        status: 'ABORTED',
        polygon: { type: 'Polygon', coordinates: [] },
        flight_path: null,
        waypoints: [],
        config: { ...defaultConfig, sensors: ['RGB', 'MULTISPECTRAL'] },
        assigned_drone_id: 'drone-2',
        estimated_duration_min: 45,
        estimated_distance_km: 8.5,
        progress: 35,
        owner_id: 'user-1',
        created_at: '2024-12-17T11:00:00Z',
        started_at: '2024-12-17T11:15:00Z',
        completed_at: '2024-12-17T11:32:00Z',
        area_sq_km: 2.1,
        estimated_photos: 920,
        actual_photos: 322,
        coverage_percent: 35,
    },
];

export const useMissionStore = create<MissionState>((set, get) => ({
    missions: mockMissions,
    currentMission: null,
    drawnPolygon: null,
    generatedPath: null,
    missionConfig: defaultConfig,

    setDrawnPolygon: (polygon) => set({ drawnPolygon: polygon }),

    setGeneratedPath: (path) => set({ generatedPath: path }),

    setMissionConfig: (config) =>
        set((state) => ({
            missionConfig: { ...state.missionConfig, ...config },
        })),

    setPattern: (pattern) =>
        set((state) => ({
            missionConfig: { ...state.missionConfig, pattern },
        })),

    setSensors: (sensors) =>
        set((state) => ({
            missionConfig: { ...state.missionConfig, sensors },
        })),

    createMission: (mission) => {
        const id = `mission-${Date.now()}`;
        set((state) => ({
            missions: [...state.missions, { ...mission, id, created_at: new Date().toISOString() }],
        }));
        return id;
    },

    updateMission: (id, updates) =>
        set((state) => ({
            missions: state.missions.map((m) => (m.id === id ? { ...m, ...updates } : m)),
            currentMission:
                state.currentMission?.id === id
                    ? { ...state.currentMission, ...updates }
                    : state.currentMission,
        })),

    setCurrentMission: (mission) => set({ currentMission: mission }),

    clearCurrentMission: () =>
        set({ currentMission: null, drawnPolygon: null, generatedPath: null }),
}));

// ============ SIMULATION STORE ============

interface SimulationStoreState {
    simulation: SimulationState;
    startSimulation: (waypoints: Position[]) => void;
    pauseSimulation: () => void;
    resumeSimulation: () => void;
    stopSimulation: () => void;
    setSpeed: (speed: number) => void;
    updateSimulationState: (updates: Partial<SimulationState>) => void;
    returnToHome: () => void;
    skipWaypoint: () => void;
}

const initialSimulationState: SimulationState = {
    isRunning: false,
    isPaused: false,
    speed: 1,
    currentWaypointIndex: 0,
    progress: 0,
    dronePosition: [0, 0],
    droneBearing: 0,
    trailCoordinates: [],
    elapsedTime: 0,
    distanceCovered_km: 0,
    distanceRemaining_km: 0,
    eta_seconds: 0,
    photosCaptures: 0,
};

export const useSimulationStore = create<SimulationStoreState>((set, get) => ({
    simulation: initialSimulationState,

    startSimulation: (waypoints) =>
        set({
            simulation: {
                ...initialSimulationState,
                isRunning: true,
                dronePosition: waypoints[0] as [number, number],
            },
        }),

    pauseSimulation: () =>
        set((state) => ({
            simulation: { ...state.simulation, isPaused: true },
        })),

    resumeSimulation: () =>
        set((state) => ({
            simulation: { ...state.simulation, isPaused: false },
        })),

    stopSimulation: () =>
        set({ simulation: initialSimulationState }),

    setSpeed: (speed) =>
        set((state) => ({
            simulation: { ...state.simulation, speed },
        })),

    updateSimulationState: (updates) =>
        set((state) => ({
            simulation: { ...state.simulation, ...updates },
        })),

    returnToHome: () => {
        // RTH - will set a flag that the simulation hook picks up
        set((state) => ({
            simulation: { ...state.simulation, isRunning: false, isPaused: false },
        }));
    },

    skipWaypoint: () =>
        set((state) => ({
            simulation: {
                ...state.simulation,
                currentWaypointIndex: state.simulation.currentWaypointIndex + 1,
            },
        })),
}));

// ============ UI STORE ============

interface UIState {
    isSidebarOpen: boolean;
    isAlertModalOpen: boolean;
    alertMessage: string;
    activeTab: 'map' | 'analytics';
    isDrawingMode: boolean;

    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    showAlert: (message: string) => void;
    hideAlert: () => void;
    setActiveTab: (tab: 'map' | 'analytics') => void;
    setDrawingMode: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isSidebarOpen: true,
    isAlertModalOpen: false,
    alertMessage: '',
    activeTab: 'map',
    isDrawingMode: false,

    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    setSidebarOpen: (open) => set({ isSidebarOpen: open }),

    showAlert: (message) => set({ isAlertModalOpen: true, alertMessage: message }),

    hideAlert: () => set({ isAlertModalOpen: false, alertMessage: '' }),

    setActiveTab: (tab) => set({ activeTab: tab }),

    setDrawingMode: (enabled) => set({ isDrawingMode: enabled }),
}));

// ============ ORGANIZATION STATISTICS STORE ============

interface OrgStatsState {
    stats: OrgStatistics;
    updateStats: () => void;
}

const calculateOrgStats = (): OrgStatistics => {
    const drones = useDroneStore.getState().drones;
    const missions = useMissionStore.getState().missions;

    const completedMissions = missions.filter(m => m.status === 'COMPLETED');
    const abortedMissions = missions.filter(m => m.status === 'ABORTED');

    const totalFlightHours = drones.reduce((acc, d) => acc + d.totalFlightHours, 0);
    const totalDistance = completedMissions.reduce((acc, m) => acc + m.estimated_distance_km, 0);
    const totalArea = completedMissions.reduce((acc, m) => acc + (m.area_sq_km || 0), 0);
    const totalPhotos = completedMissions.reduce((acc, m) => acc + (m.actual_photos || 0), 0);
    const avgDuration = completedMissions.length > 0
        ? completedMissions.reduce((acc, m) => acc + m.estimated_duration_min, 0) / completedMissions.length
        : 0;

    return {
        totalDrones: drones.length,
        activeDrones: drones.filter(d => d.status === 'FLYING').length,
        totalMissions: missions.length,
        completedMissions: completedMissions.length,
        abortedMissions: abortedMissions.length,
        totalFlightHours: Math.round(totalFlightHours * 10) / 10,
        totalDistanceKm: Math.round(totalDistance * 10) / 10,
        totalAreaCoveredSqKm: Math.round(totalArea * 100) / 100,
        totalPhotos,
        averageMissionDuration: Math.round(avgDuration),
        successRate: missions.length > 0
            ? Math.round((completedMissions.length / missions.length) * 100)
            : 0,
        lastUpdated: new Date().toISOString(),
    };
};

export const useOrgStatsStore = create<OrgStatsState>((set) => ({
    stats: calculateOrgStats(),

    updateStats: () => set({ stats: calculateOrgStats() }),
}));
