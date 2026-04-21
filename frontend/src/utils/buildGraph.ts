import type { Node, Edge } from '@xyflow/react';
import type { GraphRelationship, EntityType } from '../types/graph';

const ENTITY_COLORS: Record<EntityType, string> = {
  Character: '#6366f1',
  Location:  '#10b981',
  Group:     '#f59e0b',
  Object:    '#ef4444',
  Event:     '#ca5cf6',
};

const POSITIONS_KEY = 'graph_node_positions';

export function loadSavedPositions(): Record<string, { x: number; y: number }> {
  try {
    return JSON.parse(localStorage.getItem(POSITIONS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saveNodePositions(nodes: Node[]) {
  const positions: Record<string, { x: number; y: number }> = {};
  for (const node of nodes) {
    positions[node.id] = node.position;
  }
  localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions));
}

export function buildCircularPositions(
  nodes: Node[]
): Record<string, { x: number; y: number }> {
  const total  = nodes.length;
  const radius = Math.max(150, total * 30);
  const positions: Record<string, { x: number; y: number }> = {};

  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / total;
    positions[node.id] = {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  });

  return positions;
}

export function buildGraph(
  allNodes: { id: string; name: string; entityType: EntityType }[],
  relationships: GraphRelationship[]
): { nodes: Node[]; edges: Edge[] } {

  const saved  = loadSavedPositions();
  const total  = allNodes.length;
  const radius = Math.max(250, total * 30);

  // Posición circular solo para nodos que no están en localStorage
  const newNodes = allNodes.filter(e => !saved[e.id]);
  const newTotal = newNodes.length;
  const circularPositions: Record<string, { x: number; y: number }> = {};
  newNodes.forEach((entity, i) => {
    const angle = (2 * Math.PI * i) / Math.max(newTotal, 1);
    circularPositions[entity.id] = {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  });

  const nodes: Node[] = allNodes.map((entity) => {
    const position = saved[entity.id] ?? circularPositions[entity.id];

    return {
      id: entity.id,
      type: 'floatingNode',
      data: {
        label: entity.name,
        entityType: entity.entityType,
        name: entity.name,
      },
      position,
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

    const index     = samePair.findIndex(r => r.id === rel.id);
    const totalPair = samePair.length;

    let edgeOffset = 0;
    if (totalPair > 1) {
      const step       = 45;
      const baseOffset = (index - (totalPair - 1) / 2) * step;
      const isReversed = rel.from_id > rel.to_id;
      edgeOffset       = isReversed ? -baseOffset : baseOffset;
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