import { useEffect, useState } from 'react';
import styles from '../Modal.module.css';
import nodeStyles from './NodeDetailModal.module.css';
import {
  getRelationship,
  updateRelationship,
  deleteRelationship,
  fetchValidRelationshipTypes,
} from '../../api/graph';

interface Props {
  id: string;
  onClose: () => void;
  onUpdated: () => void;
}

export default function RelationshipDetailModal({ id, onClose, onUpdated }: Props) {
  const [rel, setRel]             = useState<any>(null);
  const [validTypes, setValidTypes] = useState<string[]>([]);
  const [relType, setRelType]     = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getRelationship(id)
      .then(async (r) => {
        setRel(r);
        setRelType(r.relationship_type);
        setDescription(r.description ?? '');
        const types = await fetchValidRelationshipTypes(r.from_type, r.to_type);
        setValidTypes(types);
      })
      .catch(() => setError('Could not load relationship data.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateRelationship(id, {
        relationship_type: relType,
        description: description || undefined,
      });
      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Error updating relationship.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRelationship(id);
      onUpdated();
      onClose();
    } catch {
      setError('Error deleting relationship.');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={nodeStyles.header}>
          <span className={nodeStyles.badge} style={{ background: '#94a3b8' }}>
            Relationship
          </span>
          <h2 className={nodeStyles.title}>{rel?.relationship_type ?? '…'}</h2>
        </div>

        {loading && <p style={{ color: '#9ca3af', fontSize: 13 }}>Loading…</p>}
        {error   && <p className={styles.error}>{error}</p>}

        {!loading && !error && rel && (
          <>
            <div style={{
              background: '#12121e', border: '1px solid #2e2e4e',
              borderRadius: 8, padding: '10px 14px',
              fontSize: 13, color: '#9ca3af', display: 'flex', gap: 8,
            }}>
              <span style={{ color: '#f3f4f6' }}>{rel.from_name}</span>
              <span>({rel.from_type})</span>
              <span>→</span>
              <span style={{ color: '#f3f4f6' }}>{rel.to_name}</span>
              <span>({rel.to_type})</span>
            </div>

            <label>
              Relationship type
              <select value={relType} onChange={e => setRelType(e.target.value)}>
                {validTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label>
              Description (optional)
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Context or notes…"
              />
            </label>

            {!confirmDelete ? (
              <div className={styles.actions}>
                <button className={nodeStyles.deleteBtn} onClick={() => setConfirmDelete(true)}>
                  Delete
                </button>
                <div style={{ flex: 1 }} />
                <button className={styles.cancel} onClick={onClose}>Cancel</button>
                <button className={styles.submit} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            ) : (
              <div className={nodeStyles.confirmDelete}>
                <p>Are you sure you want to delete this relationship?</p>
                <div className={styles.actions}>
                  <button className={styles.cancel} onClick={() => setConfirmDelete(false)}>
                    No, go back
                  </button>
                  <button className={nodeStyles.deleteBtn} onClick={handleDelete}>
                    Yes, delete
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}