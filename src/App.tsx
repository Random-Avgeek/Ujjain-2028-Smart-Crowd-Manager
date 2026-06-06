import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MapCanvas } from './components/MapCanvas';
import { Terminal } from './components/Terminal';
import type { LocationNode } from './data/keyinfo';

function App() {
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [crowdLoad, setCrowdLoad] = useState<number>(40000);
  const [mitigationDiversion, setMitigationDiversion] = useState<boolean>(false);
  const [mitigationBypass, setMitigationBypass] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<LocationNode | null>(null);

  const handleToggleSimulation = () => {
    setSimulationActive(prev => {
      const next = !prev;
      if (next) {
        // Engaging: set to peak load
        setCrowdLoad(120000);
      } else {
        // Resetting: restore to nominal load and disable mitigations
        setCrowdLoad(40000);
        setMitigationDiversion(false);
        setMitigationBypass(false);
      }
      return next;
    });
  };

  const handleSelectNode = (node: LocationNode) => {
    setSelectedNode(node);
  };

  const handleClearSelectedNode = () => {
    setSelectedNode(null);
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-[#04060a] text-slate-100 font-sans antialiased">
      {/* Left Sidebar and Embedded Terminal */}
      <Sidebar
        simulationActive={simulationActive}
        onToggleSimulation={handleToggleSimulation}
        crowdLoad={crowdLoad}
        setCrowdLoad={setCrowdLoad}
        mitigationDiversion={mitigationDiversion}
        setMitigationDiversion={setMitigationDiversion}
        mitigationBypass={mitigationBypass}
        setMitigationBypass={setMitigationBypass}
        selectedNode={selectedNode}
        onClearSelectedNode={handleClearSelectedNode}
      >
        <Terminal
          simulationActive={simulationActive}
          crowdLoad={crowdLoad}
          mitigationDiversion={mitigationDiversion}
          mitigationBypass={mitigationBypass}
        />
      </Sidebar>

      {/* Main Map Canvas Area */}
      <main className="flex-grow h-screen relative bg-slate-900">
        <MapCanvas
          simulationActive={simulationActive}
          crowdLoad={crowdLoad}
          mitigationDiversion={mitigationDiversion}
          mitigationBypass={mitigationBypass}
          selectedNode={selectedNode}
          onSelectNode={handleSelectNode}
        />
      </main>
    </div>
  );
}

export default App;

