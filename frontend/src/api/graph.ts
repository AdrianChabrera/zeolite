import axios from 'axios';
import type { GraphRelationship } from '../types/graph';

const API = 'http://localhost:8000/api';

export async function fetchAllRelationships(): Promise<GraphRelationship[]> {
  const { data } = await axios.get<GraphRelationship[]>(`${API}/relationships`);
  return data;
}

export async function fetchAllNodes() {
  const [characters, locations, groups, objects, events] = await Promise.all([
    axios.get(`${API}/characters`),
    axios.get(`${API}/locations`),
    axios.get(`${API}/groups`),
    axios.get(`${API}/objects`),
    axios.get(`${API}/events`),
  ]);
  return [
    ...characters.data.map((n: any) => ({ ...n, entityType: 'Character' })),
    ...locations.data.map((n: any) => ({ ...n, entityType: 'Location' })),
    ...groups.data.map((n: any) => ({ ...n, entityType: 'Group' })),
    ...objects.data.map((n: any) => ({ ...n, entityType: 'Object' })),
    ...events.data.map((n: any) => ({ ...n, entityType: 'Event' })),
  ];
}

export async function fetchValidRelationshipTypes(
  fromType: string,
  toType: string
): Promise<string[]> {
  const { data } = await axios.get(`${API}/relationships/valid-types`, {
    params: { from_type: fromType, to_type: toType },
  });
  return data;
}

export async function createRelationship(payload: {
  from_id: string;
  from_type: string;
  to_id: string;
  to_type: string;
  relationship_type: string;
  description?: string;
}) {
  const { data } = await axios.post(`${API}/relationships`, payload);
  return data;
}

export async function getRelationship(id: string): Promise<GraphRelationship> {
  const { data } = await axios.get<GraphRelationship[]>(`${API}/relationships`);
  const rel = data.find(r => r.id === id);
  if (!rel) throw new Error('Relationship not found');
  return rel;
}

export async function updateRelationship(
  id: string,
  payload: { relationship_type: string; description?: string }
) {
  const { data } = await axios.put(`${API}/relationships/${id}`, payload);
  return data;
}

export async function deleteRelationship(id: string) {
  await axios.delete(`${API}/relationships/${id}`);
}