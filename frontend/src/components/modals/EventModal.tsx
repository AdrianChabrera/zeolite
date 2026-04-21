import { useState } from 'react';
import { createEvent } from '../../api/entities';
import styles from '../modal.module.css';

interface Props { onClose: () => void; onCreated: () => void; }

export default function EventModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({ name: '', description: '', importance: '1' });
  const [error, setError] = useState<string | null>(null);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name) { setError('Name is required'); return; }
    try {
      await createEvent({ ...form, importance: parseInt(form.importance) });
      onCreated(); onClose();
    } catch { setError('Error creating event'); }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>New Event</h2>
        {error && <p className={styles.error}>{error}</p>}
        <label>Name<input value={form.name} onChange={e => set('name', e.target.value)} /></label>
        <label>Description<textarea value={form.description} onChange={e => set('description', e.target.value)} /></label>
        <label>Importance (1-5)
          <input type="number" min="1" max="5" value={form.importance} onChange={e => set('importance', e.target.value)} />
        </label>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>Cancel</button>
          <button className={styles.submit} onClick={handleSubmit}>Create</button>
        </div>
      </div>
    </div>
  );
}