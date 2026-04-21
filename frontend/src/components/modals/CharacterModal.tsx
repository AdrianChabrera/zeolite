import { useState } from 'react';
import { createCharacter } from '../../api/entities';
import styles from '../modal.module.css';

interface Props { onClose: () => void; onCreated: () => void; }

export default function CharacterModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    name: '', race: '', age: '', status: 'Alive',
    biography: '', personality: '', appearance: '',
  });
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.race || !form.age) {
      setError('Name, race y age are required'); return;
    }
    try {
      await createCharacter({ ...form, age: parseInt(form.age) });
      onCreated();
      onClose();
    } catch { setError('Error creating character'); }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>New Character</h2>
        {error && <p className={styles.error}>{error}</p>}
        <label>Name<input value={form.name} onChange={e => set('name', e.target.value)} /></label>
        <label>Race<input value={form.race} onChange={e => set('race', e.target.value)} /></label>
        <label>Age<input type="number" value={form.age} onChange={e => set('age', e.target.value)} /></label>
        <label>Status
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="Alive">Alive</option>
            <option value="Deceased">Deceased</option>
            <option value="Unknown">Unknown</option>
          </select>
        </label>
        <label>Biography<textarea value={form.biography} onChange={e => set('biography', e.target.value)} /></label>
        <label>Personality<textarea value={form.personality} onChange={e => set('personality', e.target.value)} /></label>
        <label>Appearance<textarea value={form.appearance} onChange={e => set('appearance', e.target.value)} /></label>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>Cancel</button>
          <button className={styles.submit} onClick={handleSubmit}>Create</button>
        </div>
      </div>
    </div>
  );
}