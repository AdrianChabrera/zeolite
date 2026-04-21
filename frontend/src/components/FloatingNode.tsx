import { Handle, Position } from '@xyflow/react';

export default function FloatingNode({ data, style }: any) {
  return (
    <div style={{ ...style, position: 'relative', userSelect: 'none' }}>
      <Handle type="source" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Left}   style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Left}   style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ whiteSpace: 'pre-line' }}>{data.label}</span>
        <Handle
          type="source"
          position={Position.Right}
          id="connect-btn"
          style={{
            position: 'relative',
            transform: 'none',
            top: 'auto', right: 'auto', bottom: 'auto', left: 'auto',
            width: 14, height: 14,
            background: 'rgba(255,255,255,0.3)',
            border: '2px solid rgba(255,255,255,0.7)',
            borderRadius: '50%',
            cursor: 'crosshair',
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  );
}