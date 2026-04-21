import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node as XYNode,
  type Edge as XYEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeChange,
  applyNodeChanges,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';

import { fetchAllRelationships, fetchAllNodes } from '../api/graph';
import { buildGraph, saveNodePositions, buildCircularPositions } from '../utils/buildGraph';
import FloatingNode from './FloatingNode';
import FloatingEdge from './FloatingEdge';
import RelationshipModal from './modals/RelationshipModal';
import NodeDetailModal from './modals/NodeDetailModal';
import RelationshipDetailModal from './modals/RelationshipDetailModal';
import type { EntityType } from '../types/graph';

const nodeTypes = { floatingNode: FloatingNode };
const edgeTypes  = { floating: FloatingEdge };

interface PendingConnection {
  fromId: string; fromType: string; fromName: string;
  toId: string;   toType: string;   toName: string;
}

interface Props {
  onLoadReady?: (loadFn: () => void) => void;
  hiddenTypes: Set<EntityType>;
  searchQuery: string;
}

function GraphViewInner({ onLoadReady, hiddenTypes, searchQuery }: Props) {
  const [nodes, setNodes] = useNodesState<XYNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<XYEdge>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [pending, setPending] = useState<PendingConnection | null>(null);
  const [selectedNode, setSelectedNode] = useState<{ id: string; entityType: string } | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [searchIndex, setSearchIndex] = useState(0);
  const setNodesRef = useRef(setNodes);
  const setEdgesRef = useRef(setEdges);

  const { fitBounds } = useReactFlow();

  const load = useCallback(() => {
    Promise.all([fetchAllNodes(), fetchAllRelationships()])
      .then(([allNodes, relationships]) => {
        const { nodes: n, edges: e } = buildGraph(allNodes, relationships);
        saveNodePositions(n);
        setNodesRef.current(n);
        setEdgesRef.current(e);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load graph data.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    onLoadReady?.(load);
    load();
  }, [load, onLoadReady]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchIndex(0);
  }, [searchQuery]);

  const matchedNodes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return nodes.filter(n =>
      (n.data.name as string)?.toLowerCase().includes(q)
    );
  }, [nodes, searchQuery]);

  useEffect(() => {
    if (matchedNodes.length === 0) return;
    const idx = Math.min(searchIndex, matchedNodes.length - 1);
    const node = matchedNodes[idx];
    const W = 130, H = 40;
    fitBounds(
      { x: node.position.x - 20, y: node.position.y - 20, width: W + 40, height: H + 40 },
      { duration: 500, padding: 0.6 }
    );
  }, [matchedNodes, searchIndex, fitBounds]);

  const visibleNodes = useMemo(() => {
    if (hiddenTypes.size === 0 && !searchQuery.trim()) return nodes;
    const matchedIds = new Set(matchedNodes.map(n => n.id));
    return nodes.map(n => ({
      ...n,
      hidden: hiddenTypes.has(n.data.entityType as EntityType),
      style: {
        ...n.style,
        outline: (searchQuery.trim() && matchedIds.has(n.id))
          ? '2px solid #fbbf24'
          : 'none',
        boxShadow: (searchQuery.trim() && matchedIds.has(n.id))
          ? '0 0 0 3px #fbbf2466'
          : 'none',
      },
    }));
  }, [nodes, hiddenTypes, searchQuery, matchedNodes]);

  const hiddenNodeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const n of nodes) {
      if (hiddenTypes.has(n.data.entityType as EntityType)) ids.add(n.id);
    }
    return ids;
  }, [nodes, hiddenTypes]);

  const visibleEdges = useMemo(() => {
    if (hiddenNodeIds.size === 0) return edges;
    return edges.map(e => ({
      ...e,
      hidden: hiddenNodeIds.has(e.source) || hiddenNodeIds.has(e.target),
    }));
  }, [edges, hiddenNodeIds]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes(prev => {
      const next = applyNodeChanges(changes, prev);
      const hasDragEnd = changes.some(
        c => c.type === 'position' && (c as any).dragging === false
      );
      if (hasDragEnd) saveNodePositions(next);
      return next;
    });
  }, [setNodes]);

  const resetLayout = useCallback(() => {
    setNodes(prev => {
      const positions = buildCircularPositions(prev);
      const next = prev.map(n => ({ ...n, position: positions[n.id] }));
      saveNodePositions(next);
      return next;
    });
  }, [setNodes]);

  const onConnect = useCallback((connection: Connection) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    if (!sourceNode || !targetNode) return;
    setPending({
      fromId:   sourceNode.id,
      fromType: sourceNode.data.entityType as string,
      fromName: sourceNode.data.name as string,
      toId:     targetNode.id,
      toType:   targetNode.data.entityType as string,
      toName:   targetNode.data.name as string,
    });
  }, [nodes]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: XYNode) => {
    setSelectedNode({ id: node.id, entityType: node.data.entityType as string });
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: XYEdge) => {
    setSelectedEdge(edge.id);
  }, []);

  if (loading) return <p style={{ padding: 24, color: '#9ca3af' }}>Loading graph…</p>;
  if (error)   return <p style={{ padding: 24, color: '#f87171' }}>{error}</p>;

  const safeIndex = matchedNodes.length > 0 ? Math.min(searchIndex, matchedNodes.length - 1) : 0;

  return (
    <>
      <div style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, right: 1250, zIndex: 10 }}>
          <button
            onClick={resetLayout}
            style={{
              background: '#3e3e5e',
              color: '#f3f4f6',
              border: '1px solid #6366f1',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ↺ Reset layout
          </button>
        </div>

        {searchQuery.trim() && (
          <div style={{
            position: 'absolute', bottom: 28, left: 172, zIndex: 20,
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#1e1e2e', border: '1px solid #3e3e5e',
            borderRadius: 8, padding: '5px 10px',
            fontSize: 12, color: '#e2e8f0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}>
            {matchedNodes.length === 0 ? (
              <span style={{ color: '#6b7280' }}>Sin coincidencias</span>
            ) : (
              <>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>
                  {safeIndex + 1} / {matchedNodes.length}
                </span>
                <button
                  onClick={() => setSearchIndex(i => (i - 1 + matchedNodes.length) % matchedNodes.length)}
                  disabled={matchedNodes.length <= 1}
                  title="Anterior"
                  style={{
                    background: 'none', border: '1px solid #3e3e5e', color: '#e2e8f0',
                    borderRadius: 4, width: 22, height: 22, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, padding: 0,
                    opacity: matchedNodes.length <= 1 ? 0.3 : 1,
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={() => setSearchIndex(i => (i + 1) % matchedNodes.length)}
                  disabled={matchedNodes.length <= 1}
                  title="Siguiente"
                  style={{
                    background: 'none', border: '1px solid #3e3e5e', color: '#e2e8f0',
                    borderRadius: 4, width: 22, height: 22, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, padding: 0,
                    opacity: matchedNodes.length <= 1 ? 0.3 : 1,
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>
        )}

        <ReactFlow
          nodes={visibleNodes}
          edges={visibleEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.1}
          maxZoom={2}
        >
          <Background />
          <Controls />
          <MiniMap
            style={{ background: '#1e1e2e', border: '1px solid #3e3e5e', right: 240, bottom: 20 }}
            nodeColor={(node) => node.style?.background as string ?? '#6366f1'}
            maskColor="rgba(0,0,0,0.3)"
          />
        </ReactFlow>
      </div>

      {pending && (
        <RelationshipModal
          {...pending}
          onClose={() => setPending(null)}
          onCreated={() => { setPending(null); load(); }}
        />
      )}
      {selectedNode && (
        <NodeDetailModal
          id={selectedNode.id}
          entityType={selectedNode.entityType}
          onClose={() => setSelectedNode(null)}
          onUpdated={() => { setSelectedNode(null); load(); }}
        />
      )}
      {selectedEdge && (
        <RelationshipDetailModal
          id={selectedEdge}
          onClose={() => setSelectedEdge(null)}
          onUpdated={() => { setSelectedEdge(null); load(); }}
        />
      )}
    </>
  );
}

export default function GraphView(props: Props) {
  return (
    <ReactFlowProvider>
      <GraphViewInner {...props} />
    </ReactFlowProvider>
  );
}