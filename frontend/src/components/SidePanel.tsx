import { useState } from 'react';
import CharacterModal from './modals/CharacterModal';
import LocationModal from './modals/LocationModal';
import GroupModal from './modals/GroupModal';
import ObjectModal from './modals/ObjectModal';
import EventModal from './modals/EventModal';
import type { EntityType } from '../types/graph';
import logo from '../assets/logo.png';

interface Props {
  onCreated: () => void;
  hiddenTypes: Set<EntityType>;
  onToggleType: (type: EntityType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

type ModalType = 'character' | 'location' | 'group' | 'object' | 'event' | null;

const ENTITY_BUTTONS: { type: ModalType; label: string; color: string; entityType: EntityType }[] = [
  { type: 'character', label: 'Character', color: '#6366f1', entityType: 'Character' },
  { type: 'location',  label: 'Location',  color: '#10b981', entityType: 'Location'  },
  { type: 'group',     label: 'Group',     color: '#f59e0b', entityType: 'Group'     },
  { type: 'object',    label: 'Object',    color: '#ef4444', entityType: 'Object'    },
  { type: 'event',     label: 'Event',     color: '#ca5cf6', entityType: 'Event'     },
];

export default function SidePanel({ onCreated, hiddenTypes, onToggleType, searchQuery, onSearchChange }: Props) {
  const [open, setOpen] = useState<ModalType>(null);

  return (
    <>
      <div style={{
        position: 'fixed', left: 0, top: 0, height: '100vh',
        width: 160, background: '#12121e', borderRight: '1px solid #2e2e4e',
        display: 'flex', flexDirection: 'column', gap: 11,
        padding: '20px 12px', zIndex: 10, overflowY: 'auto',
      }}>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
            <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <p style={{
            color: '#e2e8f0', fontSize: 30, fontWeight: 700,
            letterSpacing: 0.5, margin: 0, textAlign: 'center', lineHeight: 1.2,
          }}>
            Zeolite
          </p>
        </div>

        <div style={{ height: '1px', background: '#2e2e4e', margin: '2px 0 4px' }} />

        <p style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
          Create
        </p>
        {ENTITY_BUTTONS.map(({ type, label, color }) => (
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

        <div style={{ height: '1px', background: '#2e2e4e', margin: '6px 0' }} />
        <p style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
          Filter
        </p>
        {ENTITY_BUTTONS.map(({ entityType, label, color }) => {
          const hidden = hiddenTypes.has(entityType);
          return (
            <label
              key={entityType}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', userSelect: 'none',
                opacity: hidden ? 0.4 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <span style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                border: `2px solid ${color}`,
                background: hidden ? 'transparent' : color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}>
                {!hidden && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                checked={!hidden}
                onChange={() => onToggleType(entityType)}
                style={{ display: 'none' }}
              />
              <span style={{ color: hidden ? '#6b7280' : color, fontSize: 12, fontWeight: 500 }}>
                {label}
              </span>
            </label>
          );
        })}

        <div style={{ height: '1px', background: '#2e2e4e', margin: '6px 0 4px' }} />

        <div style={{ marginTop: 4 }}>
          <p style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>
            Search
          </p>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search a node…"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#1e1e2e',
                border: searchQuery ? '1px solid #6366f1' : '1px solid #2e2e4e',
                borderRadius: 6,
                color: '#e2e8f0',
                fontSize: 12,
                padding: '7px 26px 7px 10px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
                  padding: 0, fontSize: 13, lineHeight: 1,
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

      </div>

      {open === 'character' && <CharacterModal onClose={() => setOpen(null)} onCreated={onCreated} />}
      {open === 'location'  && <LocationModal  onClose={() => setOpen(null)} onCreated={onCreated} />}
      {open === 'group'     && <GroupModal     onClose={() => setOpen(null)} onCreated={onCreated} />}
      {open === 'object'    && <ObjectModal    onClose={() => setOpen(null)} onCreated={onCreated} />}
      {open === 'event'     && <EventModal     onClose={() => setOpen(null)} onCreated={onCreated} />}
    </>
  );
}