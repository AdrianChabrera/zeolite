import { useState } from 'react';
import { createLocation } from '../../api/entities';
import styles from '../modal.module.css';

interface Props { onClose: () => void; onCreated: () => void; }

const CATEGORIES = ['Settlement','City','Village','Fortress','Tavern','Region','Mountain','Forest','River','Cave','Landmark','Ruins','Portal','Other'];
const CORE_ATTRIBUTES = ['name', 'description', 'category', 'id'];

export default function LocationModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState<Record<string, any>>({ 
    name: '', 
    description: '', 
    category: 'City' 
  });
  const [newAttrKey, setNewAttrKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const addAttribute = () => {
    const key = newAttrKey.trim();
    if (key && !form[key]) {
      set(key, "");
      setNewAttrKey('');
    }
  };

  const removeAttribute = (key: string) => {
    setForm(({ [key]: _, ...rest }) => rest);
  };

  const handleSubmit = async () => {
    if (!form.name) { setError('Name is required'); return; }
    try {
      const payload = { ...form, id: crypto.randomUUID() };
      await createLocation(payload);
      onCreated(); onClose();
    } catch { setError('Error creating location'); }
  };

  const customAttributes = Object.keys(form).filter(key => !CORE_ATTRIBUTES.includes(key));

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.modal} 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxHeight: '90vh', 
          overflowY: 'auto',
          width: '800px', 
          maxWidth: '95vw'
        }}
      >
        <h2>New Location</h2>
        {error && <p className={styles.error}>{error}</p>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
            <label>Location Name
              <input value={form.name} onChange={e => set('name', e.target.value)} />
            </label>
            <label>Category
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
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
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '15px', borderTop: '1px solid #2e2e4e', paddingTop: '15px' }}>
              <p style={{ fontSize: '10px', color: '#6366f1', textTransform: 'uppercase', fontWeight: 'bold', margin: 0 }}>Additional Details</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {customAttributes.map(key => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', color: '#9ca3af' }}>{key}</label>
                      <button 
                        type="button"
                        onClick={() => removeAttribute(key)} 
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px' }}
                      >
                        REMOVE
                      </button>
                    </div>
                    <textarea value={form[key]} onChange={e => set(key, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ 
            marginTop: '10px', padding: '15px', background: 'rgba(99, 102, 241, 0.05)', 
            borderRadius: '6px', border: '1px dashed #2e2e4e', display: 'flex', gap: '10px', alignItems: 'center'
          }}>
            <input 
              placeholder="Add detail (e.g. Climate, Population)..." 
              value={newAttrKey} 
              onChange={e => setNewAttrKey(e.target.value)} 
              style={{ flex: 1, marginBottom: 0 }}
            />
            <button 
              type="button"
              onClick={addAttribute} 
              className={styles.submit} 
              style={{ padding: '0 25px', height: '40px', fontSize: '12px', width: 'auto' }}
            >
              + Add Field
            </button>
          </div>
        </div>

        <div className={styles.actions} style={{ marginTop: '30px' }}>
          <button className={styles.cancel} onClick={onClose}>Cancel</button>
          <button className={styles.submit} onClick={handleSubmit}>Create Location</button>
        </div>
      </div>
    </div>
  );
}