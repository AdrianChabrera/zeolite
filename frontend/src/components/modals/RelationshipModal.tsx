import { useEffect, useState } from 'react';
import { fetchValidRelationshipTypes, createRelationship } from '../../api/graph';
import styles from '../Modal.module.css';

interface Props {
  fromId: string;
  fromType: string;
  fromName: string;
  toId: string;
  toType: string;
  toName: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function RelationshipModal({
  fromId, fromType, fromName,
  toId, toType, toName,
  onClose, onCreated,
}: Props) {
  const [validTypes, setValidTypes] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchValidRelationshipTypes(fromType, toType)
      .then((types) => {
        setValidTypes(types);
        setSelected(types[0] ?? '');
      })
      .catch(() => setError(`No valid relations between ${fromType} and ${toType}`))
      .finally(() => setLoading(false));
  }, [fromType, toType]);

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await createRelationship({
        from_id: fromId,
        from_type: fromType,
        to_id: toId,
        to_type: toType,
        relationship_type: selected,
        description: description || undefined,
      });
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Error creating relation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>New Relationship</h2>
        <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>
          <span style={{ color: '#f3f4f6' }}>{fromName}</span>
          {' → '}
          <span style={{ color: '#f3f4f6' }}>{toName}</span>
        </p>

        {loading && <p style={{ color: '#9ca3af', fontSize: 13 }}>Loading valid types…</p>}

        {!loading && (
          <>
            {error && <p className={styles.error}>{error}</p>}

            {!error && (
              <>
                <label>
                  Relationship type
                  <select value={selected} onChange={e => setSelected(e.target.value)}>
                    {validTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label>
                  Description (optional)
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Context or notes about this relationship…"
                  />
                </label>
              </>
            )}

            <div className={styles.actions}>
              <button className={styles.cancel} onClick={onClose}>Cancel</button>
              {!error && (
                <button
                  className={styles.submit}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Creating…' : 'Create'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}