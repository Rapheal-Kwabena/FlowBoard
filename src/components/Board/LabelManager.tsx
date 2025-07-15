import React, { useState } from 'react';
import { Label } from '../../types';
import { Plus, Tag, X } from 'lucide-react';

interface LabelManagerProps {
  boardId: string;
  availableLabels: Label[];
  selectedLabels: string[];
  onAddLabel: (boardId: string, name: string, color: string) => Promise<Label | undefined>;
  onToggleLabel: (labelId: string) => void;
}

const LabelManager: React.FC<LabelManagerProps> = ({ boardId, availableLabels, selectedLabels, onAddLabel, onToggleLabel }) => {
  const [showNewLabelForm, setShowNewLabelForm] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#cccccc');

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabelName.trim()) {
      await onAddLabel(boardId, newLabelName.trim(), newLabelColor);
      setNewLabelName('');
      setNewLabelColor('#cccccc');
      setShowNewLabelForm(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {availableLabels.map(label => (
          <button
            key={label.id}
            onClick={() => onToggleLabel(label.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              selectedLabels.includes(label.id)
                ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800'
                : ''
            }`}
            style={{ backgroundColor: label.color, color: '#fff' }}
          >
            {label.name}
          </button>
        ))}
      </div>

      {showNewLabelForm ? (
        <form onSubmit={handleCreateLabel} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <input
            type="text"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="Label name"
            className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <input
              type="color"
              value={newLabelColor}
              onChange={(e) => setNewLabelColor(e.target.value)}
              className="w-10 h-10"
            />
            <div className="flex space-x-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button>
              <button type="button" onClick={() => setShowNewLabelForm(false)} className="px-4 py-2">Cancel</button>
            </div>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowNewLabelForm(true)}
          className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
        >
          <Plus className="w-4 h-4" />
          <span>Create a new label</span>
        </button>
      )}
    </div>
  );
};

export default LabelManager;