import { useEffect, useState } from 'react';

const API_URL = 'http://127.0.0.1:8000/api/dashboard';

export default function Dashboard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [orphans, setOrphans] = useState<any[]>([]);
  const [centrality, setCentrality] = useState<any[]>([]);
  const [narrativeOrphans, setNarrativeOrphans] = useState<any[]>([]);
  const [emptyStages, setEmptyStages] = useState<any[]>([]);
  const [ghostEvents, setGhostEvents] = useState<any[]>([]);
  const [consequenceGaps, setConsequenceGaps] = useState<any[]>([]);
  const [isolatedCharacters, setIsolatedCharacters] = useState<any[]>([]);
  const [forgottenObjects, setForgottenObjects] = useState<any[]>([]);
  const [emptyGroups, setEmptyGroups] = useState<any[]>([]);

  const loadData = () => {
    fetch(`${API_URL}/world-summary`).then(res => res.json()).then(setSummary);
    fetch(`${API_URL}/hotspots`).then(res => res.json()).then(data => setHotspots(data.slice(0, 3)));
    fetch(`${API_URL}/plot-holes`).then(res => res.json()).then(setOrphans);
    fetch(`${API_URL}/social-centrality`).then(res => res.json()).then(setCentrality);
    fetch(`${API_URL}/audit/narrative-orphans`).then(res => res.json()).then(setNarrativeOrphans);
    fetch(`${API_URL}/audit/empty-stages`).then(res => res.json()).then(setEmptyStages);
    fetch(`${API_URL}/audit/ghost-events`).then(res => res.json()).then(setGhostEvents);
    fetch(`${API_URL}/audit/consequence-gaps`).then(res => res.json()).then(setConsequenceGaps);
    fetch(`${API_URL}/audit/isolated-characters`).then(res => res.json()).then(setIsolatedCharacters);
    fetch(`${API_URL}/audit/forgotten-objects`).then(res => res.json()).then(setForgottenObjects);
    fetch(`${API_URL}/audit/empty-groups`).then(res => res.json()).then(setEmptyGroups);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 3, height: 14, background: '#6366f1', borderRadius: 2 }} />
          <p style={{ 
            color: '#9ca3af', 
            fontSize: 12, 
            textTransform: 'uppercase', 
            letterSpacing: 2, 
            fontWeight: 700,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            Story Analytics
          </p>
        </div>

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

        <div style={{ height: '1px', background: '#2e2e4e', margin: '10px 0' }} />

        <section>
          <p style={{ color: '#6b7280', fontSize: 11, fontWeight: 600 }}>PLOT HOLES</p>
          {isExpanded && (
            <p style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
              Entities completely disconnected from the narrative graph. They have no relationships, events, or physical presence.
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: isExpanded ? '1fr 1fr' : '1fr', gap: 8, marginTop: 10 }}>
            {orphans.length === 0 ? (
              <p style={{ color: '#4b5563', fontSize: 12, fontStyle: 'italic' }}>All entities connected.</p>
            ) : (
              orphans.map(o => {
                  const getEntityColor = (type: string) => {
                    switch (type?.toUpperCase()) {
                      case 'CHARACTER': return '#6366f1';
                      case 'LOCATION':  return '#10b981';
                      case 'GROUP':     return '#f59e0b';
                      case 'OBJECT':    return '#ef4444';
                      case 'EVENT':     return '#ca5cf6';
                      default:          return '#9ca3af';
                    }
                  };
                  const color = getEntityColor(o.type);
                  return (
                    <div key={o.id} style={{ 
                      background: `${color}11`, 
                      border: `1px solid ${color}33`, 
                      borderLeft: `3px solid ${color}`, 
                      padding: '8px 10px', 
                      borderRadius: 6 
                    }}>
                      <p style={{ color: '#fff', fontSize: 12, margin: 0, fontWeight: 500 }}>{o.name}</p>
                      <p style={{ color: color, fontSize: 10, margin: 0, textTransform: 'uppercase', fontWeight: 'bold', opacity: 0.9 }}>
                        {o.type}
                      </p>
                    </div>
                  );
                })
            )}
          </div>
        </section>

        {isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s ease' }}>
            <div style={{ height: '1px', background: '#2e2e4e' }} />

            <section>
              <p style={{ color: '#ca5cf6', fontSize: 11, marginBottom: 4, fontWeight: 600 }}>HOTSPOTS (AVG IMPACT)</p>
              <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>
                Locations with the highest density of high-importance events.
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: hotspots.length > 1 ? '1fr 1fr' : '1fr', 
                gap: 16 
              }}>
                {hotspots.map(h => (
                  <div key={h.location}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: 12 }}>
                      <span>{h.location}</span>
                      <span style={{ color: '#ca5cf6', fontWeight: 'bold' }}>{h.average_impact.toFixed(1)}</span>
                    </div>
                    <div style={barBg}><div style={{ ...barFg, background: '#ca5cf6', width: `${(h.average_impact / 5) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </section>

            <Card title="SOCIAL CENTRALITY (Ranking)">
              <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 12, marginTop: -6 }}>
                Characters with the highest number of direct connections with other characters.
              </p>
              {centrality.slice(0, 5).map((c, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#fff' }}>
                    <span>{c.character}</span>
                    <span style={{ opacity: 0.6 }}>{c.connection_count} rels</span>
                  </div>
                  <div style={barBg}>
                    <div style={{ ...barFg, background: '#6366f1', width: `${(c.connection_count / (centrality[0]?.connection_count || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </Card>

            <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ color: '#6b7280', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Narrative Audits</p>
              <p style={{ color: '#4b5563', fontSize: 12, marginTop: -8 }}>Automatic detection of structural inconsistencies.</p>
              <AuditSection title="NARRATIVE ORPHANS" description="Characters without a defined origin (missing BORN_IN relationship)." data={narrativeOrphans} color="#6366f1" isExpanded={isExpanded} />
              <AuditSection title="ISOLATED CHARACTERS" description="Characters that doesn't have any relation with any other character." data={isolatedCharacters} color="#6366f1" isExpanded={isExpanded} />
              <AuditSection title="EMPTY STAGES" description="Decorative locations: no residents or associated events." data={emptyStages} color="#10b981" isExpanded={isExpanded} />
              <AuditSection title="GHOST EVENTS" description="Occurrences without registered participants or witnesses." data={ghostEvents} color="#ca5cf6" isExpanded={isExpanded} />
              <AuditSection title="CONSEQUENCE GAPS" description="Dead ends: events that do not trigger other occurrences (causality)." data={consequenceGaps} color="#ca5cf6" isExpanded={isExpanded} />
              <AuditSection title="FORGOTTEN OBJECTS" description="Items with no owner, creator, or role in any story event." data={forgottenObjects} color="#ef4444" isExpanded={isExpanded} />
              <AuditSection title="EMPTY GROUPS" description="Active groups with no active members." data={emptyGroups} color="#f59e0b" isExpanded={isExpanded} />
            </section>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

function AuditSection({ title, description, data, color, isExpanded }: any) {
  if (data.length === 0) return null;
  return (
    <div style={{ animation: 'fadeIn 0.3s ease', marginBottom: 10 }}>
      <p style={{ color: color, fontSize: 11, marginBottom: 2, fontWeight: 700 }}>{title}</p>
      {isExpanded && <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 6 }}>{description}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: isExpanded ? '1fr 1fr' : '1fr', gap: 4 }}>
        {data.map((item: any) => (
          <div key={item.id} style={{ background: '#1e1e2e', padding: '4px 8px', borderRadius: 4, borderLeft: `2px solid ${color}` }}>
            <span style={{ color: '#fff', fontSize: 10 }}>{item.name}</span>
          </div>
        ))}
      </div>
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
      <p style={{ color: '#6b7280', fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase' }}>{title}</p>
      {children}
    </div>
  );
}

const barBg: any = { width: '100%', height: 4, background: '#2e2e4e', borderRadius: 2, marginTop: 4 };
const barFg: any = { height: '100%', borderRadius: 2, transition: 'width 0.5s ease' };