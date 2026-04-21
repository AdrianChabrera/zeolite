import { useRef } from 'react';
import Dashboard from './components/Dashboard';
import GraphView from './components/GraphView';
import SidePanel from './components/SidePanel';

export default function App() {
  const reloadRef = useRef<() => void>(() => {});

  return (
    <>
      <SidePanel onCreated={() => reloadRef.current()} />
      <div style={{ marginLeft: 160, height: '100vh' }}>
        <GraphView onLoadReady={(fn) => { reloadRef.current = fn; }} />
      </div>
      <Dashboard />
    </>
  );
}