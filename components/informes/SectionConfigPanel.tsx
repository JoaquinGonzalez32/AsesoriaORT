import React from 'react';
import { SectionConfig } from './reportTypes';

interface Props {
  section: SectionConfig;
  onUpdateTitle: (id: string, title: string) => void;
}

const SectionConfigPanel: React.FC<Props> = ({ section, onUpdateTitle }) => {
  return (
    <div className="px-4 pb-3 pt-1 border-t border-gray-100 bg-gray-50">
      <label className="block text-xs font-semibold text-gray-500 mb-1">Titulo de la seccion</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdateTitle(section.id, e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {section.title !== section.defaultTitle && (
          <button
            onClick={() => onUpdateTitle(section.id, section.defaultTitle)}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            title="Restaurar titulo por defecto"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default SectionConfigPanel;
