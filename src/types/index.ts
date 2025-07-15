export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lists: List[];
  members: User[];
  activity: Activity[];
}

export interface List {
  id: string;
  title: string;
  boardId: string;
  position: number;
  cards: Card[];
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  listId: string;
  boardId: string;
  position: number;
  dueDate?: string;
  recurrenceRule?: string;
  labels?: string[];
  members: User[];
  checklists: Checklist[];
  comments: Comment[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  text: string;
  author: User;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Activity {
  id: string;
  type: 'card_moved' | 'card_created' | 'card_updated' | 'list_created' | 'member_added';
  description: string;
  user: User;
  createdAt: string;
  metadata?: any;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}