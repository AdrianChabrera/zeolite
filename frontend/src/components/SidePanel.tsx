import { useState } from 'react';
import CharacterModal from './modals/CharacterModal';
import LocationModal from './modals/LocationModal';
import GroupModal from './modals/GroupModal';
import ObjectModal from './modals/ObjectModal';
import EventModal from './modals/EventModal';

interface Props { onCreated: () => void; }

type ModalType = 'character' | 'location' | 'group' | 'object' | 'event' | null;

const BUTTONS: { type: ModalType; label: string; color: string }[] = [
  { type: 'character', label: 'Character', color: '#6366f1' },
  { type: 'location',  label: 'Location',  color: '#10b981' },
  { type: 'group',     label: 'Group',     color: '#f59e0b' },
  { type: 'object',    label: 'Object',    color: '#ef4444' },
  { type: 'event',     label: 'Event',     color: '#ca5cf6' },

];

export default function SidePanel({ onCreated }: Props) {
  const [open, setOpen] = useState<ModalType>(null);

  return (
    <>
      <div style={{
        position: 'fixed', left: 0, top: 0, height: '100vh',
        width: 160, background: '#12121e', borderRight: '1px solid #2e2e4e',
        display: 'flex', flexDirection: 'column', gap: 10,
        padding: '20px 12px', zIndex: 10,
      }}>
        <p style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
          Create
        </p>
        {BUTTONS.map(({ type, label, color }) => (
          <button key={type} onClick={() => setOpen(type)} style={{
            background: 'transparent', border: `1px solid ${color}`,
            color, borderRadius: 8, padding: '9px 0',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = color + '22')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            + {label}
          </button>
        ))}
      </div>

      {open === 'character' && <CharacterModal onClose={() => setOpen(null)} onCreated={onCreated} />}
      {open === 'location'  && <LocationModal  onClose={() => setOpen(null)} onCreated={onCreated} />}
      {open === 'group'     && <GroupModal     onClose={() => setOpen(null)} onCreated={onCreated} />}
      {open === 'object'    && <ObjectModal    onClose={() => setOpen(null)} onCreated={onCreated} />}
      {open === 'event'     && <EventModal     onClose={() => setOpen(null)} onCreated={onCreated} />}
    </>
  );
}