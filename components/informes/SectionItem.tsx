import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionConfig } from './reportTypes';
import SectionConfigPanel from './SectionConfigPanel';
import InfoTooltip from '../InfoTooltip';

interface Props {
  section: SectionConfig;
  onToggle: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
}

const SectionItem: React.FC<Props> = ({ section, onToggle, onUpdateTitle }) => {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 touch-none"
          aria-label="Arrastrar seccion"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="19" r="2"/><circle cx="15" cy="19" r="2"/></svg>
        </button>

        {/* Checkbox */}
        <label className="flex items-center gap-2 flex-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={section.enabled}
            onChange={() => onToggle(section.id)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className={`text-sm font-medium ${section.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
            {section.title}
          </span>
        </label>

        {/* Info tooltip */}
        <InfoTooltip text={section.description} />

        {/* Expand config */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Configurar seccion"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {expanded && (
        <SectionConfigPanel
          section={section}
          onUpdateTitle={onUpdateTitle}
        />
      )}
    </div>
  );
};

export default SectionItem;
