import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoards } from '../hooks/useBoards';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import BoardCard from '../components/Dashboard/BoardCard';
import CreateBoardModal from '../components/Dashboard/CreateBoardModal';
import { Plus, Trello } from 'lucide-react';
import AnimatedButton from '../components/Layout/AnimatedButton';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { boards, createBoard, deleteBoard, loading } = useBoards();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreateBoard = async (title: string, description?: string) => {
    const board = await createBoard(title, description);
    if (board) {
      navigate(`/board/${board.id}`);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-16">Loading boards...</div>;
    }

    if (boards.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onDelete={() => deleteBoard(board.id)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-16">
        <Trello className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          No boards yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Create your first board to get started with task management.
        </p>
        <AnimatedButton
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Your First Board</span>
        </AnimatedButton>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your projects and stay organized with FlowBoard.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Boards</h2>
            <AnimatedButton
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Board</span>
            </AnimatedButton>
          </div>
        </div>

        {renderContent()}
      </main>

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBoard}
      />
    </div>
  );
};

export default Dashboard;