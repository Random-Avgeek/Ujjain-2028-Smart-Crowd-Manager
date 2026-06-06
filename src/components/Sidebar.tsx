import React, { useState } from 'react';
import type { LocationNode } from '../data/keyinfo';
import historicalData from '../data/historical_data.json';
import { computeSimulationMetrics } from '../data/simulationEngine';
import { Activity, ShieldAlert, Award, TrendingUp, Info, ChevronRight, Zap, RefreshCw } from 'lucide-react';

interface SidebarProps {
  simulationActive: boolean;
  onToggleSimulation: () => void;
  crowdLoad: number;
  setCrowdLoad: (val: number) => void;
  mitigationDiversion: boolean;
  setMitigationDiversion: (val: boolean) => void;
  mitigationBypass: boolean;
  setMitigationBypass: (val: boolean) => void;
  selectedNode: LocationNode | null;
  onClearSelectedNode: () => void;
  children?: React.ReactNode; // For embedding the terminal
}

export const Sidebar: React.FC<SidebarProps> = ({
  simulationActive,
  onToggleSimulation,
  crowdLoad,
  setCrowdLoad,
  mitigationDiversion,
  setMitigationDiversion,
  mitigationBypass,
  setMitigationBypass,
  selectedNode,
  onClearSelectedNode,
  children
}) => {
  const [activeTab, setActiveTab] = useState<'realtime' | 'history'>('realtime');
  const [historyYear, setHistoryYear] = useState<number>(2016);

  // Compute stats dynamically using the simulation engine
  const sim = computeSimulationMetrics(crowdLoad, mitigationDiversion, mitigationBypass);
  const vfr = sim.vfr;
  const safetyIndex = sim.safetyIndex;
  const avgVelocity = sim.avgVelocity;
  const timeToDecline = sim.timeToDecline;
  const simNodes = sim.nodes;

  // Filter Ujjain history from the JSON
  const years = [1982, 1994, 2004, 2016];
  const ujjainHistory = years.map(yr => {
    const vis = historicalData.visitors.find(v => v.Year === yr && v.Location === 'Ujjain');
    const rev = historicalData.revenue.find(r => r.Year === yr && r.Location === 'Ujjain');
    const env = historicalData.environment.find(e => e.Year === yr && e.Location === 'Ujjain');
    const med = historicalData.media.find(m => m.Year === yr && m.Location === 'Ujjain');
    const saf = historicalData.safety.find(s => s.Year === yr && s.Location === 'Ujjain');
    const sen = historicalData.sentiment.find(s => s.Year === yr && s.Location === 'Ujjain');

    return {
      year: yr,
      domestic: vis?.Domestic_Visitors || 0,
      intl: vis?.International_Visitors || 0,
      spending: vis?.Avg_Spending_Per_Visitor || 0,
      revenue: vis?.Total_Revenue_Generated || 0,
      donations: rev?.Donations_Received || 0,
      wqi: env?.Water_Quality_Index || 0,
      waste: env?.Waste_Generated_Tons || 0,
      air: env?.Air_Pollution_Level || 0,
      media: med?.International_Media_Coverage || 0,
      celebrities: med?.Celebrity_Visits || 0,
      crimes: saf?.Crime_Incidents || 0,
      sentimentPos: sen?.Positive_Sentiment_Percentage || 0,
    };
  });

  const selectedYearData = ujjainHistory.find(d => d.year === historyYear);

  return (
    <div className="w-[380px] h-screen bg-[#070b13] border-r border-slate-800 flex flex-col flex-shrink-0 select-none text-slate-300">
      {/* Header Banner */}
      <div className="p-4 border-b border-slate-800 bg-[#0b0f19] flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold tracking-tight text-white m-0">SIMHASTHA UJJAIN</h1>
          <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Predictive Transit Command
          </p>
        </div>
        <div className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-1 rounded border border-slate-700">
          UJN-2028
        </div>
      </div>

      {/* Admin Action Bar */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800">
        <button
          onClick={onToggleSimulation}
          className={`w-full py-2.5 px-4 rounded font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 border shadow-md cursor-pointer ${
            simulationActive
              ? 'bg-red-950 border-red-500 text-red-300 hover:bg-red-900 shadow-red-950/40 glow-red'
              : 'bg-emerald-950 border-emerald-500 text-emerald-300 hover:bg-emerald-900 shadow-emerald-950/40 glow-emerald'
          }`}
        >
          {simulationActive ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Reset Command Center
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              Simulate Peak Shahi Snan Influx
            </>
          )}
        </button>
      </div>

      {/* Dynamic Controls when Simulation is Active */}
      {simulationActive && (
        <div className="p-4 bg-[#0a1122]/90 border-b border-slate-800 text-xs space-y-4 shadow-inner">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Influx Rate Limit</span>
              <span className="font-mono text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                {crowdLoad.toLocaleString()} / hr
              </span>
            </div>
            <input
              type="range"
              min="20000"
              max="200000"
              step="10000"
              value={crowdLoad}
              onChange={(e) => setCrowdLoad(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
            />
            <div className="flex justify-between text-[8px] text-slate-500 font-mono tracking-wider">
              <span>20k (Nominal)</span>
              <span>120k (Peak Snan)</span>
              <span>200k (Extreme)</span>
            </div>
          </div>

          <div className="space-y-2 pt-1.5 border-t border-slate-800/40">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Active Bypass Directives</span>
            
            {/* Mitigation 1: Harifatak bypass */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={mitigationDiversion}
                onChange={(e) => setMitigationDiversion(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/50"
              />
              <span className="text-[10.5px]">Harifatak Outer Ring Diversion (b1)</span>
            </label>

            {/* Mitigation 2: Dani Gate bypass */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={mitigationBypass}
                onChange={(e) => setMitigationBypass(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/50"
              />
              <span className="text-[10.5px]">Dani Gate Catwalk Bypass (b2)</span>
            </label>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex bg-[#0b0f19]/80 border-b border-slate-800 text-xs text-center font-medium">
        <button
          onClick={() => setActiveTab('realtime')}
          className={`flex-1 py-3 transition-colors ${
            activeTab === 'realtime'
              ? 'text-white border-b-2 border-emerald-500 bg-slate-900/30'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Live Operations
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 transition-colors ${
            activeTab === 'history'
              ? 'text-white border-b-2 border-emerald-500 bg-slate-900/30'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Historical Insights
        </button>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {activeTab === 'realtime' ? (
          <>
            {/* System Diagnostics Metrics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span>System Metrics</span>
                <Activity className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* VFR */}
                <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Volume-to-Capacity (VFR)</div>
                  <div className={`text-lg font-bold font-mono-terminal mt-1 ${
                    vfr >= 1.0 ? 'text-red-400 animate-pulse' : vfr >= 0.6 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {vfr.toFixed(2)}
                  </div>
                </div>
                {/* Safety Index */}
                <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Safety Index</div>
                  <div className={`text-lg font-bold font-mono-terminal mt-1 ${
                    safetyIndex < 50 ? 'text-red-400 animate-pulse' : safetyIndex < 80 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {safetyIndex}%
                  </div>
                </div>
                {/* Avg Velocity */}
                <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Avg Congestion Velocity</div>
                  <div className="text-slate-200 text-sm font-bold font-mono-terminal mt-1">
                    {avgVelocity}
                  </div>
                </div>
                {/* Time To Decline */}
                <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Transit Health</div>
                  <div className={`text-slate-200 text-[10px] font-bold mt-2 truncate ${
                    vfr >= 1.2 ? 'text-red-400 animate-pulse' : vfr >= 0.9 ? 'text-red-400' : vfr >= 0.6 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {timeToDecline}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Node Alarms */}
            <div className="space-y-2">
              <h3 className="text-xs text-slate-400 font-semibold uppercase tracking-wider m-0 flex items-center justify-between">
                <span>Active Geofenced Alarms</span>
                <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
              </h3>

              <div className="space-y-2">
                {/* Harsiddhi Mandir node */}
                {(() => {
                  const node = simNodes.harsiddhi_mandir;
                  return (
                    <div className={`p-2.5 rounded border text-xs flex justify-between items-start transition-all duration-300 ${
                      node.status === 'danger'
                        ? 'bg-red-950/20 border-red-500/50 animate-alarm' 
                        : node.status === 'warning'
                        ? 'bg-amber-950/15 border-amber-500/30'
                        : 'bg-slate-900/40 border-slate-800'
                    }`}>
                      <div>
                        <div className="font-semibold text-slate-200">Harsiddhi Mata Temple Square</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Max capacity: 30,000 pilgrims</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                        node.status === 'danger'
                          ? 'bg-red-950 border border-red-500 text-red-400 animate-pulse'
                          : node.status === 'warning'
                          ? 'bg-amber-950 border border-amber-500/40 text-amber-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {node.status === 'danger' ? 'CRITICAL CRUSH' : node.status === 'warning' ? 'HEAVY INFLUX' : 'NOMINAL FLOW'}
                      </span>
                    </div>
                  );
                })()}

                {/* Mahakal Corridor node */}
                {(() => {
                  const node = simNodes.mahakal_corridor;
                  return (
                    <div className={`p-2.5 rounded border text-xs flex justify-between items-start transition-all duration-300 ${
                      node.status === 'danger'
                        ? 'bg-red-950/20 border-red-500/50 animate-alarm' 
                        : node.status === 'warning'
                        ? 'bg-amber-950/15 border-amber-500/30'
                        : 'bg-slate-900/40 border-slate-800'
                    }`}>
                      <div>
                        <div className="font-semibold text-slate-200">Mahakaleshwar Complex Corridor</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Max capacity: 250,000 pilgrims</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                        node.status === 'danger'
                          ? 'bg-red-950 border border-red-500 text-red-400 animate-pulse'
                          : node.status === 'warning'
                          ? 'bg-amber-950 border border-amber-500/40 text-amber-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {node.status === 'danger' ? 'CRITICAL CRUSH' : node.status === 'warning' ? 'HEAVY INFLUX' : 'STABLE'}
                      </span>
                    </div>
                  );
                })()}

                {/* Ram Ghat node */}
                {(() => {
                  const node = simNodes.ram_ghat;
                  return (
                    <div className={`p-2.5 rounded border text-xs flex justify-between items-start transition-all duration-300 ${
                      node.status === 'danger'
                        ? 'bg-red-950/20 border-red-500/50 animate-alarm' 
                        : node.status === 'warning'
                        ? 'bg-amber-950/15 border-amber-500/30'
                        : 'bg-slate-900/40 border-slate-800'
                    }`}>
                      <div>
                        <div className="font-semibold text-slate-200">Ram Ghat (Kshipra Riverfront)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Max capacity: 350,000 pilgrims</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                        node.status === 'danger'
                          ? 'bg-red-950 border border-red-500 text-red-400 animate-pulse'
                          : node.status === 'warning'
                          ? 'bg-amber-950 border border-amber-500/30 text-amber-400'
                          : 'bg-emerald-950/40 border border-emerald-500/20 text-emerald-400'
                      }`}>
                        {node.status === 'danger' ? 'CRITICAL OVERFLOW' : node.status === 'warning' ? 'PEAK Snan LOAD' : 'STABLE'}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Selected Node Telemetry */}
            <div className="bg-slate-950/80 p-3 rounded border border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-400 font-semibold mb-2">
                <span>Selected Node Telemetry</span>
                <Info className="w-3.5 h-3.5 text-slate-500" />
              </div>
              {selectedNode ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                    <span className="font-bold text-slate-200">{selectedNode.name}</span>
                    <button onClick={onClearSelectedNode} className="text-slate-500 hover:text-slate-300 text-[10px] uppercase font-mono">Clear</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-500 block uppercase font-mono">Location Coordinates</span>
                      <span className="text-slate-300">{selectedNode.lat.toFixed(4)}, {selectedNode.lng.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-mono">Node Type</span>
                      <span className="text-slate-300 capitalize">{selectedNode.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-mono">Max Pedestrian Cap</span>
                      <span className="text-slate-300 font-mono-terminal">{selectedNode.max_capacity_pedestrians.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-mono">Max Vehicle Cap</span>
                      <span className="text-slate-300 font-mono-terminal">{selectedNode.max_capacity_vehicles.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-500 block uppercase font-mono">Simulated Load</span>
                      <span className="text-amber-400 font-bold font-mono-terminal">
                        {simNodes[selectedNode.id] ? simNodes[selectedNode.id].currentLoad.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-mono">Local VFR</span>
                      <span className={`font-bold font-mono-terminal ${
                        simNodes[selectedNode.id]?.status === 'danger' ? 'text-red-400 animate-pulse' :
                        simNodes[selectedNode.id]?.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {simNodes[selectedNode.id] ? simNodes[selectedNode.id].vfr : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-2 rounded border border-slate-800 text-[10px] text-slate-400 mt-2">
                    <span className="text-[9px] text-amber-500 font-bold block uppercase tracking-wider mb-0.5">Ground Risk Telemetry</span>
                    {selectedNode.on_ground_risk_factor}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500 text-[11px] italic">
                  No node selected. Click on a marker in the map canvas to view dedicated telemetry.
                </div>
              )}
            </div>

            {/* Active Mitigation Panel */}
            <div className="space-y-2">
              <h3 className="text-xs text-slate-400 font-semibold uppercase tracking-wider m-0 flex items-center justify-between">
                <span>Mitigation Directives</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </h3>

              <div className="p-3 bg-slate-900/40 rounded border border-slate-800 space-y-2 text-xs">
                {simulationActive && (mitigationDiversion || mitigationBypass) ? (
                  <>
                    {mitigationDiversion && (
                      <div className="flex items-start gap-2 text-emerald-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0 animate-pulse"></div>
                        <div>
                          <strong className="block text-slate-200">Outer Ring Diversion Engaged</strong>
                          Traffic from Station to Mahakal Corridor diverted to <strong>b1_outer_ring_diversion</strong> via Harifatak Flyover.
                        </div>
                      </div>
                    )}
                    {mitigationBypass && (
                      <div className="flex items-start gap-2 text-indigo-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0 animate-pulse"></div>
                        <div>
                          <strong className="block text-slate-200">Pedestrian Catwalk Bypass Active</strong>
                          Dani Gate catwalk activated to route walking crowds north, bypassing the Harsiddhi Mandir crush box.
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-slate-500 italic text-[11px]">
                    System operating nominally. Primary routing active. Transit networks clear.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Historical Analytics tab compiled from the 6 sub-sections */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Ujjain Simhastha History</span>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>

            {/* Year Selector */}
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {years.map(yr => (
                <button
                  key={yr}
                  onClick={() => setHistoryYear(yr)}
                  className={`py-2 rounded font-mono font-bold transition-all border cursor-pointer ${
                    historyYear === yr
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow shadow-emerald-500/20'
                      : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Display Selected Year Data from all 6 sub-sections */}
            {selectedYearData && (
              <div className="space-y-3 text-xs">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Crowd Load</span>
                    <span className="text-slate-200 font-mono-terminal text-sm font-bold">
                      {((selectedYearData.domestic + selectedYearData.intl) / 1000000).toFixed(2)}M
                    </span>
                    <span className="text-[9px] text-slate-600 block mt-0.5">
                      ({(selectedYearData.intl / 1000).toFixed(0)}k International)
                    </span>
                  </div>

                  <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Economic Activity</span>
                    <span className="text-slate-200 font-mono-terminal text-sm font-bold">
                      ₹{(selectedYearData.revenue / 10000000).toFixed(0)}Cr
                    </span>
                    <span className="text-[9px] text-slate-600 block mt-0.5">
                      (₹{selectedYearData.spending.toLocaleString()} Avg/Capita)
                    </span>
                  </div>

                  <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Kshipra WQI</span>
                    <span className={`text-sm font-bold font-mono-terminal ${
                      selectedYearData.wqi > 60 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {selectedYearData.wqi.toFixed(1)} / 100
                    </span>
                    <span className="text-[9px] text-slate-600 block mt-0.5">
                      {selectedYearData.waste.toLocaleString()} Tons Waste
                    </span>
                  </div>

                  <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Public Safety</span>
                    <span className="text-slate-200 font-mono-terminal text-sm font-bold">
                      {selectedYearData.crimes} Crimes
                    </span>
                    <span className="text-[9px] text-emerald-500 block mt-0.5">
                      {(selectedYearData.sentimentPos).toFixed(1)}% Pos Sentiment
                    </span>
                  </div>
                </div>

                {/* Media and Social Context */}
                <div className="bg-slate-950/60 p-3 rounded border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-1">
                    <span className="font-semibold text-[10px] uppercase">Global Outreach</span>
                    <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400">
                    <div>International Media: <strong className="text-slate-200 font-mono">{selectedYearData.media} channels</strong></div>
                    <div>VVIP/Celebrity Visits: <strong className="text-slate-200 font-mono">{selectedYearData.celebrities}</strong></div>
                  </div>
                </div>

                {/* Cognitive insights */}
                <div className="p-3 bg-slate-900/30 rounded border border-slate-800 text-[10.5px] text-slate-400 leading-relaxed">
                  <strong className="text-[10px] text-emerald-400 block uppercase font-bold tracking-wider mb-1">Command Insights</strong>
                  The {historyYear} dataset verifies that Ujjain's inner urban street core reaches safety exhaustion whenever daily pilgrim intake spikes above 1.5 million. This historical velocity baseline proves that short-path routing through the central Harsiddhi node triggers immediate pedestrian stalls, necessitating the new 2028 active bypass directives.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cognitive SLM Terminal Screen at the bottom */}
      <div className="p-3 border-t border-slate-800 bg-black flex-shrink-0">
        {children}
      </div>
    </div>
  );
};
