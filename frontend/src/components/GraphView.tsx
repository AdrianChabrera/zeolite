import { useEffect, useState, useCallback, useRef } from 'react';
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
} from '@xyflow/react';

import { fetchAllRelationships, fetchAllNodes } from '../api/graph';
import { buildGraph } from '../utils/buildGraph';
import FloatingNode from './FloatingNode';
import FloatingEdge from './FloatingEdge';
import RelationshipModal from './modals/RelationshipModal';
import NodeDetailModal from './modals/NodeDetailModal';
import RelationshipDetailModal from './modals/RelationshipDetailModal';

const nodeTypes = { floatingNode: FloatingNode };
const edgeTypes  = { floating: FloatingEdge };

interface PendingConnection {
  fromId: string;
  fromType: string;
  fromName: string;
  toId: string;
  toType: string;
  toName: string;
}

export default function GraphView() {
  const [nodes, setNodes, onNodesChange] = useNodesState<XYNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<XYEdge>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [pending, setPending] = useState<PendingConnection | null>(null);
  const [selectedNode, setSelectedNode] = useState<{ id: string; entityType: string } | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const setNodesRef = useRef(setNodes);
  const setEdgesRef = useRef(setEdges);

  const load = useCallback(() => {
    Promise.all([fetchAllNodes(), fetchAllRelationships()])
      .then(([allNodes, relationships]) => {
        const { nodes: n, edges: e } = buildGraph(allNodes, relationships);
        setNodesRef.current(n);
        setEdgesRef.current(e);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load graph data.');
        setLoading(false);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

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
    setSelectedNode({
      id: node.id,
      entityType: node.data.entityType as string,
    });
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: XYEdge) => {
    setSelectedEdge(edge.id);
  }, []);

  if (loading) return <p style={{ padding: 24, color: '#9ca3af' }}>Loading graph…</p>;
  if (error)   return <p style={{ padding: 24, color: '#f87171' }}>{error}</p>;

  return (
    <>
      <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
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