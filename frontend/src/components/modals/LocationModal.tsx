import { useState } from 'react';
import { createLocation } from '../../api/entities';
import styles from '../modal.module.css';

interface Props { onClose: () => void; onCreated: () => void; }

const CATEGORIES = ['Settlement','City','Village','Fortress','Tavern','Region','Mountain','Forest','River','Cave','Landmark','Ruins','Portal','Other'];

export default function LocationModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({ name: '', description: '', category: 'City' });
  const [error, setError] = useState<string | null>(null);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name) { setError('Name is required'); return; }
    try {
      await createLocation(form);
      onCreated(); onClose();
    } catch { setError('Error creating location'); }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>New Location</h2>
        {error && <p className={styles.error}>{error}</p>}
        <label>Name<input value={form.name} onChange={e => set('name', e.target.value)} /></label>
        <label>Description<textarea value={form.description} onChange={e => set('description', e.target.value)} /></label>
        <label>Category
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>Cancel</button>
          <button className={styles.submit} onClick={handleSubmit}>Create</button>
        </div>
      </div>
    </div>
  );
}