/**
 * PathValidator.ts
 * 
 * Validates flight paths against No-Fly Zones and drone capabilities
 */

import * as turf from '@turf/turf';
import type { Feature, LineString, Polygon, Position } from 'geojson';
import type { NoFlyZone, Drone, ValidationResult, ValidationError, ValidationWarning } from '@/types';

// ============ MOCK DATA ============

// Mock No-Fly Zones for demo
export const mockNoFlyZones: NoFlyZone[] = [
    {
        id: 'nfz-1',
        name: 'Airport Restricted Zone',
        polygon: {
            type: 'Polygon',
            coordinates: [[
                [-122.42, 37.78],
                [-122.41, 37.78],
                [-122.41, 37.77],
                [-122.42, 37.77],
                [-122.42, 37.78],
            ]],
        },
        severity: 'PROHIBITED',
        active: true,
    },
    {
        id: 'nfz-2',
        name: 'Government Building',
        polygon: {
            type: 'Polygon',
            coordinates: [[
                [-122.415, 37.775],
                [-122.413, 37.775],
                [-122.413, 37.773],
                [-122.415, 37.773],
                [-122.415, 37.775],
            ]],
        },
        severity: 'RESTRICTED',
        active: true,
    },
];

// ============ VALIDATION FUNCTIONS ============

/**
 * Check if a flight path intersects any No-Fly Zones
 */
export function checkNFZIntersections(
    flightPath: Feature<LineString>,
    noFlyZones: NoFlyZone[]
): ValidationError[] {
    const errors: ValidationError[] = [];

    noFlyZones.forEach((nfz) => {
        if (!nfz.active) return;

        const nfzPolygon = turf.polygon(nfz.polygon.coordinates);

        // Check if path intersects NFZ
        const intersects = turf.booleanIntersects(flightPath, nfzPolygon);

        if (intersects) {
            errors.push({
                code: 'NFZ_INTERSECTION',
                message: `Flight path intersects ${nfz.severity} zone: ${nfz.name}`,
                details: {
                    zoneId: nfz.id,
                    zoneName: nfz.name,
                    severity: nfz.severity,
                },
            });
        }
    });

    return errors;
}

/**
 * Check if flight path is within drone's range capability
 */
export function checkRangeLimit(
    pathDistance_km: number,
    drone: Drone
): ValidationError | null {
    if (pathDistance_km > drone.max_range_km) {
        return {
            code: 'RANGE_EXCEEDED',
            message: `Path distance (${pathDistance_km.toFixed(1)} km) exceeds drone max range (${drone.max_range_km} km)`,
            details: {
                pathDistance: pathDistance_km,
                maxRange: drone.max_range_km,
                deficit: pathDistance_km - drone.max_range_km,
            },
        };
    }
    return null;
}

/**
 * Check battery level for mission
 */
export function checkBattery(
    pathDistance_km: number,
    drone: Drone
): { error: ValidationError | null; warning: ValidationWarning | null } {
    // Estimate ~2% battery per km
    const estimatedConsumption = pathDistance_km * 2;
    const remainingAfter = drone.battery - estimatedConsumption;

    if (remainingAfter < 10) {
        return {
            error: {
                code: 'LOW_BATTERY',
                message: `Insufficient battery for mission. Need ${estimatedConsumption.toFixed(0)}%, have ${drone.battery}%`,
                details: {
                    required: estimatedConsumption,
                    available: drone.battery,
                    remainingAfter,
                },
            },
            warning: null,
        };
    }

    if (remainingAfter < 25) {
        return {
            error: null,
            warning: {
                code: 'LOW_BATTERY_WARNING',
                message: `Low battery after mission: ~${remainingAfter.toFixed(0)}% remaining`,
            },
        };
    }

    return { error: null, warning: null };
}

/**
 * Main validation function
 */
export function validatePath(
    flightPath: Feature<LineString>,
    pathDistance_km: number,
    drone: Drone | null,
    noFlyZones: NoFlyZone[] = mockNoFlyZones
): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check if drone is assigned
    if (!drone) {
        errors.push({
            code: 'NO_DRONE',
            message: 'No drone assigned to mission',
        });
        return { valid: false, errors, warnings };
    }

    // Check NFZ intersections
    const nfzErrors = checkNFZIntersections(flightPath, noFlyZones);
    errors.push(...nfzErrors);

    // Check range
    const rangeError = checkRangeLimit(pathDistance_km, drone);
    if (rangeError) errors.push(rangeError);

    // Check battery
    const batteryCheck = checkBattery(pathDistance_km, drone);
    if (batteryCheck.error) errors.push(batteryCheck.error);
    if (batteryCheck.warning) warnings.push(batteryCheck.warning);

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Get all No-Fly Zones as GeoJSON FeatureCollection for map display
 */
export function getNFZFeatures(): GeoJSON.FeatureCollection<Polygon> {
    return {
        type: 'FeatureCollection',
        features: mockNoFlyZones.map((nfz) => ({
            type: 'Feature' as const,
            properties: {
                id: nfz.id,
                name: nfz.name,
                severity: nfz.severity,
            },
            geometry: nfz.polygon,
        })),
    };
}
