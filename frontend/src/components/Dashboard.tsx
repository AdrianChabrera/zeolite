import { useEffect, useState } from 'react';

const API_URL = 'http://127.0.0.1:8000/api/dashboard';

export default function Dashboard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [orphans, setOrphans] = useState<any[]>([]);
  const [centrality, setCentrality] = useState<any[]>([]);
  const [eventChain, setEventChain] = useState<any[]>([]);
  const [locImportance, setLocImportance] = useState<any[]>([]);

  const loadData = () => {
    fetch(`${API_URL}/world-summary`).then(res => res.json()).then(setSummary);
    fetch(`${API_URL}/hotspots`).then(res => res.json()).then(data => setHotspots(data.slice(0, 3)));
    fetch(`${API_URL}/plot-holes`).then(res => res.json()).then(setOrphans);
    fetch(`${API_URL}/social-centrality`).then(res => res.json()).then(setCentrality);
    fetch(`${API_URL}/event-chain`).then(res => res.json()).then(setEventChain);
    fetch(`${API_URL}/location-importance`).then(res => res.json()).then(setLocImportance);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, height: '100vh',
      width: isExpanded ? 620 : 220, 
      background: '#12121e', borderLeft: '1px solid #2e2e4e',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
      zIndex: 20, overflowY: 'auto', overflowX: 'hidden'
    }}>
      
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        style={{
          position: 'fixed', right: isExpanded ? 620 : 220, top: '50%', transform: 'translateY(-50%)',
          width: 28, height: 80, background: '#6366f1', color: '#fff',
          border: '1px solid #818cf8', borderRight: 'none', borderRadius: '8px 0 0 8px',
          cursor: 'pointer', zIndex: 30, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 18, fontWeight: 'bold',
          transition: 'right 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
          boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.4)',
        }}
      >
        {isExpanded ? '〉' : '〈'}
      </button>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <p style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
          Story Analytics
        </p>

        {summary && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatBox label="Total Nodes" value={summary.total_nodes} />
              <StatBox label={isExpanded ? "Total Relations" : "Total Rels"} value={summary.relationships} />
            </div>

            <div style={{ 
              display: 'flex', flexDirection: 'column', gap: '4px', 
              background: '#1e1e2e', padding: '8px', borderRadius: 8,
              border: '1px solid #2e2e4e'
            }}>
              <p style={{ color: '#6b7280', fontSize: 9, marginBottom: 4, textAlign: 'center', fontWeight: 600 }}>WORLD SUMMARY</p>
              <MiniStat label="Characters" value={summary.characters} color="#6366f1" />
              <MiniStat label="Locations"  value={summary.locations}  color="#10b981" />
              <MiniStat label="Groups"     value={summary.groups}     color="#f59e0b" />
              <MiniStat label="Objects"    value={summary.objects}    color="#ef4444" />
              <MiniStat label="Events"     value={summary.events}     color="#ca5cf6" />
            </div>
          </div>
        )}

        {isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s ease' }}>
            
            <Card title="SOCIAL CENTRALITY (Ranking)">
              {centrality.slice(0, 5).map((c, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#fff' }}>
                    <span>{c.character}</span>
                    <span style={{ opacity: 0.6 }}>{c.connection_count} connections</span>
                  </div>
                  <div style={barBg}>
                    <div style={{ ...barFg, background: '#6366f1', width: `${(c.connection_count / (centrality[0]?.connection_count || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Card title="LOCATION IMPORTANCE">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {locImportance.slice(0, 4).map((l, i) => (
                    <div key={i} style={{ 
                      fontSize: 10, 
                      fontFamily: 'monospace',
                      borderLeft: '2px solid #10b981',
                      paddingLeft: 8,
                      paddingBottom: 4
                    }}>
                      <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>{l.location.toUpperCase()}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                        <span style={{ color: '#6b7280' }}>IMPORTANCE:</span>
                        <span style={{ color: '#10b981' }}>{l.cumulative_importance.toFixed(1)}</span>
                        <span style={{ color: '#6b7280' }}>EVENT NUMBER:</span>
                        <span style={{ color: '#fff' }}>{l.total_events}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="EVENT CAUSALITY">
                {eventChain.slice(0, 4).map((e, i) => (
                  <div key={i} style={{ fontSize: 10, color: '#fff', marginBottom: 8, paddingLeft: 8, borderLeft: '2px solid #ca5cf6' }}>
                    <div style={{ opacity: 0.6, fontSize: 9 }}>{e.cause}</div>
                    <div style={{ color: '#ca5cf6' }}>↳ {e.consequence}</div>
                  </div>
                ))}
              </Card>
            </div>

            <div style={{ height: '1px', background: '#2e2e4e', margin: '4px 0' }} />
          </div>
        )}

        <section>
          <p style={{ color: '#f59e0b', fontSize: 11, marginBottom: 10, fontWeight: 600 }}>HOTSPOTS (AVG IMPACT)</p>
          <div style={{ display: 'grid', gridTemplateColumns: isExpanded ? '1fr 1fr' : '1fr', gap: isExpanded ? 16 : 0 }}>
            {hotspots.map(h => (
              <div key={h.location} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: 12 }}>
                  <span style={{ fontWeight: 500 }}>{h.location}</span>
                  <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{h.average_impact.toFixed(1)}</span>
                </div>
                <div style={barBg}>
                  <div style={{ 
                    ...barFg, background: '#f59e0b', 
                    width: `${Math.min((h.average_impact / 5) * 100, 100)}%`,
                    boxShadow: '0 0 8px #f59e0b44'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p style={{ color: '#ef4444', fontSize: 11, marginBottom: 10, fontWeight: 600 }}>PLOT HOLES</p>
          <div style={{ display: 'grid', gridTemplateColumns: isExpanded ? '1fr 1fr' : '1fr', gap: 8 }}>
            {orphans.length === 0 ? (
              <p style={{ color: '#4b5563', fontSize: 12, fontStyle: 'italic' }}>All entities connected.</p>
            ) : (
              orphans.map(o => (
                <div key={o.id} style={{ 
                  background: '#ef44440a', border: '1px solid #ef444422', 
                  padding: '8px 10px', borderRadius: 6
                }}>
                  <p style={{ color: '#fff', fontSize: 12, margin: 0, fontWeight: 500 }}>{o.name}</p>
                  <p style={{ color: '#ef4444', fontSize: 10, margin: 0, textTransform: 'uppercase', opacity: 0.8 }}>{o.type}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

function StatBox({ label, value }: any) {
  return (
    <div style={{ background: '#1e1e2e', padding: '12px 8px', borderRadius: 8, border: '1px solid #2e2e4e', textAlign: 'center' }}>
      <p style={{ color: '#9ca3af', fontSize: 9, textTransform: 'uppercase', margin: '0 0 4px 0' }}>{label}</p>
      <p style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', margin: 0 }}>{value}</p>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: '#2e2e4e44', padding: '6px 10px', borderRadius: 4,
      borderLeft: `4px solid ${color}`, marginBottom: 2
    }}>
      <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 500 }}>{label}</span>
      <span style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{value}</span>
    </div>
  );
}

function Card({ title, children }: any) {
  return (
    <div style={{ background: '#1e1e2e', padding: '12px', borderRadius: 10, border: '1px solid #2e2e4e' }}>
      <p style={{ color: '#6b7280', fontSize: 9, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase' }}>{title}</p>
      {children}
    </div>
  );
}

const barBg: any = { width: '100%', height: 4, background: '#2e2e4e', borderRadius: 2, marginTop: 4 };
const barFg: any = { height: '100%', borderRadius: 2, transition: 'width 0.5s ease' };