export interface LocationNode {
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: 'transit' | 'epicenter' | 'holding' | 'chokepoint';
    max_capacity_pedestrians: number;
    max_capacity_vehicles: number;
    on_ground_risk_factor: string; // Explains why this creates a fuss
}

export interface RouteSegment {
    id: string;
    name: string;
    origin_node_id: string;
    destination_node_id: string;
    distance_km: number;
    free_flow_time_mins: number;
    is_chokepoint: boolean;
    backup_route_id: string | null;
    historical_traffic_multiplier: number; // Calibrated from Ujjain historical data
}

export interface BackupRoute {
    id: string;
    name: string;
    path_coordinates: { lat: number; lng: number }[];
    strategic_advantage: string; // Why it takes less time in a traffic-tight situation
}

export const UJJAIN_LOCATIONS: LocationNode[] = [
    {
        id: "ujjain_jnc",
        name: "Ujjain Junction Railway Station",
        lat: 23.1786,
        lng: 75.7807,
        type: "transit",
        max_capacity_pedestrians: 120000,
        max_capacity_vehicles: 5000,
        on_ground_risk_factor: "Primary entry point. Unloads multi-thousand passenger waves simultaneously causing immediate street congestion."
    },
    {
        id: "mahakal_corridor",
        name: "Mahakaleshwar Temple Corridor Complex",
        lat: 23.1829,
        lng: 75.7682,
        type: "epicenter",
        max_capacity_pedestrians: 250000,
        max_capacity_vehicles: 0, // Strictly pedestrianized during peaks
        on_ground_risk_factor: "Massive terminal destination. Geographically disconnected from the riverfront, causing dead-end crowd packing."
    },
    {
        id: "harsiddhi_mandir",
        name: "Harsiddhi Mata Temple Square",
        lat: 23.1802,
        lng: 75.7644,
        type: "chokepoint",
        max_capacity_pedestrians: 30000,
        max_capacity_vehicles: 200,
        on_ground_risk_factor: "CRITICAL COMPRESSION ZONE. Extremely narrow courtyard layouts trying to process overflow streams running between Mahakal and Ram Ghat."
    },
    {
        id: "ram_ghat",
        name: "Ram Ghat (Kshipra Riverfront)",
        lat: 23.1812,
        lng: 75.7588,
        type: "epicenter",
        max_capacity_pedestrians: 350000,
        max_capacity_vehicles: 0,
        on_ground_risk_factor: "Primary Snan (Bathing) epicenter. Severe crush risks along direct approach steps during morning auspicious hours."
    },
    {
        id: "nanakheda_holding",
        name: "Nanakheda Satellite Holding Area",
        lat: 23.1534,
        lng: 75.7845,
        type: "holding",
        max_capacity_pedestrians: 80000,
        max_capacity_vehicles: 4500,
        on_ground_risk_factor: "Outer interceptor zone used to store regional bus traffic and pause pilgrim waves before they penetrate the inner city."
    },
    {
        id: "mangalnath_mandir",
        name: "Mangalnath Temple Sector",
        lat: 23.2104,
        lng: 75.7922,
        type: "epicenter",
        max_capacity_pedestrians: 60000,
        max_capacity_vehicles: 1200,
        on_ground_risk_factor: "Peripheral attraction point creating separate bottlenecking cycles on the northern ring corridor."
    }
];

export const UJJAIN_ROUTES: RouteSegment[] = [
    {
        id: "r1_station_to_mahakal",
        name: "Mahakal Mandir Marg (Direct Trunk)",
        origin_node_id: "ujjain_jnc",
        destination_node_id: "mahakal_corridor",
        distance_km: 1.8,
        free_flow_time_mins: 6,
        is_chokepoint: true,
        backup_route_id: "b1_outer_ring_diversion",
        historical_traffic_multiplier: 4.8
    },
    {
        id: "r2_mahakal_to_ramghat",
        name: "Harsiddhi-Ghat Transition Axis",
        origin_node_id: "mahakal_corridor",
        destination_node_id: "ram_ghat",
        distance_km: 0.9,
        free_flow_time_mins: 12, // High friction due to walking density
        is_chokepoint: true,
        backup_route_id: "b2_danigate_pedestrian_bypass",
        historical_traffic_multiplier: 6.2
    },
    {
        id: "r3_nanakheda_to_station",
        name: "Indore-Ujjain Radial Link",
        origin_node_id: "nanakheda_holding",
        destination_node_id: "ujjain_jnc",
        distance_km: 3.5,
        free_flow_time_mins: 8,
        is_chokepoint: false,
        backup_route_id: null,
        historical_traffic_multiplier: 2.1
    }
];

export const UJJAIN_BACKUP_ROUTES: BackupRoute[] = [
    {
        id: "b1_outer_ring_diversion",
        name: "Harifatak Flyover to Jaisinghpura Northern Bypass",
        path_coordinates: [
            { lat: 23.1786, lng: 75.7807 }, // Station
            { lat: 23.1695, lng: 75.7780 }, // Harifatak Junction Bypass
            { lat: 23.1720, lng: 75.7550 }, // Jaisinghpura Outer Access
            { lat: 23.1829, lng: 75.7682 }  // Mahakal Corridor Rear Gate
        ],
        strategic_advantage: "Increases total travel distance by 2.4km but completely skips the central bazaar congestion loop. In tight traffic, it saves an estimated 35 minutes by utilizing multi-lane wide-clearance asphalt."
    },
    {
        id: "b2_danigate_pedestrian_bypass",
        name: "Dani Gate Elevated Pedestrian Catwalk Bypass",
        path_coordinates: [
            { lat: 23.1829, lng: 75.7682 }, // Mahakal
            { lat: 23.1895, lng: 75.7650 }, // Dani Gate Sector Axis
            { lat: 23.1850, lng: 75.7560 }, // Rinmukteshwar Crossing
            { lat: 23.1812, lng: 75.7588 }  // Ram Ghat Northern Entry
        ],
        strategic_advantage: "Completely bypasses the narrow Harsiddhi Mandir bottleneck square. Diverts walking crowds northward along wider alleys, preventing a dangerous cross-flow crush condition."
    }
];