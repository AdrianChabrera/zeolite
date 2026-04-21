export type EntityType = 'Character' | 'Location' | 'Group' | 'Object' | 'Event';

export interface GraphRelationship {
  id: string;
  from_id: string;
  from_type: EntityType;
  from_name: string;
  to_id: string;
  to_type: EntityType;
  to_name: string;
  relationship_type: string;
  description?: string;
}