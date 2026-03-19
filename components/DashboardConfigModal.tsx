import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Modal from './ui/Modal';
import InfoTooltip from './InfoTooltip';
import { DashboardBlock } from '../hooks/useDashboardConfig';

interface Props {
  open: boolean;
  onClose: () => void;
  blocks: DashboardBlock[];
  onUpdateBlocks: (blocks: DashboardBlock[]) => void;
  onToggleBlock: (id: string) => void;
  onReset: () => void;
}

const SortableBlock: React.FC<{ block: DashboardBlock; onToggle: (id: string) => void }> = ({ block, onToggle }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-xl px-3 py-3 flex items-center gap-3">
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 touch-none shrink-0"
        aria-label="Arrastrar bloque"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="19" r="2"/><circle cx="15" cy="19" r="2"/></svg>
      </button>

      <label className="flex items-center gap-2.5 flex-1 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={block.enabled}
          onChange={() => onToggle(block.id)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className={`text-sm font-semibold ${block.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
          {block.label}
        </span>
      </label>

      <InfoTooltip text={block.description} />
    </div>
  );
};

const DashboardConfigModal: React.FC<Props> = ({ open, onClose, blocks, onUpdateBlocks, onToggleBlock, onReset }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      onUpdateBlocks(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const enabledCount = blocks.filter(b => b.enabled).length;

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Personalizar Dashboard</h3>
            <p className="text-xs text-gray-400">Arrastra para reordenar, activa o desactiva bloques</p>
          </div>
        </div>

        <div className="mt-4 mb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{enabledCount} de {blocks.length} activos</span>
          <button
            onClick={onReset}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Restaurar por defecto
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {blocks.map(b => (
                <SortableBlock key={b.id} block={b} onToggle={onToggleBlock} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors active:scale-[0.98]"
        >
          Listo
        </button>
      </div>
    </Modal>
  );
};

export default DashboardConfigModal;
