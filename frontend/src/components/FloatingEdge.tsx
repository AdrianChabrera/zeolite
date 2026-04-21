import { type ReactNode } from 'react';
import {
  useInternalNode,
  EdgeLabelRenderer,
  BaseEdge,
  type EdgeProps,
} from '@xyflow/react';
import { getEdgeParams } from '../utils/floatingEdgeUtils';

export default function FloatingEdge({ id, source, target, label, data }: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) return null;

  const { sourceX, sourceY, targetX, targetY } = getEdgeParams(sourceNode, targetNode);

  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  const mx = sourceX + dx / 2;
  const my = sourceY + dy / 2;

  const edgeOffset = (data?.edgeOffset as number) ?? 0;

  let cx = mx;
  let cy = my;

  if (dist > 0 && edgeOffset !== 0) {
    const nx = -dy / dist;
    const ny = dx / dist;

    cx = mx + nx * edgeOffset * 2;
    cy = my + ny * edgeOffset * 2;
  }

  const edgePath = `M ${sourceX},${sourceY} Q ${cx},${cy} ${targetX},${targetY}`;

  const labelX = (mx + cx) / 2;
  const labelY = (my + cy) / 2;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: '#94a3b8' }} />
      {label && (
        <EdgeLabelRenderer>
          <div style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 11,
            color: '#475569',
            background: '#f8fafc',
            padding: '2px 6px',
            borderRadius: 4,
            pointerEvents: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)' 
          }}>
            {label as ReactNode}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}