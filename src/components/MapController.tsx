/**
 * MapController.tsx
 * 
 * Full-screen MapLibre canvas with globe-like projection, terrain,
 * and custom polygon drawing controls.
 * 
 * Using MapLibre GL JS (open-source, no API key required!)
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import type { Position } from 'geojson';
import { useMissionStore, useSimulationStore, useUIStore } from '@/store';
import { getNFZFeatures } from '@/lib/PathValidator';
import { Hexagon, Trash2 } from 'lucide-react';

import 'maplibre-gl/dist/maplibre-gl.css';

// Free tile providers (no API key needed)
const MAPTILER_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

interface MapControllerProps {
    onPolygonDrawn: (coordinates: Position[]) => void;
}

export default function MapController({ onPolygonDrawn }: MapControllerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const droneMarkerRef = useRef<maplibregl.Marker | null>(null);

    const [isLoaded, setIsLoaded] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingPoints, setDrawingPoints] = useState<Position[]>([]);

    const { generatedPath, drawnPolygon, setDrawnPolygon } = useMissionStore();
    const { simulation } = useSimulationStore();
    const { isDrawingMode, setDrawingMode } = useUIStore();

    /**
     * Initialize MapLibre map
     */
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: MAPTILER_STYLE,
            center: [-122.4194, 37.7749], // San Francisco
            zoom: 14,
            pitch: 45,
            bearing: -20,
        });

        // Add navigation controls
        map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

        // Initialize map
        map.on('load', () => {
            // Add No-Fly Zone source and layer
            map.addSource('nfz-zones', {
                type: 'geojson',
                data: getNFZFeatures(),
            });

            map.addLayer({
                id: 'nfz-fill',
                type: 'fill',
                source: 'nfz-zones',
                paint: {
                    'fill-color': '#FF003C',
                    'fill-opacity': 0.2,
                },
            });

            map.addLayer({
                id: 'nfz-outline',
                type: 'line',
                source: 'nfz-zones',
                paint: {
                    'line-color': '#FF003C',
                    'line-width': 2,
                    'line-dasharray': [2, 2],
                },
            });

            // Add flight path source and layer
            map.addSource('flight-path', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
            });

            map.addLayer({
                id: 'flight-path-line',
                type: 'line',
                source: 'flight-path',
                paint: {
                    'line-color': '#00F0FF',
                    'line-width': 2,
                    'line-opacity': 0.8,
                },
            });

            // Add waypoints source and layer
            map.addSource('waypoints', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
            });

            map.addLayer({
                id: 'waypoints-circle',
                type: 'circle',
                source: 'waypoints',
                paint: {
                    'circle-radius': 4,
                    'circle-color': '#00F0FF',
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 1,
                },
            });

            // Add drone trail source and layer
            map.addSource('drone-trail', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
            });

            map.addLayer({
                id: 'drone-trail-line',
                type: 'line',
                source: 'drone-trail',
                paint: {
                    'line-color': '#00F0FF',
                    'line-width': 4,
                    'line-opacity': 0.6,
                    'line-blur': 2,
                },
            });

            // Add survey polygon source and layer
            map.addSource('survey-polygon', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
            });

            map.addLayer({
                id: 'survey-polygon-fill',
                type: 'fill',
                source: 'survey-polygon',
                paint: {
                    'fill-color': '#00FF6A',
                    'fill-opacity': 0.1,
                },
            });

            map.addLayer({
                id: 'survey-polygon-outline',
                type: 'line',
                source: 'survey-polygon',
                paint: {
                    'line-color': '#00FF6A',
                    'line-width': 2,
                },
            });

            // Add drawing preview source and layer
            map.addSource('drawing-preview', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
            });

            map.addLayer({
                id: 'drawing-preview-line',
                type: 'line',
                source: 'drawing-preview',
                paint: {
                    'line-color': '#00F0FF',
                    'line-width': 2,
                    'line-dasharray': [4, 2],
                },
            });

            map.addLayer({
                id: 'drawing-preview-points',
                type: 'circle',
                source: 'drawing-preview',
                filter: ['==', '$type', 'Point'],
                paint: {
                    'circle-radius': 6,
                    'circle-color': '#00F0FF',
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 2,
                },
            });

            setIsLoaded(true);
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    /**
     * Handle map click for polygon drawing
     */
    const handleMapClick = useCallback((e: maplibregl.MapMouseEvent) => {
        if (!isDrawingMode || !mapRef.current) return;

        const coords: Position = [e.lngLat.lng, e.lngLat.lat];

        setDrawingPoints(prev => {
            const newPoints = [...prev, coords];

            // Update drawing preview
            const source = mapRef.current?.getSource('drawing-preview') as maplibregl.GeoJSONSource;
            if (source) {
                const features: GeoJSON.Feature[] = [
                    // Points
                    ...newPoints.map(p => ({
                        type: 'Feature' as const,
                        properties: {},
                        geometry: { type: 'Point' as const, coordinates: p }
                    })),
                    // Line connecting points
                    ...(newPoints.length > 1 ? [{
                        type: 'Feature' as const,
                        properties: {},
                        geometry: { type: 'LineString' as const, coordinates: newPoints }
                    }] : [])
                ];
                source.setData({ type: 'FeatureCollection', features });
            }

            return newPoints;
        });
    }, [isDrawingMode]);

    /**
     * Complete polygon drawing
     */
    const completeDrawing = useCallback(() => {
        if (drawingPoints.length < 3) return;

        onPolygonDrawn(drawingPoints);
        setDrawingPoints([]);
        setDrawingMode(false);

        // Clear preview
        const source = mapRef.current?.getSource('drawing-preview') as maplibregl.GeoJSONSource;
        if (source) {
            source.setData({ type: 'FeatureCollection', features: [] });
        }
    }, [drawingPoints, onPolygonDrawn, setDrawingMode]);

    /**
     * Cancel drawing
     */
    const cancelDrawing = useCallback(() => {
        setDrawingPoints([]);
        setDrawingMode(false);

        // Clear preview
        const source = mapRef.current?.getSource('drawing-preview') as maplibregl.GeoJSONSource;
        if (source) {
            source.setData({ type: 'FeatureCollection', features: [] });
        }
    }, [setDrawingMode]);

    /**
     * Attach/detach click handler based on drawing mode
     */
    useEffect(() => {
        if (!mapRef.current || !isLoaded) return;

        const map = mapRef.current;

        if (isDrawingMode) {
            map.getCanvas().style.cursor = 'crosshair';
            map.on('click', handleMapClick);
        } else {
            map.getCanvas().style.cursor = '';
            map.off('click', handleMapClick);
        }

        return () => {
            map.off('click', handleMapClick);
        };
    }, [isDrawingMode, isLoaded, handleMapClick]);

    /**
     * Update flight path visualization
     */
    useEffect(() => {
        if (!mapRef.current || !isLoaded) return;

        const map = mapRef.current;

        if (generatedPath && generatedPath.length > 0) {
            // Update flight path
            const pathSource = map.getSource('flight-path') as maplibregl.GeoJSONSource;
            if (pathSource) {
                pathSource.setData({
                    type: 'Feature',
                    properties: {},
                    geometry: { type: 'LineString', coordinates: generatedPath },
                });
            }

            // Update waypoints (every nth point)
            const waypointSource = map.getSource('waypoints') as maplibregl.GeoJSONSource;
            if (waypointSource) {
                const step = Math.max(1, Math.floor(generatedPath.length / 30));
                const waypointFeatures = generatedPath
                    .filter((_, i) => i % step === 0 || i === 0 || i === generatedPath.length - 1)
                    .map((coord) => ({
                        type: 'Feature' as const,
                        properties: {},
                        geometry: { type: 'Point' as const, coordinates: coord },
                    }));

                waypointSource.setData({ type: 'FeatureCollection', features: waypointFeatures });
            }
        }
    }, [generatedPath, isLoaded]);

    /**
     * Update survey polygon visualization
     */
    useEffect(() => {
        if (!mapRef.current || !isLoaded) return;

        const map = mapRef.current;
        const source = map.getSource('survey-polygon') as maplibregl.GeoJSONSource;

        if (source && drawnPolygon && drawnPolygon.length >= 3) {
            source.setData({
                type: 'Feature',
                properties: {},
                geometry: { type: 'Polygon', coordinates: [[...drawnPolygon, drawnPolygon[0]]] },
            });
        } else if (source) {
            source.setData({ type: 'FeatureCollection', features: [] });
        }
    }, [drawnPolygon, isLoaded]);

    /**
     * Update drone marker during simulation
     */
    useEffect(() => {
        if (!mapRef.current || !isLoaded) return;

        const map = mapRef.current;

        if (simulation.isRunning) {
            const { dronePosition, droneBearing, trailCoordinates } = simulation;

            // Create or update drone marker
            if (!droneMarkerRef.current) {
                const el = document.createElement('div');
                el.className = 'drone-marker-icon';
                el.innerHTML = `
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#00F0FF" fill-opacity="0.2"/>
            <circle cx="20" cy="20" r="12" fill="#00F0FF" fill-opacity="0.4"/>
            <circle cx="20" cy="20" r="6" fill="#00F0FF"/>
            <path d="M20 8L20 4M20 36L20 32M8 20L4 20M36 20L32 20" stroke="#00F0FF" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `;
                el.style.filter = 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.6))';

                droneMarkerRef.current = new maplibregl.Marker({ element: el, rotationAlignment: 'map' })
                    .setLngLat(dronePosition)
                    .addTo(map);
            } else {
                droneMarkerRef.current.setLngLat(dronePosition);
                droneMarkerRef.current.setRotation(droneBearing);
            }

            // Update trail
            const trailSource = map.getSource('drone-trail') as maplibregl.GeoJSONSource;
            if (trailSource && trailCoordinates.length > 1) {
                trailSource.setData({
                    type: 'Feature',
                    properties: {},
                    geometry: { type: 'LineString', coordinates: trailCoordinates },
                });
            }
        } else {
            // Remove drone marker when not simulating
            if (droneMarkerRef.current) {
                droneMarkerRef.current.remove();
                droneMarkerRef.current = null;
            }

            // Clear trail
            const trailSource = mapRef.current?.getSource('drone-trail') as maplibregl.GeoJSONSource;
            if (trailSource) {
                trailSource.setData({ type: 'FeatureCollection', features: [] });
            }
        }
    }, [simulation, isLoaded]);

    return (
        <div className="relative w-full h-full">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Loading overlay */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#050A0E]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin" />
                        <span className="text-[#8892A0] font-mono text-sm">INITIALIZING MAP...</span>
                    </div>
                </div>
            )}

            {/* Map overlay - Status indicator */}
            <div className="absolute top-4 right-4 glass-panel rounded-lg px-4 py-2 z-10">
                <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-[#00FF6A] animate-pulse" />
                    <span className="text-[#8892A0] font-mono">LIVE</span>
                    <span className="text-[#00F0FF] font-mono">37.7749°N 122.4194°W</span>
                </div>
            </div>

            {/* Drawing mode controls */}
            {isDrawingMode && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 glass-panel glow-cyan rounded-lg px-6 py-3 z-10">
                    <div className="flex items-center gap-4">
                        <span className="text-[#00F0FF] font-mono text-sm uppercase tracking-wider">
                            ◆ DRAW SURVEY AREA ({drawingPoints.length} points) ◆
                        </span>
                        {drawingPoints.length >= 3 && (
                            <button
                                onClick={completeDrawing}
                                className="hud-button text-xs py-1 px-3 flex items-center gap-1"
                            >
                                <Hexagon className="w-3 h-3" />
                                Complete
                            </button>
                        )}
                        <button
                            onClick={cancelDrawing}
                            className="hud-button danger text-xs py-1 px-3 flex items-center gap-1"
                        >
                            <Trash2 className="w-3 h-3" />
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Simulation progress overlay */}
            {simulation.isRunning && (
                <div className="absolute bottom-4 left-4 glass-panel rounded-lg p-4 z-10 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${simulation.isPaused ? 'bg-[#FCEE09]' : 'bg-[#00F0FF] animate-pulse'}`} />
                        <span className="text-[#8892A0] font-mono text-xs uppercase">
                            {simulation.isPaused ? 'PAUSED' : 'SIMULATING'}
                        </span>
                    </div>
                    <div className="progress-bar mb-2">
                        <div className="progress-bar-fill" style={{ width: `${simulation.progress}%` }} />
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                        <span className="text-[#00F0FF]">{simulation.progress.toFixed(1)}%</span>
                        <span className="text-[#8892A0]">{Math.floor(simulation.elapsedTime)}s</span>
                    </div>
                </div>
            )}
        </div>
    );
}
