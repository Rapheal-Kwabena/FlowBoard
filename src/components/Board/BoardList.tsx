import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { List } from '../../types';
import BoardCard from './BoardCard';
import { Plus, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';

interface BoardListProps {
  list: List;
  onAddCard: (listId: string, title: string) => void;
  onUpdateList: (listId: string, title: string) => void;
  onDeleteList: (listId: string) => void;
  onCardClick: (card: any) => void;
}

const BoardList: React.FC<BoardListProps> = ({
  list,
  onAddCard,
  onUpdateList,
  onDeleteList,
  onCardClick,
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      onAddCard(list.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleUpdateTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onUpdateList(list.id, editTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 w-80 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        {isEditingTitle ? (
          <form onSubmit={handleUpdateTitle} className="flex-1">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleUpdateTitle}
              className="w-full px-2 py-1 text-lg font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
              autoFocus
            />
          </form>
        ) : (
          <h3
            className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer flex-1"
            onClick={() => setIsEditingTitle(true)}
          >
            {list.title}
          </h3>
        )}
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
              <button
                onClick={() => {
                  setIsEditingTitle(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Rename</span>
              </button>
              <button
                onClick={() => {
                  onDeleteList(list.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <Droppable droppableId={list.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-2 min-h-[2rem] ${
              snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg' : ''
            }`}
          >
            {list.cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                  >
                    <BoardCard
                      card={card}
                      onClick={() => onCardClick(card)}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {isAddingCard ? (
        <form onSubmit={handleAddCard} className="mt-2">
          <textarea
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Enter a title for this card..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex space-x-2 mt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add Card
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingCard(false);
                setNewCardTitle('');
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAddingCard(true)}
          className="w-full mt-2 p-3 text-left text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add a card</span>
        </button>
      )}
    </div>
  );
};

export default BoardList;