import { useEffect, useState } from 'react';
import styles from '../Modal.module.css';
import nodeStyles from './NodeDetailModal.module.css';
import {
  getCharacter, getLocation, getGroup, getObject, getEvent,
  updateCharacter, updateLocation, updateGroup, updateObject, updateEvent,
  deleteCharacter, deleteLocation, deleteGroup, deleteObject, deleteEvent,
  getCharacterFullContext,
} from '../../api/entities';
import MiniGraph from '../MiniGraph';

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

const ENTITY_COLORS: Record<string, string> = {
  Character: '#6366f1',
  Location:  '#10b981',
  Group:     '#f59e0b',
  Object:    '#ef4444',
  Event:     '#ca5cf6',
};

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

const CORE_ATTRIBUTES = ['id', 'name', 'race', 'age', 'status', 'biography', 'personality', 'appearance', 'description', 'category', 'is_active', 'importance'];

export default function NodeDetailModal({ id, entityType, onClose, onUpdated }: Props) {
  const [data, setData]       = useState<Record<string, any> | null>(null);
  const [context, setContext] = useState<any>(null);
  const [form, setForm]       = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newAttrKey, setNewAttrKey] = useState('');

  useEffect(() => {
    const promises = [getFn[entityType]?.(id)];
    if (entityType === 'Character') {
      promises.push(getCharacterFullContext(id).then(r => r.data));
    }

    Promise.all(promises)
      .then(([entityData, contextData]) => {
        setData(entityData);
        setForm(entityData);
        if (contextData) setContext(contextData);
      })
      .catch(() => setError('Could not load entity data.'))
      .finally(() => setLoading(false));
  }, [id, entityType]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const addAttribute = () => {
    if (newAttrKey.trim() && !form[newAttrKey]) {
      set(newAttrKey.trim(), "");
      setNewAttrKey('');
    }
  };

  const removeAttribute = (key: string) => {
    const newForm = { ...form };
    delete newForm[key];
    setForm(newForm);
  };

  const handleSave = async () => {
    setSaving(true);
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
  const hasManyConnections = (context?.connections?.length || 0) > 10;
  const dynamicMaxWidth = hasManyConnections ? '1400px' : '1100px';

  const customAttributes = Object.keys(form).filter(key => !CORE_ATTRIBUTES.includes(key));

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.modal} 
        onClick={e => e.stopPropagation()}
        style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          width: entityType === 'Character' ? '95vw' : '550px',
          maxWidth: entityType === 'Character' ? dynamicMaxWidth : '550px',
          padding: 0, 
          overflow: 'hidden',
          transition: 'max-width 0.3s ease-out'
        }}
      >
        {entityType === 'Character' && (
          <div style={{ 
            flex: (context?.connections?.length || 0) > 10 ? '0 0 50%' : '0 0 35%',
            minWidth: '450px',
            background: '#0a0a14', 
            borderRight: '1px solid #2e2e4e', 
            padding: '30px', 
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <p style={{ color: '#6b7280', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, marginBottom: '10px' }}>
              Character Network
            </p>
            <div style={{ flex: 1, width: '100%', height: '100%' }}>
              <MiniGraph centralNode={data?.name} connections={context?.connections || []} />
            </div>
          </div>
        )}

        <div style={{ flex: 1, padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className={nodeStyles.header}>
            <span className={nodeStyles.badge} style={{ background: accentColor }}>{entityType}</span>
            <h2 className={nodeStyles.title}>{data?.name ?? '…'}</h2>
          </div>

          {loading && <p style={{ color: '#9ca3af', fontSize: 13 }}>Loading…</p>}
          {error && <p className={styles.error}>{error}</p>}

          {!loading && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {entityType === 'Character' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', color: '#9ca3af' }}>Full Name</label>
                    <input value={form.name ?? ''} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', color: '#9ca3af' }}>Race</label>
                      <input value={form.race ?? ''} onChange={e => set('race', e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', color: '#9ca3af' }}>Age</label>
                      <input type="number" value={form.age ?? ''} onChange={e => set('age', parseInt(e.target.value))} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', color: '#9ca3af' }}>Status</label>
                    <select value={form.status ?? 'Alive'} onChange={e => set('status', e.target.value)}>
                      <option value="Alive">Alive</option>
                      <option value="Deceased">Deceased</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', color: '#9ca3af' }}>Biography</label>
                    <textarea style={{ minHeight: '100px' }} value={form.biography ?? ''} onChange={e => set('biography', e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       <label style={{ fontSize: '12px', color: '#9ca3af' }}>Personality</label>
                       <textarea style={{ minHeight: '80px' }} value={form.personality ?? ''} onChange={e => set('personality', e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       <label style={{ fontSize: '12px', color: '#9ca3af' }}>Appearance</label>
                       <textarea style={{ minHeight: '80px' }} value={form.appearance ?? ''} onChange={e => set('appearance', e.target.value)} />
                    </div>
                  </div>
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
                    <input type="checkbox" checked={form.is_active ?? true} onChange={e => set('is_active', e.target.checked)} /> Active
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

              {customAttributes.length > 0 && (
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px', borderTop: '1px solid #2e2e4e', paddingTop: '20px' }}>
                  <p style={{ fontSize: '10px', color: '#6366f1', textTransform: 'uppercase', fontWeight: 'bold' }}>Custom Attributes</p>
                  {customAttributes.map(key => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '12px', color: '#9ca3af' }}>{key}</label>
                        <button onClick={() => removeAttribute(key)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px' }}>REMOVE</button>
                      </div>
                      <textarea value={form[key] ?? ''} onChange={e => set(key, e.target.value)} />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '10px', padding: '15px', background: '#1a1a2e', borderRadius: '6px', border: '1px dashed #2e2e4e', display: 'flex', gap: '10px' }}>
                <input placeholder="Attribute name..." value={newAttrKey} onChange={e => setNewAttrKey(e.target.value)} style={{ flex: 1, margin: 0 }} />
                <button onClick={addAttribute} className={styles.submit} style={{ padding: '0 15px', height: '40px', fontSize: '12px' }}>+ Add</button>
              </div>

              {!confirmDelete ? (
                <div className={styles.actions}>
                  <button className={nodeStyles.deleteBtn} onClick={() => setConfirmDelete(true)}>Delete</button>
                  <div style={{ flex: 1 }} />
                  <button className={styles.cancel} onClick={onClose}>Cancel</button>
                  <button className={styles.submit} onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}