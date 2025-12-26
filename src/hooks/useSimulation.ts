/**
 * useSimulation.ts
 * 
 * Animation hook for simulating drone flight along waypoints
 */

import { useCallback, useEffect, useRef } from 'react';
import type { Position } from 'geojson';
import { lerpCoord, calculateBearing, calculateDistance } from '@/lib/lerp';
import { useSimulationStore, useDroneStore, useMissionStore } from '@/store';

const ANIMATION_SPEED = 0.00015; // Base movement speed in coordinate units per frame
const BATTERY_DRAIN_PER_KM = 2; // 2% per km

interface UseSimulationReturn {
    startMission: () => void;
    startSimulation: () => void;
    pauseSimulation: () => void;
    resumeSimulation: () => void;
    stopSimulation: () => void;
    abortMission: () => void;
    togglePause: () => void;
    setSpeed: (speed: number) => void;
    returnToHome: () => void;
    skipWaypoint: () => void;
    isRunning: boolean;
    isPaused: boolean;
    progress: number;
    elapsedTime: number;
}

export function useSimulation(): UseSimulationReturn {
    const animationFrameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const segmentProgressRef = useRef<number>(0);
    const totalDistanceRef = useRef<number>(0);
    const traveledDistanceRef = useRef<number>(0);

    const {
        simulation,
        startSimulation: startStore,
        pauseSimulation: pauseStore,
        resumeSimulation: resumeStore,
        stopSimulation: stopStore,
        setSpeed: setSpeedStore,
        updateSimulationState,
    } = useSimulationStore();

    const { generatedPath } = useMissionStore();
    const { selectedDroneId, updateDrone, getDroneById } = useDroneStore();

    /**
     * Animation loop using requestAnimationFrame
     */
    const animate = useCallback(
        (timestamp: number) => {
            if (!generatedPath || generatedPath.length < 2) return;

            const deltaTime = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;

            // Get current simulation state
            const { currentWaypointIndex, speed, dronePosition, trailCoordinates } = simulation;

            if (currentWaypointIndex >= generatedPath.length - 1) {
                // Mission complete
                stopStore();
                if (selectedDroneId) {
                    updateDrone(selectedDroneId, { status: 'IDLE', current_mission_id: null });
                }
                return;
            }

            const currentWaypoint = generatedPath[currentWaypointIndex] as [number, number];
            const nextWaypoint = generatedPath[currentWaypointIndex + 1] as [number, number];

            // Calculate movement
            const movementPerFrame = ANIMATION_SPEED * speed * (deltaTime / 16.67); // Normalize to 60fps
            segmentProgressRef.current += movementPerFrame;

            // Calculate new position using LERP
            const t = Math.min(segmentProgressRef.current, 1);
            const newPosition = lerpCoord(currentWaypoint, nextWaypoint, t);

            // Calculate bearing for drone rotation
            const bearing = calculateBearing(currentWaypoint, nextWaypoint);

            // Update trail
            const newTrail = [...trailCoordinates, newPosition];

            // Calculate overall progress
            const segmentDistance = calculateDistance(currentWaypoint, nextWaypoint);
            traveledDistanceRef.current += segmentDistance * movementPerFrame;
            const overallProgress = Math.min(
                (traveledDistanceRef.current / totalDistanceRef.current) * 100,
                100
            );

            // Update drone battery based on distance
            if (selectedDroneId) {
                const batteryDrain = (segmentDistance * movementPerFrame) * BATTERY_DRAIN_PER_KM;
                updateDrone(selectedDroneId, {
                    position: { lat: newPosition[1], lng: newPosition[0] },
                });
            }

            // Update simulation state
            if (t >= 1) {
                // Move to next waypoint
                segmentProgressRef.current = 0;
                updateSimulationState({
                    currentWaypointIndex: currentWaypointIndex + 1,
                    dronePosition: nextWaypoint,
                    droneBearing: bearing,
                    trailCoordinates: newTrail,
                    progress: overallProgress,
                    elapsedTime: simulation.elapsedTime + deltaTime / 1000,
                });
            } else {
                updateSimulationState({
                    dronePosition: newPosition,
                    droneBearing: bearing,
                    trailCoordinates: newTrail,
                    progress: overallProgress,
                    elapsedTime: simulation.elapsedTime + deltaTime / 1000,
                });
            }

            // Continue animation
            animationFrameRef.current = requestAnimationFrame(animate);
        },
        [simulation, generatedPath, selectedDroneId, updateDrone, updateSimulationState, stopStore]
    );

    /**
     * Start simulation
     */
    const startSimulation = useCallback(() => {
        if (!generatedPath || generatedPath.length < 2) return;

        // Calculate total path distance
        let totalDist = 0;
        for (let i = 0; i < generatedPath.length - 1; i++) {
            totalDist += calculateDistance(
                generatedPath[i] as [number, number],
                generatedPath[i + 1] as [number, number]
            );
        }
        totalDistanceRef.current = totalDist;
        traveledDistanceRef.current = 0;
        segmentProgressRef.current = 0;

        // Update drone status
        if (selectedDroneId) {
            updateDrone(selectedDroneId, { status: 'FLYING' });
        }

        startStore(generatedPath);
        lastTimeRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [generatedPath, selectedDroneId, updateDrone, startStore, animate]);

    /**
     * Pause simulation
     */
    const pauseSimulation = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        pauseStore();
    }, [pauseStore]);

    /**
     * Resume simulation
     */
    const resumeSimulation = useCallback(() => {
        resumeStore();
        lastTimeRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [resumeStore, animate]);

    /**
     * Stop simulation
     */
    const stopSimulation = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (selectedDroneId) {
            updateDrone(selectedDroneId, { status: 'IDLE', current_mission_id: null });
        }

        stopStore();
    }, [selectedDroneId, updateDrone, stopStore]);

    /**
     * Abort mission (alias for stopSimulation)
     */
    const abortMission = useCallback(() => {
        stopSimulation();
    }, [stopSimulation]);

    /**
     * Return to Home - stop mission and return drone to start
     */
    const returnToHome = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Set drone status to RETURNING
        if (selectedDroneId) {
            updateDrone(selectedDroneId, { status: 'RETURNING', current_mission_id: null });
            // After a brief delay, set to IDLE (simulating RTH completion)
            setTimeout(() => {
                updateDrone(selectedDroneId, { status: 'IDLE' });
            }, 2000);
        }

        stopStore();
    }, [selectedDroneId, updateDrone, stopStore]);

    /**
     * Skip to next waypoint
     */
    const skipWaypoint = useCallback(() => {
        if (!generatedPath || simulation.currentWaypointIndex >= generatedPath.length - 2) {
            return;
        }

        segmentProgressRef.current = 0;
        const nextIndex = simulation.currentWaypointIndex + 1;
        const nextWaypoint = generatedPath[nextIndex] as [number, number];

        updateSimulationState({
            currentWaypointIndex: nextIndex,
            dronePosition: nextWaypoint,
        });
    }, [generatedPath, simulation.currentWaypointIndex, updateSimulationState]);

    /**
     * Toggle pause/resume
     */
    const togglePause = useCallback(() => {
        if (simulation.isPaused) {
            resumeSimulation();
        } else {
            pauseSimulation();
        }
    }, [simulation.isPaused, pauseSimulation, resumeSimulation]);

    /**
     * Set simulation speed
     */
    const setSpeed = useCallback(
        (speed: number) => {
            setSpeedStore(speed);
        },
        [setSpeedStore]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Resume animation if running and not paused
    useEffect(() => {
        if (simulation.isRunning && !simulation.isPaused && !animationFrameRef.current) {
            lastTimeRef.current = performance.now();
            animationFrameRef.current = requestAnimationFrame(animate);
        }
    }, [simulation.isRunning, simulation.isPaused, animate]);

    return {
        startMission: startSimulation,
        startSimulation,
        pauseSimulation,
        resumeSimulation,
        stopSimulation,
        abortMission,
        togglePause,
        setSpeed,
        returnToHome,
        skipWaypoint,
        isRunning: simulation.isRunning,
        isPaused: simulation.isPaused,
        progress: simulation.progress,
        elapsedTime: simulation.elapsedTime,
    };
}

