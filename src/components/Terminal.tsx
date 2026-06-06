import React, { useEffect, useState, useRef } from 'react';
import { Terminal as TerminalIcon, ShieldCheck, AlertTriangle } from 'lucide-react';
import { computeSimulationMetrics } from '../data/simulationEngine';

interface TerminalProps {
  simulationActive: boolean;
  crowdLoad: number;
  mitigationDiversion: boolean;
  mitigationBypass: boolean;
}

interface LogLine {
  text: string;
  type: 'info' | 'warn' | 'success' | 'danger';
  timestamp: string;
}

const getTimestamp = () => {
  const now = new Date();
  return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
};

export const Terminal: React.FC<TerminalProps> = ({
  simulationActive,
  crowdLoad,
  mitigationDiversion,
  mitigationBypass
}) => {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Ref to track previous props
  const prevProps = useRef({ crowdLoad, mitigationDiversion, mitigationBypass, simulationActive });

  // Normal mode base logs
  const dormantLogs = (): LogLine[] => [
    { text: 'SYSTEM INIT: Simhastha Transit Command Center Node UJN-01', type: 'success', timestamp: getTimestamp() },
    { text: 'SLM ENGINE: Cognitive Small Language Model v4.11 loaded', type: 'info', timestamp: getTimestamp() },
    { text: 'INGESTION: Realtime crowd feeds reading @ 124.8 Hz', type: 'info', timestamp: getTimestamp() },
    { text: 'VFR CHECK: Nominals detected (VFR: 0.33). Transit channels open', type: 'success', timestamp: getTimestamp() },
    { text: 'HEARTBEAT: System status green. No congestion warnings', type: 'info', timestamp: getTimestamp() },
  ];

  // Helper to compile starting evaluation sequence
  const getInitialSequence = (load: number, div: boolean, bypass: boolean) => {
    const sim = computeSimulationMetrics(load, div, bypass);
    const seq: Omit<LogLine, 'timestamp'>[] = [
      { text: `CRITICAL ALERT: Shahi Snan Influx Trigger received (${load.toLocaleString()} pilgrims/hr)`, type: 'danger' },
      { text: 'SLM ENGINE: Initializing Cognitive Transit Routing Evaluation...', type: 'info' },
      { text: 'GEOSPATIAL DIAGNOSTIC: Reading all geofenced location nodes...', type: 'info' },
    ];

    if (!div) {
      seq.push({ text: `SLM EVALUATION: Direct trunk corridor is highly loaded. Volume-to-Capacity ratio exceeds nominal limits.`, type: 'warn' });
    } else {
      seq.push({ text: `SLM EVALUATION: Harifatak outer ring bypass active. Direct route traffic successfully balanced.`, type: 'success' });
    }

    if (!bypass) {
      seq.push({ text: `SLM EVALUATION: Harsiddhi Mata Temple Square has critical geometric constrictions. Crush risk is HIGH.`, type: 'warn' });
    } else {
      seq.push({ text: `SLM EVALUATION: Dani Gate elevated catwalk active. Outflowing crowd diverted around Harsiddhi.`, type: 'success' });
    }

    seq.push({ 
      text: `SYSTEM ANALYSIS: Safety Index: ${sim.safetyIndex}% | Max VFR: ${sim.vfr} | Flow Velocity: ${sim.avgVelocity}`, 
      type: (sim.safetyIndex < 50 ? 'danger' : sim.safetyIndex < 85 ? 'warn' : 'success')
    });
    
    return seq;
  };

  // Effect to handle state modifications and push dynamic logs
  useEffect(() => {
    if (!simulationActive) {
      setLogs(dormantLogs());
      prevProps.current = { crowdLoad, mitigationDiversion, mitigationBypass, simulationActive };
      return;
    }

    // If simulation just turned active
    if (!prevProps.current.simulationActive && simulationActive) {
      setLogs([{ text: 'SHAHI SNAN SIMULATION ENGAGED...', type: 'danger', timestamp: getTimestamp() }]);
      
      const sequence = getInitialSequence(crowdLoad, mitigationDiversion, mitigationBypass);
      let currentIdx = 0;
      const interval = setInterval(() => {
        if (currentIdx < sequence.length) {
          const logItem = sequence[currentIdx];
          setLogs(prev => [
            ...prev,
            { ...logItem, timestamp: getTimestamp() }
          ]);
          currentIdx++;
        } else {
          clearInterval(interval);
        }
      }, 500);

      prevProps.current = { crowdLoad, mitigationDiversion, mitigationBypass, simulationActive };
      return () => clearInterval(interval);
    }

    // If simulation was already active and values changed
    if (simulationActive) {
      const changes: string[] = [];
      if (prevProps.current.crowdLoad !== crowdLoad) {
        changes.push(`INPUT CHANGE: Influx rate limit adjusted to ${crowdLoad.toLocaleString()} pilgrims/hr.`);
      }
      if (prevProps.current.mitigationDiversion !== mitigationDiversion) {
        changes.push(mitigationDiversion 
          ? 'DIRECTIVE ENGAGED: Harifatak Outer Ring diversion route (b1) activated.' 
          : 'DIRECTIVE REVOKED: Harifatak Outer Ring diversion route (b1) deactivated.'
        );
      }
      if (prevProps.current.mitigationBypass !== mitigationBypass) {
        changes.push(mitigationBypass
          ? 'DIRECTIVE ENGAGED: Dani Gate Catwalk pedestrian bypass (b2) activated.'
          : 'DIRECTIVE REVOKED: Dani Gate Catwalk pedestrian bypass (b2) deactivated.'
        );
      }

      if (changes.length > 0) {
        const sim = computeSimulationMetrics(crowdLoad, mitigationDiversion, mitigationBypass);
        const newLogs: LogLine[] = [];
        
        changes.forEach(c => {
          newLogs.push({ text: c, type: 'info', timestamp: getTimestamp() });
        });

        // Dynamic SLM evaluation details
        newLogs.push({ 
          text: `SLM RUN: Re-evaluating. Safety: ${sim.safetyIndex}% | Max VFR: ${sim.vfr} | Flow Velocity: ${sim.avgVelocity}`, 
          type: (sim.safetyIndex < 50 ? 'danger' : sim.safetyIndex < 85 ? 'warn' : 'success'), 
          timestamp: getTimestamp() 
        });

        // Capacity alert logs
        if (sim.vfr >= 1.0) {
          newLogs.push({
            text: `CRITICAL ALERT: Network node capacity limits breached. Health status: ${sim.timeToDecline}`,
            type: 'danger',
            timestamp: getTimestamp()
          });
        }

        setLogs(prev => {
          const combined = [...prev, ...newLogs];
          // Limit to last 50 lines to keep container performance high
          if (combined.length > 50) {
            return combined.slice(combined.length - 50);
          }
          return combined;
        });
      }
    }

    prevProps.current = { crowdLoad, mitigationDiversion, mitigationBypass, simulationActive };
  }, [simulationActive, crowdLoad, mitigationDiversion, mitigationBypass]);

  // Autoscroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-[220px] bg-black border border-slate-800 rounded overflow-hidden font-mono">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a0a0a] border-b border-slate-900 text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
        <div className="flex items-center gap-1.5">
          <TerminalIcon className={`w-3.5 h-3.5 ${simulationActive ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
          <span>Cognitive SLM Evaluation Engine</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div 
        ref={containerRef}
        className="flex-grow p-3 overflow-y-auto space-y-1 bg-[#020202] text-[10px] leading-relaxed select-text selection:bg-slate-800 selection:text-white"
      >
        {logs.map((log, index) => {
          let colorClass = 'text-slate-400';
          if (log.type === 'success') colorClass = 'text-emerald-400';
          if (log.type === 'warn') colorClass = 'text-amber-400';
          if (log.type === 'danger') colorClass = 'text-red-400 font-bold';

          return (
            <div key={index} className="flex gap-2 items-start font-mono-terminal">
              <span className="text-slate-600 flex-shrink-0">[{log.timestamp}]</span>
              <span className={`${colorClass} break-words flex-grow`}>
                {log.text}
              </span>
            </div>
          );
        })}
        {/* Blinking Cursor */}
        <div className="flex gap-2 items-center">
          <span className="text-slate-600">[{getTimestamp()}]</span>
          <span className="inline-block w-1.5 h-3 bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

      {/* Status Footer */}
      <div className="px-3 py-1 bg-[#050505] border-t border-slate-900 text-[9px] text-slate-500 flex justify-between select-none">
        <div className="flex items-center gap-1">
          {simulationActive ? (
            <>
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className="text-red-400 font-semibold">ALARM OVERRIDE MODE ACTIVE</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>NOMINAL ROUTING ACTIVE</span>
            </>
          )}
        </div>
        <span>MODEL: SLM-UJN-v4.11</span>
      </div>
    </div>
  );
};
