import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Board, List, Card, Label } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { pb } from '../lib/pocketbase';
import { RecordModel, ClientResponseError } from 'pocketbase';

// Mapping functions (same as in useBoards.ts)
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
  members: record.members ? (typeof record.members === 'string' ? JSON.parse(record.members) : record.members) : [],
  checklists: record.checklists ? (typeof record.checklists === 'string' ? JSON.parse(record.checklists) : record.checklists) : [],
  comments: record.comments ? (typeof record.comments === 'string' ? JSON.parse(record.comments) : record.comments) : [],
  attachments: record.attachments ? (typeof record.attachments === 'string' ? JSON.parse(record.attachments) : record.attachments) : [],
  createdAt: record.created,
  updatedAt: record.updated,
  dueDate: record.dueDate,
  recurrenceRule: record.recurrenceRule,
  labels: record.labels || [],
});

const mapRecordToLabel = (record: RecordModel): Label => ({
  id: record.id,
  name: record.name,
  color: record.color,
  boardId: record.board,
});

// Query Keys
export const boardKeys = {
  all: ['boards'] as const,
  lists: () => [...boardKeys.all, 'list'] as const,
  list: (filters: string) => [...boardKeys.lists(), { filters }] as const,
  details: () => [...boardKeys.all, 'detail'] as const,
  detail: (id: string) => [...boardKeys.details(), id] as const,
};

// Fetch functions with auto-cancellation handling
const fetchBoards = async (userId: string): Promise<Board[]> => {
  try {
    const boardRecords = await pb.collection('boards').getFullList({
      filter: `user = "${userId}"`,
      sort: '-created',
      requestKey: `boards-${userId}`, // Add request key to prevent auto-cancellation
    });

    const fetchedBoards = await Promise.all(
      boardRecords.map(async (boardRecord) => {
        try {
          const listRecords = await pb.collection('lists').getFullList({
            filter: `board = "${boardRecord.id}"`,
            sort: 'position',
            requestKey: `lists-${boardRecord.id}`,
          });

          const lists = await Promise.all(
            listRecords.map(async (listRecord) => {
              try {
                const cardRecords = await pb.collection('cards').getFullList({
                  filter: `list = "${listRecord.id}"`,
                  sort: 'position',
                  requestKey: `cards-${listRecord.id}`,
                });
                const cards = cardRecords.map(mapRecordToCard);
                return mapRecordToList(listRecord, cards);
              } catch (error: any) {
                // Handle auto-cancellation gracefully
                if (error?.isAbort || error?.message?.includes('autocancelled')) {
                  console.warn(`Cards request for list ${listRecord.id} was cancelled, returning empty array`);
                  return mapRecordToList(listRecord, []);
                }
                throw error;
              }
            })
          );

          const labelRecords = await pb.collection('labels').getFullList({
            filter: `board = "${boardRecord.id}"`,
            requestKey: `labels-${boardRecord.id}`,
          });
          const labels = labelRecords.map(mapRecordToLabel);

          return mapRecordToBoard(boardRecord, lists, labels);
        } catch (error: any) {
          // Handle auto-cancellation gracefully
          if (error?.isAbort || error?.message?.includes('autocancelled')) {
            console.warn(`Board details request for ${boardRecord.id} was cancelled, returning basic board`);
            return mapRecordToBoard(boardRecord, [], []);
          }
          throw error;
        }
      })
    );

    return fetchedBoards;
  } catch (error: any) {
    // Handle auto-cancellation gracefully
    if (error?.isAbort || error?.message?.includes('autocancelled')) {
      console.warn('Boards request was cancelled, returning empty array');
      return [];
    }
    throw error;
  }
};

const fetchBoardById = async (boardId: string): Promise<Board> => {
  try {
    const boardRecord = await pb.collection('boards').getOne(boardId, {
      requestKey: `board-${boardId}`,
    });
    
    const listRecords = await pb.collection('lists').getFullList({
      filter: `board = "${boardRecord.id}"`,
      sort: 'position',
      requestKey: `board-lists-${boardId}`,
    });

    const lists = await Promise.all(
      listRecords.map(async (listRecord) => {
        try {
          const cardRecords = await pb.collection('cards').getFullList({
            filter: `list = "${listRecord.id}"`,
            sort: 'position',
            requestKey: `board-cards-${listRecord.id}`,
          });
          const cards = cardRecords.map(mapRecordToCard);
          return mapRecordToList(listRecord, cards);
        } catch (error: any) {
          // Handle auto-cancellation gracefully
          if (error?.isAbort || error?.message?.includes('autocancelled')) {
            console.warn(`Cards request for list ${listRecord.id} was cancelled, returning empty array`);
            return mapRecordToList(listRecord, []);
          }
          throw error;
        }
      })
    );

    const labelRecords = await pb.collection('labels').getFullList({
      filter: `board = "${boardRecord.id}"`,
      requestKey: `board-labels-${boardId}`,
    });
    const labels = labelRecords.map(mapRecordToLabel);

    return mapRecordToBoard(boardRecord, lists, labels);
  } catch (error: any) {
    // Handle auto-cancellation gracefully
    if (error?.isAbort || error?.message?.includes('autocancelled')) {
      console.warn(`Board ${boardId} request was cancelled`);
      throw new Error('Request was cancelled, please try again');
    }
    throw error;
  }
};

