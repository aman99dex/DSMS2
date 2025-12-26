/**
 * useFlightPlanner.ts
 * 
 * Hook for handling polygon drawing events and generating flight paths
 */

import { useCallback, useEffect, useRef } from 'react';
import type { Position } from 'geojson';
import { generateFlightPath, type FlightPathResult } from '@/lib/FlightPathGenerator';
import { validatePath, mockNoFlyZones } from '@/lib/PathValidator';
import { useMissionStore, useDroneStore, useUIStore } from '@/store';

interface UseFlightPlannerReturn {
    handlePolygonDrawn: (coordinates: Position[]) => void;
    generatePath: () => FlightPathResult | null;
    regeneratePath: () => FlightPathResult | null;
    validateCurrentPath: () => ReturnType<typeof validatePath> | null;
    clearPath: () => void;
    pathResult: FlightPathResult | null;
}

export function useFlightPlanner(): UseFlightPlannerReturn {
    const pathResultRef = useRef<FlightPathResult | null>(null);

    const {
        drawnPolygon,
        generatedPath,
        missionConfig,
        setDrawnPolygon,
        setGeneratedPath,
    } = useMissionStore();

    const { selectedDroneId, getDroneById } = useDroneStore();
    const { showAlert, setDrawingMode } = useUIStore();

    /**
     * Handle when a polygon is drawn on the map
     */
    const handlePolygonDrawn = useCallback(
        (coordinates: Position[]) => {
            setDrawnPolygon(coordinates);
            setDrawingMode(false);

            // Auto-generate path when polygon is drawn
            const result = generateFlightPath(coordinates, {
                altitude_m: missionConfig.altitude_m,
                overlap_percent: missionConfig.overlap_percent,
                camera_fov_deg: missionConfig.camera_fov_deg,
                pattern: missionConfig.pattern,
            });

            if (result.waypoints.length > 0) {
                setGeneratedPath(result.waypoints);
                pathResultRef.current = result;
            }
        },
        [missionConfig, setDrawnPolygon, setGeneratedPath, setDrawingMode]
    );

    /**
     * Generate flight path from current polygon and config
     */
    const generatePath = useCallback((): FlightPathResult | null => {
        if (!drawnPolygon || drawnPolygon.length < 3) {
            showAlert('CRITICAL: No survey area defined. Draw a polygon first.');
            return null;
        }

        const result = generateFlightPath(drawnPolygon, {
            altitude_m: missionConfig.altitude_m,
            overlap_percent: missionConfig.overlap_percent,
            camera_fov_deg: missionConfig.camera_fov_deg,
            pattern: missionConfig.pattern,
        });

        if (result.waypoints.length > 0) {
            setGeneratedPath(result.waypoints);
            pathResultRef.current = result;
            return result;
        }

        showAlert('CRITICAL: Failed to generate flight path. Try a different area.');
        return null;
    }, [drawnPolygon, missionConfig, setGeneratedPath, showAlert]);

    /**
     * Regenerate path with current config (called when config changes)
     */
    const regeneratePath = useCallback((): FlightPathResult | null => {
        if (!drawnPolygon || drawnPolygon.length < 3) {
            return null;
        }

        const result = generateFlightPath(drawnPolygon, {
            altitude_m: missionConfig.altitude_m,
            overlap_percent: missionConfig.overlap_percent,
            camera_fov_deg: missionConfig.camera_fov_deg,
            pattern: missionConfig.pattern,
        });

        if (result.waypoints.length > 0) {
            setGeneratedPath(result.waypoints);
            pathResultRef.current = result;
            return result;
        }

        return null;
    }, [drawnPolygon, missionConfig, setGeneratedPath]);

    /**
     * Validate current path against NFZ and drone capabilities
     */
    const validateCurrentPath = useCallback(() => {
        const result = pathResultRef.current;
        if (!result) return null;

        const drone = selectedDroneId ? getDroneById(selectedDroneId) : null;

        const validation = validatePath(
            result.flightPath,
            result.totalDistance_km,
            drone || null,
            mockNoFlyZones
        );

        if (!validation.valid) {
            const errorMessages = validation.errors.map((e) => e.message).join('\n');
            showAlert(`CRITICAL ERRORS:\n${errorMessages}`);
        }

        return validation;
    }, [selectedDroneId, getDroneById, showAlert]);

    /**
     * Clear all path data
     */
    const clearPath = useCallback(() => {
        setDrawnPolygon(null);
        setGeneratedPath(null);
        pathResultRef.current = null;
    }, [setDrawnPolygon, setGeneratedPath]);

    // Re-generate path when config changes
    useEffect(() => {
        if (drawnPolygon && drawnPolygon.length >= 3) {
            const result = generateFlightPath(drawnPolygon, {
                altitude_m: missionConfig.altitude_m,
                overlap_percent: missionConfig.overlap_percent,
                camera_fov_deg: missionConfig.camera_fov_deg,
                pattern: missionConfig.pattern,
            });

            if (result.waypoints.length > 0) {
                setGeneratedPath(result.waypoints);
                pathResultRef.current = result;
            }
        }
    }, [missionConfig.altitude_m, missionConfig.overlap_percent, missionConfig.pattern, drawnPolygon, setGeneratedPath]);

    return {
        handlePolygonDrawn,
        generatePath,
        regeneratePath,
        validateCurrentPath,
        clearPath,
        pathResult: pathResultRef.current,
    };
}
