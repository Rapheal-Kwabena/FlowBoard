import { useState, useEffect } from 'react';
import { Board, List, Card, Activity } from '../types';
import { useAuth } from '../contexts/AuthContext';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useBoards = () => {
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    if (user) {
      const storedBoards = localStorage.getItem('flowboard_boards');
      if (storedBoards) {
        setBoards(JSON.parse(storedBoards));
      } else {
        // Initialize with sample data
        const sampleBoards: Board[] = [
          {
            id: '1',
            title: 'My First Board',
            description: 'Welcome to FlowBoard!',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            members: [user],
            activity: [],
            lists: [
              {
                id: '1',
                title: 'To Do',
                boardId: '1',
                position: 0,
                cards: [
                  {
                    id: '1',
                    title: 'Welcome to FlowBoard',
                    description: 'This is your first card! Click to edit details.',
                    listId: '1',
                    position: 0,
                    members: [user],
                    checklists: [],
                    comments: [],
                    attachments: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }
                ]
              },
              {
                id: '2',
                title: 'In Progress',
                boardId: '1',
                position: 1,
                cards: []
              },
              {
                id: '3',
                title: 'Done',
                boardId: '1',
                position: 2,
                cards: []
              }
            ]
          }
        ];
        setBoards(sampleBoards);
        localStorage.setItem('flowboard_boards', JSON.stringify(sampleBoards));
      }
    }
  }, [user]);

  const saveBoards = (updatedBoards: Board[]) => {
    setBoards(updatedBoards);
    localStorage.setItem('flowboard_boards', JSON.stringify(updatedBoards));
  };

  const createBoard = (title: string, description?: string) => {
    if (!user) return;

    const newBoard: Board = {
      id: generateId(),
      title,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [user],
      activity: [],
      lists: []
    };

    saveBoards([...boards, newBoard]);
    return newBoard;
  };

  const deleteBoard = (boardId: string) => {
    saveBoards(boards.filter(board => board.id !== boardId));
  };

  const updateBoard = (boardId: string, updates: Partial<Board>) => {
    const updatedBoards = boards.map(board =>
      board.id === boardId
        ? { ...board, ...updates, updatedAt: new Date().toISOString() }
        : board
    );
    saveBoards(updatedBoards);
  };

  const addList = (boardId: string, title: string) => {
    if (!user) return;

    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    const newList: List = {
      id: generateId(),
      title,
      boardId,
      position: board.lists.length,
      cards: []
    };

    const updatedBoard = {
      ...board,
      lists: [...board.lists, newList],
      updatedAt: new Date().toISOString()
    };

    const updatedBoards = boards.map(b => b.id === boardId ? updatedBoard : b);
    saveBoards(updatedBoards);
  };

  const updateList = (boardId: string, listId: string, updates: Partial<List>) => {
    const updatedBoards = boards.map(board =>
      board.id === boardId
        ? {
            ...board,
            lists: board.lists.map(list =>
              list.id === listId ? { ...list, ...updates } : list
            ),
            updatedAt: new Date().toISOString()
          }
        : board
    );
    saveBoards(updatedBoards);
  };

  const deleteList = (boardId: string, listId: string) => {
    const updatedBoards = boards.map(board =>
      board.id === boardId
        ? {
            ...board,
            lists: board.lists.filter(list => list.id !== listId),
            updatedAt: new Date().toISOString()
          }
        : board
    );
    saveBoards(updatedBoards);
  };

  const addCard = (boardId: string, listId: string, title: string) => {
    if (!user) return;

    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    const list = board.lists.find(l => l.id === listId);
    if (!list) return;

    const newCard: Card = {
      id: generateId(),
      title,
      listId,
      position: list.cards.length,
      members: [],
      checklists: [],
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedList = {
      ...list,
      cards: [...list.cards, newCard]
    };

    const updatedBoard = {
      ...board,
      lists: board.lists.map(l => l.id === listId ? updatedList : l),
      updatedAt: new Date().toISOString()
    };

    const updatedBoards = boards.map(b => b.id === boardId ? updatedBoard : b);
    saveBoards(updatedBoards);
  };

  const updateCard = (boardId: string, listId: string, cardId: string, updates: Partial<Card>) => {
    const updatedBoards = boards.map(board =>
      board.id === boardId
        ? {
            ...board,
            lists: board.lists.map(list =>
              list.id === listId
                ? {
                    ...list,
                    cards: list.cards.map(card =>
                      card.id === cardId
                        ? { ...card, ...updates, updatedAt: new Date().toISOString() }
                        : card
                    )
                  }
                : list
            ),
            updatedAt: new Date().toISOString()
          }
        : board
    );
    saveBoards(updatedBoards);
  };

  const moveCard = (boardId: string, dragResult: any) => {
    const { destination, source, draggableId } = dragResult;
    
    if (!destination) return;
    
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    const sourceList = board.lists.find(l => l.id === source.droppableId);
    const destList = board.lists.find(l => l.id === destination.droppableId);
    
    if (!sourceList || !destList) return;

    const card = sourceList.cards.find(c => c.id === draggableId);
    if (!card) return;

    let updatedBoard = { ...board };

    if (source.droppableId === destination.droppableId) {
      // Moving within the same list
      const updatedCards = Array.from(sourceList.cards);
      updatedCards.splice(source.index, 1);
      updatedCards.splice(destination.index, 0, card);

      updatedBoard.lists = board.lists.map(list =>
        list.id === sourceList.id
          ? { ...list, cards: updatedCards.map((c, i) => ({ ...c, position: i })) }
          : list
      );
    } else {
      // Moving between lists
      const sourceCards = Array.from(sourceList.cards);
      const destCards = Array.from(destList.cards);

      sourceCards.splice(source.index, 1);
      const updatedCard = { ...card, listId: destination.droppableId };
      destCards.splice(destination.index, 0, updatedCard);

      updatedBoard.lists = board.lists.map(list => {
        if (list.id === sourceList.id) {
          return { ...list, cards: sourceCards.map((c, i) => ({ ...c, position: i })) };
        }
        if (list.id === destList.id) {
          return { ...list, cards: destCards.map((c, i) => ({ ...c, position: i })) };
        }
        return list;
      });
    }

    updatedBoard.updatedAt = new Date().toISOString();
    const updatedBoards = boards.map(b => b.id === boardId ? updatedBoard : b);
    saveBoards(updatedBoards);
  };

  return {
    boards,
    createBoard,
    deleteBoard,
    updateBoard,
    addList,
    updateList,
    deleteList,
    addCard,
    updateCard,
    moveCard,
  };
};