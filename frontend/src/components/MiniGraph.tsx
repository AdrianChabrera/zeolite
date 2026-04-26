import React from 'react';

const DEFAULT_COLORS: Record<string, string> = {
  Character: '#6366f1',
  Location:  '#10b981',
  Group:     '#f59e0b',
  Object:    '#ef4444',
  Event:     '#ca5cf6',
};

interface Connection {
  entity: string;
  type: string;
  relation: string;
}

interface MiniGraphProps {
  centralNode: string;
  connections: Connection[];
  entityColors?: Record<string, string>;
}

const MiniGraph: React.FC<MiniGraphProps> = ({ 
  centralNode, 
  connections = [],
  entityColors = DEFAULT_COLORS 
}) => {
  const safeConnections = Array.isArray(connections) 
      ? connections.filter(rel => rel && rel.entity) 
      : [];
  const total = safeConnections.length;

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '400px',
      padding: '40px'
    }}>
      <div style={{
        width: 85,
        height: 85,
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.15)',
        border: '2px solid #6366f1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        zIndex: 20,
        boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)',
        padding: '8px',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      }}>
        {centralNode || 'Unknown'} 
      </div>

      {safeConnections.map((rel, i) => {
        const angle = (i / total) * Math.PI * 2;
        
        const baseRadius = total > 8 ? 160 : 135;
        const radius = total > 10 ? (i % 2 === 0 ? baseRadius : baseRadius + 45) : baseRadius;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const color = entityColors[rel.type] || '#9ca3af';

        return (
          <div 
            key={`${rel.entity}-${i}`} 
            style={{ 
              position: 'absolute', 
              transform: `translate(${x}px, ${y}px)`, 
              zIndex: 11 
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: '-16px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              fontSize: '7px', 
              fontWeight: 900, 
              color: color, 
              textTransform: 'uppercase', 
              whiteSpace: 'nowrap',
              letterSpacing: '0.5px',
              opacity: 0.8
            }}>
              {(rel.relation || '').replace('_', ' ')}
            </div>

            <div style={{ 
              background: '#1e1e2e', 
              border: `1px solid ${color}88`, 
              padding: '5px 12px', 
              borderRadius: '4px', 
              color: '#fff', 
              fontSize: '10px', 
              whiteSpace: 'nowrap', 
              boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
              {rel.entity || 'Unknown'}
            </div>

            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              width: radius, 
              height: '1px', 
              background: `linear-gradient(to left, ${color}33, transparent)`, 
              transformOrigin: 'left center', 
              transform: `rotate(${angle + Math.PI}rad)`, 
              zIndex: -1 
            }} />
          </div>
        );
      })}
    </div>
  );
};

export default MiniGraph;