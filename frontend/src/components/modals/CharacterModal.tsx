import { useState } from 'react';
import { createCharacter } from '../../api/entities';
import styles from '../modal.module.css';

interface Props { onClose: () => void; onCreated: () => void; }

const CORE_ATTRIBUTES = ['name', 'race', 'age', 'status', 'biography', 'personality', 'appearance'];

export default function CharacterModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState<Record<string, any>>({
    name: '', race: '', age: '', status: 'Alive',
    biography: '', personality: '', appearance: '',
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
    if (!form.name || !form.race || !form.age) {
      setError('Name, race and age are required'); 
      return;
    }
    try {
      const payload = { 
        ...form, 
        id: crypto.randomUUID(), 
        age: parseInt(form.age) 
      };
      await createCharacter(payload);
      onCreated();
      onClose();
    } catch { 
      setError('Error creating character'); 
    }
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
        <h2>New Character</h2>
        {error && <p className={styles.error}>{error}</p>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px' }}>
            <label>Name<input value={form.name} onChange={e => set('name', e.target.value)} /></label>
            <label>Race<input value={form.race} onChange={e => set('race', e.target.value)} /></label>
            <label>Age<input type="number" value={form.age} onChange={e => set('age', e.target.value)} /></label>
          </div>

          <label>Status
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="Alive">Alive</option>
              <option value="Deceased">Deceased</option>
              <option value="Unknown">Unknown</option>
            </select>
          </label>

          <label>Biography<textarea style={{ minHeight: '120px' }} value={form.biography} onChange={e => set('biography', e.target.value)} /></label>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <label>Personality<textarea style={{ minHeight: '100px' }} value={form.personality} onChange={e => set('personality', e.target.value)} /></label>
            <label>Appearance<textarea style={{ minHeight: '100px' }} value={form.appearance} onChange={e => set('appearance', e.target.value)} /></label>
          </div>

          {customAttributes.length > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '15px', borderTop: '1px solid #2e2e4e', paddingTop: '15px' }}>
              <p style={{ fontSize: '10px', color: '#6366f1', textTransform: 'uppercase', fontWeight: 'bold', margin: 0 }}>Additional Details</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {customAttributes.map(key => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', color: '#9ca3af' }}>{key}</label>
                      <button onClick={() => removeAttribute(key)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px' }}>REMOVE</button>
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
              placeholder="Add detail (e.g. Height)..." 
              value={newAttrKey} 
              onChange={e => setNewAttrKey(e.target.value)} 
              style={{ flex: 1, marginBottom: 0 }}
            />
            <button onClick={addAttribute} className={styles.submit} style={{ padding: '0 25px', height: '40px', fontSize: '12px', width: 'auto' }}>+ Add Field</button>
          </div>
        </div>

        <div className={styles.actions} style={{ marginTop: '30px' }}>
          <button className={styles.cancel} onClick={onClose}>Cancel</button>
          <button className={styles.submit} onClick={handleSubmit}>Create Character</button>
        </div>
      </div>
    </div>
  );
}