// React Query Hooks
export const useBoards = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: boardKeys.list(user?.id || ''),
    queryFn: () => fetchBoards(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useBoard = (boardId: string) => {
  return useQuery({
    queryKey: boardKeys.detail(boardId),
    queryFn: () => fetchBoardById(boardId),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 2, // 2 minutes for individual boards
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (board not found)
      if (error instanceof ClientResponseError && error.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Mutation hooks
export const useCreateBoard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description, dueDate }: { title: string; description?: string; dueDate?: string }) => {
      if (!user) throw new Error('User not authenticated');

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

      return mapRecordToBoard(newBoardRecord);
    },
    onSuccess: () => {
      // Invalidate and refetch boards list
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (boardId: string) => {
      await pb.collection('boards').delete(boardId);
    },
    onSuccess: (_, boardId) => {
      // Remove the specific board from cache
      queryClient.removeQueries({ queryKey: boardKeys.detail(boardId) });
      // Invalidate boards list
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
};

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boardId, updates }: { boardId: string; updates: Partial<Board> }) => {
      const updatedRecord = await pb.collection('boards').update(boardId, updates);
      return mapRecordToBoard(updatedRecord);
    },
    onSuccess: (updatedBoard) => {
      // Update the specific board in cache
      queryClient.setQueryData(boardKeys.detail(updatedBoard.id), updatedBoard);
      // Invalidate boards list to reflect changes
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
};

export const useAddList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boardId, title }: { boardId: string; title: string }) => {
      // Get current board data to determine position
      const currentBoard = queryClient.getQueryData<Board>(boardKeys.detail(boardId));
      const position = currentBoard?.lists.length || 0;

      const newListRecord = await pb.collection('lists').create({
        title,
        board: boardId,
        position,
      });

      return mapRecordToList(newListRecord);
    },
    onSuccess: (_, { boardId }) => {
      // Invalidate the specific board to refetch with new list
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
};

export const useAddCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boardId, listId, title }: { boardId: string; listId: string; title: string }) => {
      // Get current board data to determine position
      const currentBoard = queryClient.getQueryData<Board>(boardKeys.detail(boardId));
      const list = currentBoard?.lists.find(l => l.id === listId);
      const position = list?.cards.length || 0;

      const newCardRecord = await pb.collection('cards').create({
        title,
        list: listId,
        board: boardId, // Fix: Add missing board field
        position,
      });

      return mapRecordToCard(newCardRecord);
    },
    onSuccess: (_, { boardId }) => {
      // Invalidate the specific board to refetch with new card
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
};

export const useMoveCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boardId,
      cardId,
      sourceListId,
      destinationListId,
      destinationIndex
    }: {
      boardId: string;
      cardId: string;
      sourceListId: string;
      destinationListId: string;
      destinationIndex: number;
    }) => {
      if (sourceListId === destinationListId) {
        // Reorder within the same list
        await pb.collection('cards').update(cardId, { position: destinationIndex });
      } else {
        // Move to a new list
        await pb.collection('cards').update(cardId, {
          list: destinationListId,
          position: destinationIndex,
        });
      }
    },
    onSuccess: (_, { boardId }) => {
      // Invalidate the specific board to refetch with updated card positions
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
};

// Card update hook
export const useUpdateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cardId, updates }: { cardId: string; boardId: string; updates: Partial<Card> }) => {
      // Convert Card updates to PocketBase format
      const pbUpdates: any = {};
      
      if (updates.title !== undefined) pbUpdates.title = updates.title;
      if (updates.description !== undefined) pbUpdates.description = updates.description;
      if (updates.dueDate !== undefined) pbUpdates.dueDate = updates.dueDate;
      if (updates.recurrenceRule !== undefined) pbUpdates.recurrenceRule = updates.recurrenceRule;
      if (updates.labels !== undefined) pbUpdates.labels = updates.labels;
      if (updates.position !== undefined) pbUpdates.position = updates.position;
      
      // Handle complex fields that need JSON serialization
      if (updates.checklists !== undefined) pbUpdates.checklists = JSON.stringify(updates.checklists);
      if (updates.comments !== undefined) pbUpdates.comments = JSON.stringify(updates.comments);
      if (updates.attachments !== undefined) pbUpdates.attachments = JSON.stringify(updates.attachments);
      if (updates.members !== undefined) pbUpdates.members = JSON.stringify(updates.members);

      const updatedRecord = await pb.collection('cards').update(cardId, pbUpdates);
      return mapRecordToCard(updatedRecord);
    },
    onSuccess: (_, { boardId }) => {
      // Invalidate the specific board to refetch with updated card
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
};

// List management hooks
export const useUpdateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listId, updates }: { listId: string; boardId: string; updates: { title?: string; position?: number } }) => {
      const updatedRecord = await pb.collection('lists').update(listId, updates);
      return mapRecordToList(updatedRecord);
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
};

export const useDeleteList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listId }: { listId: string; boardId: string }) => {
      await pb.collection('lists').delete(listId);
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
};

// Label management hooks
export const useCreateLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boardId, name, color }: { boardId: string; name: string; color: string }) => {
      const newLabelRecord = await pb.collection('labels').create({
        name,
        color,
        board: boardId,
      });
      return mapRecordToLabel(newLabelRecord);
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
};

export const useUpdateLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ labelId, updates }: { labelId: string; boardId: string; updates: { name?: string; color?: string } }) => {
      const updatedRecord = await pb.collection('labels').update(labelId, updates);
      return mapRecordToLabel(updatedRecord);
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
};

export const useDeleteLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ labelId }: { labelId: string; boardId: string }) => {
      await pb.collection('labels').delete(labelId);
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
};