/**
 * FlightPathGenerator.ts
 * 
 * Core algorithm for generating survey flight paths inside a polygon.
 * Supports multiple patterns: Snake, Crosshatch, Perimeter, Spiral
 */

import * as turf from '@turf/turf';
import type { Feature, Polygon, LineString, Position } from 'geojson';
import type { SurveyPattern } from '@/types';

// ============ CONSTANTS ============
const DEFAULT_FOV_DEG = 84;
const DEFAULT_OVERLAP = 0.7;

// ============ TYPES ============
export interface FlightPathConfig {
    altitude_m: number;
    overlap_percent: number;
    camera_fov_deg?: number;
    pattern?: SurveyPattern;
    sidelap_percent?: number;
    speed_kmh?: number;
}

export interface FlightPathResult {
    flightPath: Feature<LineString>;
    waypoints: Position[];
    totalDistance_km: number;
    estimatedDuration_min: number;
    numWaypoints: number;
    gridSpacing_m: number;
    estimatedPhotos: number;
    area_sq_km: number;
}

// ============ UTILITY FUNCTIONS ============

/**
 * Calculate the ground coverage width based on altitude and camera FOV
 */
export function calculateGroundCoverage(altitude_m: number, fov_deg: number = DEFAULT_FOV_DEG): number {
    const fovRad = (fov_deg * Math.PI) / 180;
    return 2 * altitude_m * Math.tan(fovRad / 2);
}

/**
 * Calculate grid line spacing based on altitude and overlap
 */
export function calculateGridSpacing(
    altitude_m: number,
    overlap_percent: number,
    fov_deg: number = DEFAULT_FOV_DEG
): number {
    const groundCoverage = calculateGroundCoverage(altitude_m, fov_deg);
    const overlapFactor = 1 - overlap_percent / 100;
    return groundCoverage * overlapFactor;
}

/**
 * Find the principal axis (longest edge) of a polygon and return its bearing
 */
export function findPrincipalAxisBearing(polygon: Feature<Polygon>): number {
    const coords = polygon.geometry.coordinates[0];
    let maxLength = 0;
    let principalBearing = 0;

    for (let i = 0; i < coords.length - 1; i++) {
        const p1 = turf.point(coords[i]);
        const p2 = turf.point(coords[i + 1]);
        const length = turf.distance(p1, p2);

        if (length > maxLength) {
            maxLength = length;
            principalBearing = turf.bearing(p1, p2);
        }
    }

    return principalBearing;
}

/**
 * Rotate a polygon around its centroid
 */
export function rotatePolygon(polygon: Feature<Polygon>, angle: number): Feature<Polygon> {
    const centroid = turf.centroid(polygon);
    return turf.transformRotate(polygon, angle, { pivot: centroid.geometry.coordinates });
}

/**
 * Generate horizontal scan lines inside a polygon
 */
function generateScanLines(
    polygon: Feature<Polygon>,
    spacing_m: number
): Position[][] {
    const bbox = turf.bbox(polygon);
    const [minX, minY, maxX, maxY] = bbox;

    const centerLat = (minY + maxY) / 2;
    const metersPerDegree = 111320 * Math.cos((centerLat * Math.PI) / 180);
    const spacingDeg = spacing_m / metersPerDegree;

    const lines: Position[][] = [];

    for (let y = minY; y <= maxY; y += spacingDeg) {
        const lineStart: Position = [minX - 0.001, y];
        const lineEnd: Position = [maxX + 0.001, y];
        const scanLine = turf.lineString([lineStart, lineEnd]);

        try {
            const clipped = turf.lineIntersect(
                turf.polygonToLine(polygon) as Feature<LineString>,
                scanLine
            );

            if (clipped.features.length >= 2) {
                const points = clipped.features
                    .map((f) => f.geometry.coordinates as Position)
                    .sort((a, b) => a[0] - b[0]);

                for (let i = 0; i < points.length - 1; i += 2) {
                    if (points[i + 1]) {
                        lines.push([points[i], points[i + 1]]);
                    }
                }
            }
        } catch {
            // Skip lines that don't intersect properly
        }
    }

    return lines;
}

/**
 * Apply snake pattern to connect scan lines
 */
function applySnakePattern(lines: Position[][]): Position[] {
    const waypoints: Position[] = [];

    lines.forEach((line, index) => {
        if (index % 2 === 1) {
            waypoints.push(...line.reverse());
        } else {
            waypoints.push(...line);
        }
    });

    return waypoints;
}

/**
 * Rotate coordinates back to original orientation
 */
function rotateCoordinates(
    coords: Position[],
    angle: number,
    pivot: Position
): Position[] {
    return coords.map((coord) => {
        const point = turf.point(coord);
        const rotated = turf.transformRotate(point, angle, { pivot });
        return rotated.geometry.coordinates as Position;
    });
}

/**
 * Generate perimeter-only path (follows polygon edges)
 */
function generatePerimeterPath(polygonCoords: Position[]): Position[] {
    // Just return the polygon coordinates as the flight path
    return [...polygonCoords, polygonCoords[0]];
}

