export interface SimNodeStatus {
  id: string;
  name: string;
  currentLoad: number;
  maxCapacity: number;
  vfr: number;
  status: 'nominal' | 'warning' | 'danger';
}

export interface SimMetrics {
  vfr: number; // Max VFR across the network
  safetyIndex: number;
  avgVelocity: string;
  timeToDecline: string;
  nodes: Record<string, SimNodeStatus>;
}

export function computeSimulationMetrics(
  crowdLoad: number,
  mitigationDiversion: boolean,
  mitigationBypass: boolean
): SimMetrics {
  // Base capacities
  const nodeCapacities: Record<string, number> = {
    ujjain_jnc: 120000,
    mahakal_corridor: 250000,
    harsiddhi_mandir: 30000,
    ram_ghat: 350000,
    nanakheda_holding: 80000,
    mangalnath_mandir: 60000,
  };

  // Node loads scale with the incoming crowdLoad (pilgrims per hour)
  // Let's model the crowd distribution across the nodes.
  const nodes: Record<string, SimNodeStatus> = {};
  
  // 1. Ujjain Junction: Main entry, gets direct flow
  const ujjainLoad = crowdLoad * 0.9;
  
  // 2. Nanakheda: Outer interceptor, handles a subset
  const nanakhedaLoad = crowdLoad * 0.6;
  
  // 3. Mahakal Corridor: Destination. Accumulated traffic.
  // If mitigationDiversion is engaged, we redirect vehicle and pedestrian flow to bypasses,
  // reducing direct accumulation at the main gate.
  const mahakalLoad = mitigationDiversion 
    ? crowdLoad * 0.95 
    : crowdLoad * 1.6;

  // 4. Harsiddhi Mandir: Chokepoint between Mahakal and Ram Ghat.
  // If mitigationBypass is engaged, we divert 75% of pedestrian outflow via Dani Gate.
  const harsiddhiLoad = mitigationBypass
    ? crowdLoad * 0.12
    : crowdLoad * 0.55;

  // 5. Ram Ghat: Bathing epicenter.
  const ramghatLoad = crowdLoad * 1.5;

  // 6. Mangalnath: Northern ring, lower load.
  const mangalnathLoad = crowdLoad * 0.35;

  const rawLoads: Record<string, number> = {
    ujjain_jnc: ujjainLoad,
    mahakal_corridor: mahakalLoad,
    harsiddhi_mandir: harsiddhiLoad,
    ram_ghat: ramghatLoad,
    nanakheda_holding: nanakhedaLoad,
    mangalnath_mandir: mangalnathLoad,
  };

  const nodeNames: Record<string, string> = {
    ujjain_jnc: "Ujjain Junction Railway Station",
    mahakal_corridor: "Mahakaleshwar Temple Corridor Complex",
    harsiddhi_mandir: "Harsiddhi Mata Temple Square",
    ram_ghat: "Ram Ghat (Kshipra Riverfront)",
    nanakheda_holding: "Nanakheda Satellite Holding Area",
    mangalnath_mandir: "Mangalnath Temple Sector",
  };

  let maxVfr = 0;

  for (const id in nodeCapacities) {
    const cap = nodeCapacities[id];
    const load = rawLoads[id];
    const vfr = load / cap;
    if (vfr > maxVfr) {
      maxVfr = vfr;
    }

    let status: 'nominal' | 'warning' | 'danger' = 'nominal';
    if (vfr >= 1.0) {
      status = 'danger';
    } else if (vfr >= 0.6) {
      status = 'warning';
    }

    nodes[id] = {
      id,
      name: nodeNames[id],
      currentLoad: Math.round(load),
      maxCapacity: cap,
      vfr: parseFloat(vfr.toFixed(2)),
      status,
    };
  }

  // System safety index: decreases as max VFR increases
  const safetyIndex = Math.max(10, Math.min(100, Math.round(100 - (maxVfr * 45))));

  // Average walking/transit velocity
  // Free walking speed is ~5 km/h, transit is higher.
  // With congestion, velocity drops.
  const baseVelocity = 18.5; // km/h blended average
  const velocityValue = baseVelocity / (1 + Math.pow(maxVfr, 1.8) * 1.2);
  const avgVelocity = velocityValue.toFixed(1) + " km/h";

  // Transit Health / Time to Decline
  let timeToDecline = ">180 mins (Stable)";
  if (maxVfr >= 1.2) {
    timeToDecline = "IMMINENT CRUSH RISK";
  } else if (maxVfr >= 0.9) {
    timeToDecline = "CRITICAL LIMIT (< 30m)";
  } else if (maxVfr >= 0.6) {
    timeToDecline = "CONGESTION LOAD (< 90m)";
  }

  return {
    vfr: parseFloat(maxVfr.toFixed(2)),
    safetyIndex,
    avgVelocity,
    timeToDecline,
    nodes,
  };
}
