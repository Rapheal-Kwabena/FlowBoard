import React, { useState, useEffect } from 'react';
import { Card as CardType, Checklist, ChecklistItem, Label } from '../../types';
import { X, Calendar, User, Repeat, Plus } from 'lucide-react';
import {DayPicker} from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import Confetti from 'react-confetti';
import LabelManager from './LabelManager';

interface CardModalProps {
  card: CardType;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<CardType>) => void;
  onAddLabel: (boardId: string, name: string, color: string) => Promise<Label | undefined>;
  boardLabels: Label[];
}

const CardModal: React.FC<CardModalProps> = ({ card, isOpen, onClose, onUpdate, onAddLabel, boardLabels }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(card.dueDate ? new Date(card.dueDate) : undefined);
  const [recurrenceRule, setRecurrenceRule] = useState(card.recurrenceRule || 'none');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [showNewChecklist, setShowNewChecklist] = useState(false);

  useEffect(() => {
    if (card.checklists.every(c => c.items.every(i => i.completed)) && card.checklists.length > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [card.checklists]);

  const handleSave = () => {
    onUpdate({
      title,
      description: description || undefined,
      dueDate: dueDate?.toISOString(),
      recurrenceRule,
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: Math.random().toString(36).substr(2, 9),
        text: newComment.trim(),
        author: { id: '1', name: 'Current User', email: 'user@example.com' },
        createdAt: new Date().toISOString(),
      };
      onUpdate({
        comments: [...card.comments, comment],
      });
      setNewComment('');
    }
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChecklistTitle.trim()) {
      const checklist: Checklist = {
        id: Math.random().toString(36).substr(2, 9),
        title: newChecklistTitle.trim(),
        items: [],
      };
      onUpdate({
        checklists: [...card.checklists, checklist],
      });
      setNewChecklistTitle('');
      setShowNewChecklist(false);
    }
  };

  const handleToggleChecklistItem = (checklistId: string, itemId: string) => {
    const updatedChecklists = card.checklists.map(checklist => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: checklist.items.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        };
      }
      return checklist;
    });
    onUpdate({ checklists: updatedChecklists });
  };

  const handleAddChecklistItem = (checklistId: string, text: string) => {
    if (!text.trim()) return;
    
    const newItem: ChecklistItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: text.trim(),
      completed: false,
    };

    const updatedChecklists = card.checklists.map(checklist => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: [...checklist.items, newItem],
        };
      }
      return checklist;
    });
    onUpdate({ checklists: updatedChecklists });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {showConfetti && <Confetti />}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            className="text-xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSave}
                placeholder="Add a more detailed description..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Due Date */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <span>{dueDate ? format(dueDate, 'PPP') : 'Select a date'}</span>
                  <Calendar className="w-4 h-4 text-gray-500" />
                </button>
                {showDatePicker && (
                  <div className="absolute z-10 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <DayPicker
                      mode="single"
                      selected={dueDate}
                      onSelect={(date: Date | undefined) => {
                        setDueDate(date);
                        setShowDatePicker(false);
                        handleSave();
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Recurrence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recurrence
                </label>
                <div className="relative">
                  <select
                    value={recurrenceRule}
                    onChange={(e) => setRecurrenceRule(e.target.value)}
                    onBlur={handleSave}
                    className="w-full appearance-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <Repeat className="w-4 h-4 absolute right-3 top-3 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Labels */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Labels</h3>
              <LabelManager
                boardId={card.boardId}
                availableLabels={boardLabels}
                selectedLabels={card.labels || []}
                onAddLabel={onAddLabel}
                onToggleLabel={(labelId: string) => {
                  const updatedLabels = card.labels?.includes(labelId)
                    ? card.labels.filter((id) => id !== labelId)
                    : [...(card.labels || []), labelId];
                  onUpdate({ labels: updatedLabels });
                }}
              />
            </div>

            {/* Checklists */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Checklists</h3>
                <button
                  onClick={() => setShowNewChecklist(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Checklist</span>
                </button>
              </div>

              {showNewChecklist && (
                <form onSubmit={handleAddChecklist} className="mb-4">
                  <input
                    type="text"
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    placeholder="Checklist title"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    autoFocus
                  />
                  <div className="flex space-x-2 mt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewChecklist(false);
                        setNewChecklistTitle('');
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {card.checklists.map((checklist) => (
                <ChecklistComponent
                  key={checklist.id}
                  checklist={checklist}
                  onToggleItem={(itemId) => handleToggleChecklistItem(checklist.id, itemId)}
                  onAddItem={(text) => handleAddChecklistItem(checklist.id, text)}
                />
              ))}
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Comments</h3>
              
              <form onSubmit={handleAddComment} className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Comment
                </button>
              </form>

              <div className="space-y-3">
                {card.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{comment.author.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChecklistComponent: React.FC<{
  checklist: Checklist;
  onToggleItem: (itemId: string) => void;
  onAddItem: (text: string) => void;
}> = ({ checklist, onToggleItem, onAddItem }) => {
  const [newItemText, setNewItemText] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim()) {
      onAddItem(newItemText.trim());
      setNewItemText('');
      setShowAddItem(false);
    }
  };

  const completedCount = checklist.items.filter(item => item.completed).length;
  const progress = checklist.items.length > 0 ? (completedCount / checklist.items.length) * 100 : 0;

  return (
    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">{checklist.title}</h4>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {completedCount}/{checklist.items.length}
        </span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2">
        {checklist.items.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => onToggleItem(item.id)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className={`flex-1 ${item.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {showAddItem ? (
        <form onSubmit={handleSubmit} className="mt-3">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add an item"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            autoFocus
          />
          <div className="flex space-x-2 mt-2">
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddItem(false);
                setNewItemText('');
              }}
              className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddItem(true)}
          className="mt-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add an item</span>
        </button>
      )}
    </div>
  );
};

export default CardModal;