import React from 'react';
import { Link } from 'react-router-dom';
import { Board } from '../../types';
import { Calendar, Users, MoreHorizontal, Trash2 } from 'lucide-react';

interface BoardCardProps {
  board: Board;
  onDelete: (boardId: string) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ board, onDelete }) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(board.id);
    setShowMenu(false);
  };

  return (
    <div className="group relative">
      <Link
        to={`/board/${board.id}`}
        className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md dark:shadow-gray-900/20 transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {board.title}
            </h3>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {board.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
              {board.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{board.members.length}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(board.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex -space-x-2">
              {board.members.slice(0, 3).map((member) => (
                <img
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                />
              ))}
              {board.members.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                  +{board.members.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BoardCard;