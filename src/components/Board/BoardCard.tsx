import React from 'react';
import { Card } from '../../types';
import { Calendar, MessageCircle, Paperclip, CheckSquare, User } from 'lucide-react';

interface BoardCardProps {
  card: Card;
  onClick: () => void;
  isDragging?: boolean;
}

const BoardCard: React.FC<BoardCardProps> = ({ card, onClick, isDragging }) => {
  const completedChecklists = card.checklists.reduce(
    (acc, checklist) => acc + checklist.items.filter(item => item.completed).length,
    0
  );
  const totalChecklists = card.checklists.reduce(
    (acc, checklist) => acc + checklist.items.length,
    0
  );

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-600 ${
        isDragging ? 'rotate-3 shadow-lg' : ''
      }`}
    >
      <h4 className="text-gray-900 dark:text-white font-medium mb-2 leading-tight">
        {card.title}
      </h4>

      {card.description && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {card.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {card.dueDate && (
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{new Date(card.dueDate).toLocaleDateString()}</span>
            </div>
          )}

          {card.comments.length > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-3 h-3" />
              <span>{card.comments.length}</span>
            </div>
          )}

          {card.attachments.length > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <Paperclip className="w-3 h-3" />
              <span>{card.attachments.length}</span>
            </div>
          )}

          {totalChecklists > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <CheckSquare className="w-3 h-3" />
              <span>{completedChecklists}/{totalChecklists}</span>
            </div>
          )}
        </div>

        {card.members.length > 0 && (
          <div className="flex -space-x-1">
            {card.members.slice(0, 2).map((member) => (
              <img
                key={member.id}
                src={member.avatar}
                alt={member.name}
                className="w-5 h-5 rounded-full border border-white dark:border-gray-700"
              />
            ))}
            {card.members.length > 2 && (
              <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 border border-white dark:border-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                +{card.members.length - 2}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardCard;