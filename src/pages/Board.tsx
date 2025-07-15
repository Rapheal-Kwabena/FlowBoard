import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import { useBoards } from '../hooks/useBoards';
import Header from '../components/Layout/Header';
import BoardList from '../components/Board/BoardList';
import CardModal from '../components/Board/CardModal';
import { Plus, ArrowLeft } from 'lucide-react';
import { Card, Board as BoardType } from '../types';

const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { fetchBoardById, addList, updateList, deleteList, addCard, updateCard, moveCard, addLabel } = useBoards();
  const [board, setBoard] = useState<BoardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  useEffect(() => {
    const loadBoard = async () => {
      if (boardId) {
        setLoading(true);
        try {
          const fetchedBoard = await fetchBoardById(boardId);
          setBoard(fetchedBoard);
        } catch (error) {
          console.error('Failed to fetch board:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadBoard();
  }, [boardId, fetchBoardById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Loading board...</h2>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Board not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListTitle.trim()) {
      addList(board.id, newListTitle.trim());
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  const handleDragEnd = (result: any) => {
    moveCard(board.id, result);
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
  };

  const handleCardUpdate = (updates: Partial<Card>) => {
    if (selectedCard) {
      updateCard(board.id, selectedCard.listId, selectedCard.id, updates);
      setSelectedCard({ ...selectedCard, ...updates });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{board.title}</h1>
                {board.description && (
                  <p className="text-gray-600 dark:text-gray-400">{board.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {board.members.map((member) => (
                <img
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-700"
                  title={member.name}
                />
              ))}
            </div>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {board.lists.map((list) => (
                <BoardList
                  key={list.id}
                  list={list}
                  onAddCard={(listId, title) => addCard(board.id, listId, title)}
                  onUpdateList={(listId, title) => updateList(board.id, listId, { title })}
                  onDeleteList={(listId) => deleteList(board.id, listId)}
                  onCardClick={handleCardClick}
                />
              ))}

              {/* Add List */}
              {isAddingList ? (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 w-80 flex-shrink-0">
                  <form onSubmit={handleAddList}>
                    <input
                      type="text"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      placeholder="Enter list title..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      autoFocus
                    />
                    <div className="flex space-x-2 mt-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Add List
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingList(false);
                          setNewListTitle('');
                        }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingList(true)}
                  className="bg-white/20 hover:bg-white/30 dark:bg-gray-700/50 dark:hover:bg-gray-700/70 rounded-xl p-4 w-80 flex-shrink-0 transition-colors flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add a list</span>
                </button>
              )}
            </div>
          </DragDropContext>
        </div>
      </main>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleCardUpdate}
          onAddLabel={addLabel}
          boardLabels={board.labels}
        />
      )}
    </div>
  );
};

export default Board;