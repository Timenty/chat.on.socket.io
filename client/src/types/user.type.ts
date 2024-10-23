export interface User {
  id: string;
  userName: string;
  tag: string;
  contacts?: string[]; // Array of user tags
}

export interface Contact {
  userName: string;
  tag: string;
  status: 'online' | 'offline';
  lastSeen?: Date;
}
