import React, { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import type { LocationNode } from '../data/keyinfo';
import { UJJAIN_LOCATIONS, UJJAIN_BACKUP_ROUTES } from '../data/keyinfo';
import { computeSimulationMetrics } from '../data/simulationEngine';

// Premium Dark Theme styling for Google Maps
const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f19" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0b1329" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#0b1329" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#070b13" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#070b13" }],
  },
];

// Custom Overlay implementation to render React-like HTML on Google Maps
let ReactOverlayClass: any = null;

function getReactOverlayClass() {
  if (ReactOverlayClass) return ReactOverlayClass;

  ReactOverlayClass = class extends google.maps.OverlayView {
    private element: HTMLElement;
    private position: google.maps.LatLng;

    constructor(position: google.maps.LatLng, element: HTMLElement) {
      super();
      this.position = position;
      this.element = element;
    }

    onAdd() {
      const pane = this.getPanes()?.overlayMouseTarget;
      if (pane) {
        pane.appendChild(this.element);
      }
    }

    draw() {
      const projection = this.getProjection();
      if (!projection) return;
      const point = projection.fromLatLngToDivPixel(this.position);
      if (point) {
        this.element.style.left = `${point.x}px`;
        this.element.style.top = `${point.y}px`;
        this.element.style.position = 'absolute';
        this.element.style.transform = 'translate(-50%, -50%)';
        this.element.style.cursor = 'pointer';
      }
    }

    onRemove() {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }
  };

  return ReactOverlayClass;
}

// Marker HTML compiler based on node and simulation status
const compileMarkerHTML = (node: LocationNode, isSimulationActive: boolean, isSelected: boolean, nodeStatus?: any) => {
  const isSelectedClass = isSelected ? 'ring-4 ring-cyan-500/75 rounded-full p-0.5 z-50 scale-110' : '';
  
  if (isSimulationActive && nodeStatus) {
    const vfrStr = `VFR: ${nodeStatus.vfr.toFixed(2)}`;
    
    if (nodeStatus.status === 'danger') {
      return `
        <div class="relative flex items-center justify-center group ${isSelectedClass}">
          <div class="radar-ring w-8 h-8 bg-red-500 rounded-full"></div>
          <div class="radar-ring w-14 h-14 bg-red-500 rounded-full" style="animation-delay: 0.5s"></div>
          <div class="relative w-8 h-8 bg-red-600 rounded-full flex items-center justify-center border-2 border-red-200 text-white font-bold text-xs shadow-lg shadow-red-500/80 animate-alarm">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="absolute -bottom-8 bg-red-950/90 border border-red-500 text-red-300 font-bold px-2 py-0.5 rounded text-[9px] whitespace-nowrap shadow-lg tracking-wider uppercase scale-90 z-20">
            CRUSH (${vfrStr})
          </div>
        </div>
      `;
    }
    
    if (nodeStatus.status === 'warning') {
      return `
        <div class="relative flex items-center justify-center group ${isSelectedClass}">
          <div class="radar-ring w-7 h-7 bg-amber-500/30 rounded-full absolute animate-ping duration-1000"></div>
          <div class="relative w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center border-2 border-amber-950 text-amber-950 font-bold text-xs shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="absolute -bottom-8 bg-amber-950/90 border border-amber-500/50 text-amber-400 font-semibold px-2 py-0.5 rounded text-[9px] whitespace-nowrap shadow-md tracking-wide scale-90 z-20">
            HEAVY (${vfrStr})
          </div>
        </div>
      `;
    }
  }

  // Normal nodes or nominal states
  let colorClass = isSelected
    ? "bg-cyan-600 border-cyan-300 text-cyan-50 ring-4 ring-cyan-500/50 scale-110 z-50 shadow-cyan-500/40"
    : "bg-slate-700 border-slate-500 text-slate-300";
  let label = node.name.split(" ")[0];
  let iconSVG = "";

  if (node.type === 'transit') {
    if (!isSelected) colorClass = "bg-blue-600 border-blue-400 text-blue-100 shadow-blue-500/30";
    label = "Ujjain Jnc";
    iconSVG = `
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h16" />
      </svg>
    `;
  } else if (node.type === 'epicenter') {
    if (node.id === 'mahakal_corridor') {
      if (!isSelected) colorClass = "bg-emerald-600 border-emerald-400 text-emerald-100 shadow-emerald-500/30";
      label = "Mahakal Temple";
      iconSVG = `
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      `;
    } else if (node.id === 'ram_ghat') {
      if (!isSelected) colorClass = "bg-sky-600 border-sky-400 text-sky-100 shadow-sky-500/30";
      label = "Ram Ghat";
      iconSVG = `
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2m-4-7a9 9 0 11-18 0z" />
        </svg>
      `;
    } else {
      if (!isSelected) colorClass = "bg-emerald-600 border-emerald-400 text-emerald-100 shadow-emerald-500/30";
      label = "Mangalnath";
      iconSVG = `
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
        </svg>
      `;
    }
  } else if (node.type === 'holding') {
    if (!isSelected) colorClass = "bg-purple-600 border-purple-400 text-purple-100 shadow-purple-500/30";
    label = "Nanakheda Area";
    iconSVG = `
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    `;
  } else if (node.type === 'chokepoint') {
    if (!isSelected) colorClass = "bg-amber-600 border-amber-400 text-amber-100 shadow-amber-500/30";
    label = "Harsiddhi Square";
    iconSVG = `
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    `;
  }

  const subLabel = isSimulationActive && nodeStatus ? `VFR: ${nodeStatus.vfr.toFixed(2)}` : label;

  return `
    <div class="relative flex items-center justify-center group ${isSelectedClass}">
      <div class="w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-lg transition-transform duration-300 group-hover:scale-110 ${colorClass}">
        ${iconSVG}
      </div>
      <div class="absolute -bottom-7 bg-slate-900/90 border border-slate-700 text-slate-300 font-medium px-2 py-0.5 rounded text-[9px] whitespace-nowrap shadow tracking-wide scale-90 opacity-80 group-hover:opacity-100 z-10">
        ${subLabel}
      </div>
    </div>
  `;
};

