import type { Node, Edge } from '@xyflow/react';
import type { GraphRelationship, EntityType } from '../types/graph';

const ENTITY_COLORS: Record<EntityType, string> = {
  Character: '#6366f1',
  Location:  '#10b981',
  Group:     '#f59e0b',
  Object:    '#ef4444',
  Event:     '#ca5cf6',
};

export function buildGraph(
  allNodes: { id: string; name: string; entityType: EntityType }[],
  relationships: GraphRelationship[]
): { nodes: Node[]; edges: Edge[] } {

  const total = allNodes.length;
  const radius = Math.max(250, total * 70);

  const nodes: Node[] = allNodes.map((entity, i) => {
    const angle = (2 * Math.PI * i) / total;
    return {
      id: entity.id,
      type: 'floatingNode',
      data: {
        label: `${entity.name}\n(${entity.entityType})`,
        entityType: entity.entityType,
        name: entity.name,
      },
      position: {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
      },
      style: {
        background: ENTITY_COLORS[entity.entityType],
        color: '#fff',
        borderRadius: 8,
        padding: '8px 14px',
        fontSize: 13,
        border: 'none',
        whiteSpace: 'pre-line',
      },
    };
  });

  const edges: Edge[] = relationships.map((rel) => {
    const samePair = relationships.filter(
      r => (r.from_id === rel.from_id && r.to_id === rel.to_id) ||
           (r.from_id === rel.to_id   && r.to_id === rel.from_id)
    );
    
    const index = samePair.findIndex(r => r.id === rel.id);
    const totalPair = samePair.length;

    let edgeOffset = 0;
    
    if (totalPair > 1) {
      const step = 45; 
      const baseOffset = (index - (totalPair - 1) / 2) * step;

      const isReversed = rel.from_id > rel.to_id; 
      edgeOffset = isReversed ? -baseOffset : baseOffset;
    }

    return {
      id: rel.id,
      source: rel.from_id,
      target: rel.to_id,
      label: rel.relationship_type,
      type: 'floating',
      animated: false,
      style: { stroke: '#94a3b8' },
      data: { edgeOffset },
    };
  });

  return { nodes, edges };
}