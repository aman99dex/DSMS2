/**
 * lerp.ts
 * 
 * Linear interpolation utilities for smooth animation
 */

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

/**
 * Linear interpolation for coordinates [lng, lat]
 */
export function lerpCoord(
    start: [number, number],
    end: [number, number],
    t: number
): [number, number] {
    return [
        lerp(start[0], end[0], t),
        lerp(start[1], end[1], t),
    ];
}

/**
 * Smooth step easing function
 */
export function smoothstep(t: number): number {
    return t * t * (3 - 2 * t);
}

/**
 * Calculate bearing between two points (in degrees)
 */
export function calculateBearing(
    start: [number, number],
    end: [number, number]
): number {
    const startLat = (start[1] * Math.PI) / 180;
    const endLat = (end[1] * Math.PI) / 180;
    const startLng = (start[0] * Math.PI) / 180;
    const endLng = (end[0] * Math.PI) / 180;

    const dLng = endLng - startLng;

    const x = Math.sin(dLng) * Math.cos(endLat);
    const y =
        Math.cos(startLat) * Math.sin(endLat) -
        Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

    const bearing = Math.atan2(x, y) * (180 / Math.PI);
    return (bearing + 360) % 360;
}

/**
 * Calculate distance between two points (in km)
 */
export function calculateDistance(
    start: [number, number],
    end: [number, number]
): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((end[1] - start[1]) * Math.PI) / 180;
    const dLng = ((end[0] - start[0]) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((start[1] * Math.PI) / 180) *
        Math.cos((end[1] * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
