import { useRef, useState, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import GraphView from './components/GraphView';
import SidePanel from './components/SidePanel';
import type { EntityType } from './types/graph';

export default function App() {
  const reloadRef = useRef<() => void>(() => {});
  const [hiddenTypes, setHiddenTypes] = useState<Set<EntityType>>(new Set());

  const handleToggleType = useCallback((type: EntityType) => {
    setHiddenTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  return (
    <>
      <SidePanel
        onCreated={() => reloadRef.current()}
        hiddenTypes={hiddenTypes}
        onToggleType={handleToggleType}
      />
      <div style={{ marginLeft: 160, height: '100vh' }}>
        <GraphView
          onLoadReady={(fn) => { reloadRef.current = fn; }}
          hiddenTypes={hiddenTypes}
        />
      </div>
      <Dashboard />
    </>
  );
}