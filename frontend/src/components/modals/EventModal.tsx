import { useState } from 'react';
import { createEvent } from '../../api/entities';
import styles from '../modal.module.css';

interface Props { onClose: () => void; onCreated: () => void; }

const CORE_ATTRIBUTES = ['name', 'description', 'importance'];

export default function EventModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState<Record<string, any>>({ 
    name: '', 
    description: '', 
    importance: 1 
  });
  const [newAttrKey, setNewAttrKey] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async () => {
    if (!form.name) { setError('Name is required'); return; }
    try {
      const payload = {
        ...form,
        id: crypto.randomUUID(),
        importance: parseInt(form.importance)
      };
      await createEvent(payload);
      onCreated(); 
      onClose();
    } catch { setError('Error creating event'); }
  };

  const customAttributes = Object.keys(form).filter(key => !CORE_ATTRIBUTES.includes(key));

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.modal} 
        onClick={e => e.stopPropagation()}
        style={{ width: '800px', maxWidth: '95vw' }}
      >
        <h2>New Event</h2>
        {error && <p className={styles.error}>{error}</p>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '15px' }}>
            <label>Event Name
              <input value={form.name} onChange={e => set('name', e.target.value)} />
            </label>
            <label>Importance (1-5)
              <input type="number" min="1" max="5" value={form.importance} onChange={e => set('importance', e.target.value)} />
            </label>
          </div>

          <label>Description
            <textarea 
              style={{ minHeight: '120px' }} 
              value={form.description} 
              onChange={e => set('description', e.target.value)} 
            />
          </label>

          {customAttributes.length > 0 && (
            <div style={{ borderTop: '1px solid #2e2e4e', paddingTop: '15px' }}>
              <p style={{ fontSize: '10px', color: '#6366f1', fontWeight: 'bold', marginBottom: '15px' }}>ADDITIONAL DETAILS</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {customAttributes.map(key => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', color: '#9ca3af' }}>{key}</label>
                      <button onClick={() => removeAttribute(key)} style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '10px', cursor: 'pointer' }}>REMOVE</button>
                    </div>
                    <textarea value={form[key]} onChange={e => set(key, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ 
            marginTop: '10px', padding: '15px', background: 'rgba(99, 102, 241, 0.05)', 
            borderRadius: '6px', border: '1px dashed #2e2e4e', display: 'flex', gap: '10px' 
          }}>
            <input 
              placeholder="Add extra info (e.g. Date, Consequences)..." 
              value={newAttrKey} 
              onChange={e => setNewAttrKey(e.target.value)} 
              style={{ flex: 1, marginBottom: 0 }}
            />
            <button onClick={addAttribute} className={styles.submit} style={{ width: 'auto', padding: '0 20px' }}>+ Add Field</button>
          </div>
        </div>

        <div className={styles.actions} style={{ marginTop: '30px' }}>
          <button className={styles.cancel} onClick={onClose}>Cancel</button>
          <button className={styles.submit} onClick={handleSubmit}>Create Event</button>
        </div>
      </div>
    </div>
  );
}