interface MapProps {
  simulationActive: boolean;
  crowdLoad: number;
  mitigationDiversion: boolean;
  mitigationBypass: boolean;
  selectedNode: LocationNode | null;
  onSelectNode: (node: LocationNode) => void;
}

const MapComponent: React.FC<MapProps> = ({
  simulationActive,
  crowdLoad,
  mitigationDiversion,
  mitigationBypass,
  selectedNode,
  onSelectNode
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [overlays, setOverlays] = useState<any[]>([]);
  const [activePolylines, setActivePolylines] = useState<google.maps.Polyline[]>([]);
  const animationFrameId = useRef<number | null>(null);

  // States to hold actual Google Maps Directions paths
  const [route1Path, setRoute1Path] = useState<google.maps.LatLngLiteral[] | null>(null);
  const [route2Path, setRoute2Path] = useState<google.maps.LatLngLiteral[] | null>(null);

  // Initialize map once
  useEffect(() => {
    if (mapRef.current && !map) {
      const gMap = new google.maps.Map(mapRef.current, {
        center: { lat: 23.1765, lng: 75.7725 },
        zoom: 14,
        styles: darkMapStyle,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
      });
      setMap(gMap);

      // Mount native TrafficLayer instantly
      const trafficLayer = new google.maps.TrafficLayer();
      trafficLayer.setMap(gMap);
    }
  }, [mapRef, map]);

  // Fetch Route 1 (Station to Mahakal) via Google Maps Directions API
  useEffect(() => {
    if (!map) return;

    const directionsService = new google.maps.DirectionsService();
    const origin = { lat: 23.1786, lng: 75.7807 };      // Station
    const destination = { lat: 23.1829, lng: 75.7682 }; // Mahakal

    const waypoints: google.maps.DirectionsWaypoint[] = [];
    if (simulationActive && mitigationDiversion) {
      // Harifatak outer bypass ring waypoints
      waypoints.push({ location: new google.maps.LatLng(23.1695, 75.7780), stopover: false });
      waypoints.push({ location: new google.maps.LatLng(23.1720, 75.7550), stopover: false });
    }

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result && result.routes[0]) {
          const path = result.routes[0].overview_path.map(latLng => ({
            lat: latLng.lat(),
            lng: latLng.lng()
          }));
          setRoute1Path(path);
        } else {
          console.warn("Directions Service for Route 1 failed. Using local fallback.", status);
          if (simulationActive && mitigationDiversion) {
            const backupRoute = UJJAIN_BACKUP_ROUTES.find(r => r.id === 'b1_outer_ring_diversion');
            setRoute1Path(backupRoute ? backupRoute.path_coordinates : []);
          } else {
            const directRoute1Coords = [
              { lat: 23.1786, lng: 75.7807 },
              { lat: 23.1780, lng: 75.7760 },
              { lat: 23.1800, lng: 75.7710 },
              { lat: 23.1829, lng: 75.7682 },
            ];
            setRoute1Path(directRoute1Coords);
          }
        }
      }
    );
  }, [map, simulationActive, mitigationDiversion]);

  // Fetch Route 2 (Mahakal to Ram Ghat) via Google Maps Directions API
  useEffect(() => {
    if (!map) return;

    const directionsService = new google.maps.DirectionsService();
    const origin = { lat: 23.1829, lng: 75.7682 };      // Mahakal
    const destination = { lat: 23.1812, lng: 75.7588 }; // Ram Ghat

    const waypoints: google.maps.DirectionsWaypoint[] = [];
    if (simulationActive && mitigationBypass) {
      // Dani Gate bypass waypoints
      waypoints.push({ location: new google.maps.LatLng(23.1895, 75.7650), stopover: false });
      waypoints.push({ location: new google.maps.LatLng(23.1850, 75.7560), stopover: false });
    }

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result && result.routes[0]) {
          const path = result.routes[0].overview_path.map(latLng => ({
            lat: latLng.lat(),
            lng: latLng.lng()
          }));
          setRoute2Path(path);
        } else {
          console.warn("Directions Service for Route 2 failed. Using local fallback.", status);
          if (simulationActive && mitigationBypass) {
            const backupRoute = UJJAIN_BACKUP_ROUTES.find(r => r.id === 'b2_danigate_pedestrian_bypass');
            setRoute2Path(backupRoute ? backupRoute.path_coordinates : []);
          } else {
            const directRoute2Coords = [
              { lat: 23.1829, lng: 75.7682 },
              { lat: 23.1802, lng: 75.7644 },
              { lat: 23.1812, lng: 75.7588 },
            ];
            setRoute2Path(directRoute2Coords);
          }
        }
      }
    );
  }, [map, simulationActive, mitigationBypass]);

  // Handle markers & overlays recreation on state change
  useEffect(() => {
    if (!map) return;

    // Clear old overlays
    overlays.forEach(overlay => overlay.setMap(null));
    const newOverlays: any[] = [];
    const CustomOverlay = getReactOverlayClass();

    const sim = computeSimulationMetrics(crowdLoad, mitigationDiversion, mitigationBypass);
    const simNodes = sim.nodes;

    UJJAIN_LOCATIONS.forEach(node => {
      const position = new google.maps.LatLng(node.lat, node.lng);
      const div = document.createElement('div');
      div.className = 'custom-map-overlay';
      const isSelected = selectedNode?.id === node.id;
      const nodeStatus = simNodes[node.id];
      div.innerHTML = compileMarkerHTML(node, simulationActive, isSelected, nodeStatus);

      // Node details popup click trigger
      div.addEventListener('click', () => {
        onSelectNode(node);
      });

      const overlay = new CustomOverlay(position, div);
      overlay.setMap(map);
      newOverlays.push(overlay);
    });

    setOverlays(newOverlays);

    return () => {
      newOverlays.forEach(overlay => overlay.setMap(null));
    };
  }, [map, simulationActive, selectedNode, crowdLoad, mitigationDiversion, mitigationBypass]);

  // Handle route polylines drawing and pulsing animation loop
  useEffect(() => {
    if (!map) return;

    // Clear old polylines
    activePolylines.forEach(p => p.setMap(null));

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    const sim = computeSimulationMetrics(crowdLoad, mitigationDiversion, mitigationBypass);
    const simNodes = sim.nodes;

    const polylinesToCreate: { coords: { lat: number; lng: number }[], color: string, speed: number, size: number }[] = [];

    // 1. Direct Route 1 / Diversion Route 1
    if (route1Path && route1Path.length > 0) {
      let r1Color = '#10B981'; // Emerald
      let r1Speed = 0.4;
      let r1Size = 4;

      if (simulationActive) {
        if (mitigationDiversion) {
          r1Color = '#06B6D4'; // Cyan for active diversion route
          r1Speed = 0.6;
          r1Size = 5;
        } else {
          r1Color = crowdLoad >= 120000 ? '#EF4444' : crowdLoad >= 70000 ? '#F59E0B' : '#10B981';
          r1Speed = crowdLoad >= 120000 ? 0.9 : crowdLoad >= 70000 ? 0.6 : 0.4;
        }
      }
      polylinesToCreate.push({ coords: route1Path, color: r1Color, speed: r1Speed, size: r1Size });
    }

    // 2. Direct Route 2 / Bypass Route 2
    if (route2Path && route2Path.length > 0) {
      let r2Color = '#10B981';
      let r2Speed = 0.4;
      let r2Size = 4;

      if (simulationActive) {
        if (mitigationBypass) {
          r2Color = '#8B5CF6'; // Purple for active catwalk bypass route
          r2Speed = 0.5;
          r2Size = 5;
        } else {
          const harsiddhiStatus = simNodes.harsiddhi_mandir.status;
          r2Color = harsiddhiStatus === 'danger' ? '#EF4444' : harsiddhiStatus === 'warning' ? '#F59E0B' : '#10B981';
          r2Speed = harsiddhiStatus === 'danger' ? 0.8 : harsiddhiStatus === 'warning' ? 0.6 : 0.4;
        }
      }
      polylinesToCreate.push({ coords: route2Path, color: r2Color, speed: r2Speed, size: r2Size });
    }

    // Instantiating polylines
    const createdPolylines = polylinesToCreate.map(item => {
      const lineSymbol = {
        path: 'M 0,-1.5 0,1.5',
        strokeOpacity: 1,
        scale: item.size - 1.5,
        strokeColor: item.color,
        strokeWeight: item.size
      };

      const poly = new google.maps.Polyline({
        path: item.coords,
        strokeColor: item.color,
        strokeOpacity: 0.2,
        strokeWeight: item.size + 1.5,
        icons: [{
          icon: lineSymbol,
          offset: '0%',
          repeat: '18px'
        }],
        map: map,
      });

      return { poly, speed: item.speed, lineSymbol };
    });

    // Animate all lines
    let count = 0;
    const animateFlow = () => {
      count = (count + 0.6) % 18;
      createdPolylines.forEach(item => {
        const offsetVal = (count * (item.speed / 0.6)) % 18;
        item.poly.set('icons', [{
          icon: item.lineSymbol,
          offset: offsetVal + 'px',
          repeat: '18px'
        }]);
      });
      animationFrameId.current = requestAnimationFrame(animateFlow);
    };
    animateFlow();

    const polysOnly = createdPolylines.map(item => item.poly);
    setActivePolylines(polysOnly);

    return () => {
      polysOnly.forEach(p => p.setMap(null));
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [map, simulationActive, crowdLoad, mitigationDiversion, mitigationBypass, route1Path, route2Path]);

  return <div ref={mapRef} className="w-full h-full" />;
};

interface MapCanvasProps {
  simulationActive: boolean;
  crowdLoad: number;
  mitigationDiversion: boolean;
  mitigationBypass: boolean;
  selectedNode: LocationNode | null;
  onSelectNode: (node: LocationNode) => void;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  simulationActive,
  crowdLoad,
  mitigationDiversion,
  mitigationBypass,
  selectedNode,
  onSelectNode
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  
  if (!apiKey) {
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-400 p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-red-500 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-semibold text-slate-200">Google Maps API Key Missing</h3>
        <p className="text-sm mt-1 text-center max-w-sm">Please make sure VITE_GOOGLE_MAPS_API_KEY is defined in your .env configuration file.</p>
      </div>
    );
  }

  return (
    <Wrapper apiKey={apiKey} version="weekly" libraries={["geometry"]}>
      <MapComponent
        simulationActive={simulationActive}
        crowdLoad={crowdLoad}
        mitigationDiversion={mitigationDiversion}
        mitigationBypass={mitigationBypass}
        selectedNode={selectedNode}
        onSelectNode={onSelectNode}
      />
    </Wrapper>
  );
};
