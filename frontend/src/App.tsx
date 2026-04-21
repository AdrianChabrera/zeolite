import Dashboard from './components/Dashboard';
import GraphView from './components/GraphView';
import SidePanel from './components/SidePanel';

export default function App() {
  return (
    <>
      <SidePanel onCreated={() => {}} />
      <div style={{ marginLeft: 160, height: '100vh' }}>
        <GraphView />
      </div>
      <Dashboard />
    </>
  );
}