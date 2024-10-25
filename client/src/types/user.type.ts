export class User {
  id: string;
  userName: string;  // Now contains both username and tag in format "username#tag"
  contacts?: string[];  // Array of full userNames

  constructor(id: string, userName: string, contacts?: string[]) {
    this.id = id;
    this.userName = userName;
    this.contacts = contacts;
  }

  get tag(): string {
    const parts = this.userName.split('#');
    return parts.length > 1 ? parts[1] : '';
  }

  get displayName(): string {
    return this.userName.split('#')[0];
  }
}

export interface Contact {
  userName: string;  // Now contains both username and tag in format "username#tag"
  status: 'online' | 'offline';
  lastSeen?: Date;
}