/**
 * Generate crosshatch pattern (two perpendicular snake passes)
 */
function generateCrosshatchPath(
    polygon: Feature<Polygon>,
    spacing_m: number,
    pivotCoord: Position
): Position[] {
    // First pass - normal orientation
    const bearing = findPrincipalAxisBearing(polygon);
    const rotatedPolygon1 = rotatePolygon(polygon, -bearing);
    const scanLines1 = generateScanLines(rotatedPolygon1, spacing_m);
    const snakePattern1 = applySnakePattern(scanLines1);
    const waypoints1 = rotateCoordinates(snakePattern1, bearing, pivotCoord);

    // Second pass - perpendicular (90 degrees rotated)
    const rotatedPolygon2 = rotatePolygon(polygon, -bearing + 90);
    const scanLines2 = generateScanLines(rotatedPolygon2, spacing_m);
    const snakePattern2 = applySnakePattern(scanLines2);
    const waypoints2 = rotateCoordinates(snakePattern2, bearing - 90, pivotCoord);

    // Combine both passes
    return [...waypoints1, ...waypoints2];
}

/**
 * Estimate number of photos based on distance and capture frequency
 */
function estimatePhotoCount(
    distance_km: number,
    speed_kmh: number = 40,
    captureFrequency: number = 2
): number {
    const duration_hours = distance_km / speed_kmh;
    const duration_seconds = duration_hours * 3600;
    return Math.ceil(duration_seconds * captureFrequency);
}

// ============ MAIN EXPORT ============

/**
 * Generate a complete flight path for surveying a polygon area
 */
export function generateFlightPath(
    polygonCoords: Position[],
    config: FlightPathConfig
): FlightPathResult {
    const polygon = turf.polygon([[...polygonCoords, polygonCoords[0]]]);
    const centroid = turf.centroid(polygon);
    const pivotCoord = centroid.geometry.coordinates;
    const area_sq_km = turf.area(polygon) / 1_000_000;

    const pattern = config.pattern || 'SNAKE';
    const spacing = calculateGridSpacing(
        config.altitude_m,
        config.overlap_percent,
        config.camera_fov_deg || DEFAULT_FOV_DEG
    );

    let waypoints: Position[];

    switch (pattern) {
        case 'PERIMETER':
            waypoints = generatePerimeterPath(polygonCoords);
            break;

        case 'CROSSHATCH':
            waypoints = generateCrosshatchPath(polygon, spacing, pivotCoord);
            break;

        case 'SPIRAL':
            // For now, fall back to snake (spiral requires more complex implementation)
            // Could implement later with concentric offset polygons
            waypoints = generateSnakePath(polygon, spacing, pivotCoord);
            break;

        case 'SNAKE':
        default:
            waypoints = generateSnakePath(polygon, spacing, pivotCoord);
            break;
    }

    if (waypoints.length < 2) {
        // Fallback to perimeter
        waypoints = generatePerimeterPath(polygonCoords);
    }

    const flightPath = turf.lineString(waypoints);
    const totalDistance_km = turf.length(flightPath, { units: 'kilometers' });
    const estimatedSpeed_kmh = config.speed_kmh || 30;
    const estimatedDuration_min = (totalDistance_km / estimatedSpeed_kmh) * 60;
    const estimatedPhotos = estimatePhotoCount(totalDistance_km, estimatedSpeed_kmh, 2);

    return {
        flightPath,
        waypoints,
        totalDistance_km,
        estimatedDuration_min: Math.ceil(estimatedDuration_min),
        numWaypoints: waypoints.length,
        gridSpacing_m: spacing,
        estimatedPhotos,
        area_sq_km: Math.round(area_sq_km * 1000) / 1000,
    };
}

/**
 * Generate snake pattern path
 */
function generateSnakePath(
    polygon: Feature<Polygon>,
    spacing_m: number,
    pivotCoord: Position
): Position[] {
    const principalBearing = findPrincipalAxisBearing(polygon);
    const rotationAngle = -principalBearing;
    const rotatedPolygon = rotatePolygon(polygon, rotationAngle);
    const scanLines = generateScanLines(rotatedPolygon, spacing_m);

    if (scanLines.length === 0) {
        return [];
    }

    const rotatedWaypoints = applySnakePattern(scanLines);
    return rotateCoordinates(rotatedWaypoints, -rotationAngle, pivotCoord);
}

/**
 * Estimate battery consumption for a path
 */
export function estimateBatteryConsumption(distance_km: number): number {
    return Math.ceil(distance_km * 2);
}

/**
 * Check if drone has sufficient range for path
 */
export function checkRangeValidity(
    distance_km: number,
    maxRange_km: number
): boolean {
    return distance_km <= maxRange_km;
}

/**
 * Get pattern display name
 */
export function getPatternDisplayName(pattern: SurveyPattern): string {
    const names: Record<SurveyPattern, string> = {
        SNAKE: 'Snake (Lawnmower)',
        CROSSHATCH: 'Crosshatch (Grid)',
        PERIMETER: 'Perimeter Only',
        SPIRAL: 'Spiral Inward',
    };
    return names[pattern] || pattern;
}
