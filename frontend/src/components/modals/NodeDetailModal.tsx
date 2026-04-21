import { useEffect, useState } from 'react';
import styles from '../Modal.module.css';
import nodeStyles from './NodeDetailModal.module.css';
import {
  getCharacter, getLocation, getGroup, getObject, getEvent,
  updateCharacter, updateLocation, updateGroup, updateObject, updateEvent,
  deleteCharacter, deleteLocation, deleteGroup, deleteObject, deleteEvent,
} from '../../api/entities';

interface Props {
  id: string;
  entityType: string;
  onClose: () => void;
  onUpdated: () => void;
}

const CATEGORY_OPTIONS = [
  'Settlement','City','Village','Fortress','Tavern','Region',
  'Mountain','Forest','River','Cave','Landmark','Ruins','Portal','Other',
];

const getFn: Record<string, (id: string) => Promise<any>> = {
  Character: (id) => getCharacter(id).then(r => r.data),
  Location:  (id) => getLocation(id).then(r => r.data),
  Group:     (id) => getGroup(id).then(r => r.data),
  Object:    (id) => getObject(id).then(r => r.data),
  Event:     (id) => getEvent(id).then(r => r.data),
};

const updateFn: Record<string, (id: string, data: object) => Promise<any>> = {
  Character: updateCharacter,
  Location:  updateLocation,
  Group:     updateGroup,
  Object:    updateObject,
  Event:     updateEvent,
};

const deleteFn: Record<string, (id: string) => Promise<any>> = {
  Character: deleteCharacter,
  Location:  deleteLocation,
  Group:     deleteGroup,
  Object:    deleteObject,
  Event:     deleteEvent,
};

const ENTITY_COLORS: Record<string, string> = {
  Character: '#6366f1',
  Location:  '#10b981',
  Group:     '#f59e0b',
  Object:    '#ef4444',
  Event:     '#ca5cf6',
};

export default function NodeDetailModal({ id, entityType, onClose, onUpdated }: Props) {
  const [data, setData]       = useState<Record<string, any> | null>(null);
  const [form, setForm]       = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getFn[entityType]?.(id)
      .then((d) => { setData(d); setForm(d); })
      .catch(() => setError('Could not load entity data.'))
      .finally(() => setLoading(false));
  }, [id, entityType]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateFn[entityType]?.(id, form);
      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Error updating entity.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFn[entityType]?.(id);
      onUpdated();
      onClose();
    } catch {
      setError('Error deleting entity.');
    }
  };

  const accentColor = ENTITY_COLORS[entityType] ?? '#6366f1';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={nodeStyles.header}>
          <span className={nodeStyles.badge} style={{ background: accentColor }}>
            {entityType}
          </span>
          <h2 className={nodeStyles.title}>{data?.name ?? '…'}</h2>
        </div>

        {loading && <p style={{ color: '#9ca3af', fontSize: 13 }}>Loading…</p>}
        {error   && <p className={styles.error}>{error}</p>}

        {!loading && !error && (
          <>
            {entityType === 'Character' && (
              <>
                <label>Name<input value={form.name ?? ''} onChange={e => set('name', e.target.value)} /></label>
                <label>Race<input value={form.race ?? ''} onChange={e => set('race', e.target.value)} /></label>
                <label>Age<input type="number" value={form.age ?? ''} onChange={e => set('age', parseInt(e.target.value))} /></label>
                <label>Status
                  <select value={form.status ?? 'Alive'} onChange={e => set('status', e.target.value)}>
                    <option value="Alive">Alive</option>
                    <option value="Deceased">Deceased</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </label>
                <label>Biography<textarea value={form.biography ?? ''} onChange={e => set('biography', e.target.value)} /></label>
                <label>Personality<textarea value={form.personality ?? ''} onChange={e => set('personality', e.target.value)} /></label>
                <label>Appearance<textarea value={form.appearance ?? ''} onChange={e => set('appearance', e.target.value)} /></label>
              </>
            )}

            {entityType === 'Location' && (
              <>
                <label>Name<input value={form.name ?? ''} onChange={e => set('name', e.target.value)} /></label>
                <label>Description<textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} /></label>
                <label>Category
                  <select value={form.category ?? 'City'} onChange={e => set('category', e.target.value)}>
                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              </>
            )}

            {entityType === 'Group' && (
              <>
                <label>Name<input value={form.name ?? ''} onChange={e => set('name', e.target.value)} /></label>
                <label>Description<textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} /></label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={form.is_active ?? true} onChange={e => set('is_active', e.target.checked)} />
                  Active
                </label>
              </>
            )}

            {entityType === 'Object' && (
              <>
                <label>Name<input value={form.name ?? ''} onChange={e => set('name', e.target.value)} /></label>
                <label>Description<textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} /></label>
              </>
            )}

            {entityType === 'Event' && (
              <>
                <label>Name<input value={form.name ?? ''} onChange={e => set('name', e.target.value)} /></label>
                <label>Description<textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} /></label>
                <label>Importance (1–5)
                  <input type="number" min="1" max="5" value={form.importance ?? 1} onChange={e => set('importance', parseInt(e.target.value))} />
                </label>
              </>
            )}

            {!confirmDelete ? (
              <div className={styles.actions}>
                <button
                  className={nodeStyles.deleteBtn}
                  onClick={() => setConfirmDelete(true)}
                >
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
                <p>Are you sure? This will also delete all its relationships.</p>
                <div className={styles.actions}>
                  <button className={styles.cancel} onClick={() => setConfirmDelete(false)}>No, go back</button>
                  <button className={nodeStyles.deleteBtn} onClick={handleDelete}>Yes, delete</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}