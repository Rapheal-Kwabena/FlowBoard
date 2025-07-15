import { useState, useEffect, useCallback } from 'react';
import { Board, List, Card, Label } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { pb } from '../lib/pocketbase';
import { RecordModel, ClientResponseError } from 'pocketbase';

const mapRecordToBoard = (record: RecordModel, lists: List[] = [], labels: Label[] = []): Board => ({
  id: record.id,
  title: record.title,
  description: record.description,
  createdAt: record.created,
  updatedAt: record.updated,
  members: [], // This would need more logic to handle relations
  activity: [], // This would need more logic to handle relations
  lists,
  labels,
});

const mapRecordToList = (record: RecordModel, cards: Card[] = []): List => ({
  id: record.id,
  title: record.title,
  boardId: record.board,
  position: record.position,
  cards,
});

const mapRecordToCard = (record: RecordModel): Card => ({
  id: record.id,
  title: record.title,
  description: record.description,
  listId: record.list,
  boardId: record.board,
  position: record.position,
  members: [],
  checklists: [],
  comments: [],
  attachments: [],
  createdAt: record.created,
  updatedAt: record.updated,
  recurrenceRule: record.recurrenceRule,
  labels: record.labels,
});

const mapRecordToLabel = (record: RecordModel): Label => ({
  id: record.id,
  name: record.name,
  color: record.color,
  boardId: record.board,
});

export const useBoards = () => {
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoards = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const boardRecords = await pb.collection('boards').getFullList({
        filter: `user = "${user.id}"`,
        sort: '-created',
      });

      const fetchedBoards = await Promise.all(
        boardRecords.map(async (boardRecord) => {
          const listRecords = await pb.collection('lists').getFullList({
            filter: `board = "${boardRecord.id}"`,
            sort: 'position',
          });

          const lists = await Promise.all(
            listRecords.map(async (listRecord) => {
              const cardRecords = await pb.collection('cards').getFullList({
                filter: `list = "${listRecord.id}"`,
                sort: 'position',
              });
              const cards = cardRecords.map(mapRecordToCard);
              return mapRecordToList(listRecord, cards);
            })
          );
  
          const labelRecords = await pb.collection('labels').getFullList({
            filter: `board = "${boardRecord.id}"`,
          });
          const labels = labelRecords.map(mapRecordToLabel);
  
          return mapRecordToBoard(boardRecord, lists, labels);
        })
      );
      // Update state with fetched boards
      console.log("Logging new boards:", fetchedBoards);

      setBoards(fetchedBoards);
    } catch (error) {
      if (error instanceof ClientResponseError) {
        if (!error.isAbort) {
          console.error('Failed to fetch boards:', error);
        }
      } else {
        console.error('An unexpected error occurred:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const createBoard = async (title: string, description?: string, dueDate?: string) => {
    if (!user) return null;

    try {
      const newBoardRecord = await pb.collection('boards').create({
        title,
        description,
        user: user.id,
      });

      if (dueDate) {
        const list = await pb.collection('lists').create({
          title: 'To Do',
          board: newBoardRecord.id,
          position: 0,
        });

        await pb.collection('cards').create({
          title: 'New Task',
          list: list.id,
          boardId: newBoardRecord.id,
          position: 0,
          dueDate,
        });
      }

      const newBoard = mapRecordToBoard(newBoardRecord);
      setBoards(prev => [newBoard, ...prev]);
      return newBoard;
    } catch (error) {
      console.error('Failed to create board:', error);
      return null;
    }
  };

  const deleteBoard = async (boardId: string) => {
    await pb.collection('boards').delete(boardId);
    setBoards(prev => prev.filter(board => board.id !== boardId));
  };

  const updateBoard = async (boardId: string, updates: Partial<Board>) => {
    const updatedRecord = await pb.collection('boards').update(boardId, updates);
    const updatedBoard = mapRecordToBoard(updatedRecord);
    setBoards(prev => prev.map(b => b.id === boardId ? { ...b, ...updatedBoard } : b));
  };

  const addList = async (boardId: string, title: string) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    const newListRecord = await pb.collection('lists').create({
      title,
      board: boardId,
      position: board.lists.length,
    });

    const newList = mapRecordToList(newListRecord);
    const updatedBoards = boards.map(b =>
      b.id === boardId ? { ...b, lists: [...b.lists, newList] } : b
    );
    setBoards(updatedBoards);
  };

  const updateList = async (_boardId: string, listId: string, updates: Partial<List>) => {
    await pb.collection('lists').update(listId, updates);
    fetchBoards(); // Re-fetch to ensure consistency
  };

  const deleteList = async (_boardId: string, listId: string) => {
    await pb.collection('lists').delete(listId);
    fetchBoards(); // Re-fetch to ensure consistency
  };

  const addCard = async (boardId: string, listId: string, title: string) => {
    const board = boards.find(b => b.id === boardId);
    const list = board?.lists.find(l => l.id === listId);
    if (!list) return;

    const newCardRecord = await pb.collection('cards').create({
      title,
      list: listId,
      position: list.cards.length,
    });

    const newCard = mapRecordToCard(newCardRecord);
    const updatedBoards = boards.map(b =>
      b.id === boardId
        ? {
            ...b,
            lists: b.lists.map(l =>
              l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l
            ),
          }
        : b
    );
    setBoards(updatedBoards);
  };

  const updateCard = async (_boardId: string, _listId: string, cardId: string, updates: Partial<Card>) => {
    await pb.collection('cards').update(cardId, updates);
    fetchBoards(); // Re-fetch to ensure consistency
  };

  const moveCard = async (boardId: string, dragResult: any) => {
    const { destination, source, draggableId } = dragResult;
    if (!destination) return;

    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    const sourceList = board.lists.find(l => l.id === source.droppableId);
    const destList = board.lists.find(l => l.id === destination.droppableId);
    if (!sourceList || !destList) return;

    // Optimistic UI update
    const sourceCards = Array.from(sourceList.cards);
    const [movedCard] = sourceCards.splice(source.index, 1);
    
    let newBoards = [...boards];

    if (source.droppableId === destination.droppableId) {
      sourceCards.splice(destination.index, 0, movedCard);
      newBoards = newBoards.map(b => b.id === boardId ? {
        ...b,
        lists: b.lists.map(l => l.id === source.droppableId ? {...l, cards: sourceCards} : l)
      } : b);
    } else {
      const destCards = Array.from(destList.cards);
      destCards.splice(destination.index, 0, movedCard);
      newBoards = newBoards.map(b => b.id === boardId ? {
        ...b,
        lists: b.lists.map(l => {
          if (l.id === source.droppableId) return {...l, cards: sourceCards};
          if (l.id === destination.droppableId) return {...l, cards: destCards};
          return l;
        })
      } : b);
    }
    setBoards(newBoards);

    // Update backend
    try {
      if (source.droppableId === destination.droppableId) {
        // Reorder within the same list
        await pb.collection('cards').update(draggableId, { position: destination.index });
      } else {
        // Move to a new list
        await pb.collection('cards').update(draggableId, {
          list: destination.droppableId,
          position: destination.index,
        });
      }
      // Optionally re-fetch to ensure data consistency
      await fetchBoards();
    } catch (error) {
      console.error("Failed to move card:", error);
      // Revert optimistic update on error
      fetchBoards();
    }
  };

  const addLabel = async (boardId: string, name: string, color: string) => {
    const newLabelRecord = await pb.collection('labels').create({
      board: boardId,
      name,
      color,
    });
    fetchBoards(); // Re-fetch to ensure consistency
    return mapRecordToLabel(newLabelRecord);
  };

  const fetchBoardById = useCallback(async (boardId: string) => {
    try {
      const boardRecord = await pb.collection('boards').getOne(boardId);
      
      const listRecords = await pb.collection('lists').getFullList({
        filter: `board = "${boardRecord.id}"`,
        sort: 'position',
      });

      const lists = await Promise.all(
        listRecords.map(async (listRecord) => {
          const cardRecords = await pb.collection('cards').getFullList({
            filter: `list = "${listRecord.id}"`,
            sort: 'position',
          });
          const cards = cardRecords.map(mapRecordToCard);
          return mapRecordToList(listRecord, cards);
        })
      );

      const labelRecords = await pb.collection('labels').getFullList({
        filter: `board = "${boardRecord.id}"`,
      });
      const labels = labelRecords.map(mapRecordToLabel);

      return mapRecordToBoard(boardRecord, lists, labels);
    } catch (error) {
      if (error instanceof ClientResponseError) {
        if (!error.isAbort) {
          console.error('Failed to fetch board:', error);
        }
      } else {
        console.error('An unexpected error occurred while fetching the board:', error);
      }
      return null;
    }
  }, []);

  return {
    boards,
    loading,
    fetchBoards,
    fetchBoardById,
    createBoard,
    deleteBoard,
    updateBoard,
    addList,
    updateList,
    deleteList,
    addCard,
    updateCard,
    moveCard,
    addLabel,
  };
};